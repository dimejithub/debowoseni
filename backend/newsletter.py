"""Scheduled journal digest — the hands-off newsletter.

Debo keeps publishing journal posts through the CMS. On the cadence he picks
(off / weekly / fortnightly / monthly) this assembles the posts he has
published since the last send into one email and broadcasts it to the list.

Two deliberate properties:

* It never sends an empty newsletter. If nothing new was published since the
  last issue, the run is skipped and the schedule simply waits for next time.
* It reuses the campaigns pipeline. Each issue creates a real campaign row and
  goes out through deliver_campaign(), so it appears in the Emails history with
  the same unsubscribe handling and open/click tracking as a manual broadcast.

The hourly automation task calls run_if_due(); everything here is best-effort
and never raises into the caller.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Optional

import mailer

logger = logging.getLogger("debowoseni.newsletter")

# Days between issues for each cadence. Kept as whole weeks so an issue always
# lands on the same weekday rather than drifting: monthly = 4 weeks,
# quarterly = 13 weeks.
INTERVAL_DAYS = {"weekly": 7, "biweekly": 14, "monthly": 28, "quarterly": 91}

# An issue lists at most this many posts in full. A long cadence over frequent
# posting (e.g. quarterly with weekly output) can gather more than that — the
# extra are summarised as a single "and more in the journal" link rather than
# dropped, so nothing is lost and the email stays readable.
SHOW_LIMIT = 8

# Hard ceiling on how many posts we even fetch, so the true "new posts" count
# behind the overflow line stays bounded on a very long, very prolific gap.
FETCH_LIMIT = 60


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse(ts: Optional[str]) -> Optional[datetime]:
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:  # noqa: BLE001
        return None


def load_settings(sb) -> dict:
    """The single settings row, with defaults if the table is empty."""
    try:
        rows = (sb.table("newsletter_settings").select("*").eq("id", 1).limit(1).execute()).data or []
        if rows:
            return rows[0]
    except Exception as exc:  # noqa: BLE001
        logger.warning("Newsletter settings load failed: %s", exc)
    return {
        "id": 1,
        "frequency": "off",
        "send_weekday": 3,
        "send_hour": 9,
        "min_posts": 1,
        "intro": None,
        "last_sent_at": None,
    }


def is_due(settings: dict, now: Optional[datetime] = None) -> bool:
    """Should an issue go out in this run?

    Fires on the configured weekday, at or after the configured UTC hour, no
    more often than the cadence allows. Once a send stamps last_sent_at, the
    interval guard keeps it from repeating until the next cycle.
    """
    now = now or _now()
    freq = settings.get("frequency") or "off"
    if freq not in INTERVAL_DAYS:
        return False
    if now.weekday() != int(settings.get("send_weekday", 3)):
        return False
    if now.hour < int(settings.get("send_hour", 9)):
        return False

    last = _parse(settings.get("last_sent_at"))
    if last is None:
        return True
    # -1 gives an hour of slack so a delayed cron never skips a whole cycle.
    return (now.date() - last.date()).days >= INTERVAL_DAYS[freq] - 1


def _window_start(settings: dict, now: datetime) -> datetime:
    """Only count posts published since the last issue (or one cycle back)."""
    last = _parse(settings.get("last_sent_at"))
    if last:
        return last
    return now - timedelta(days=INTERVAL_DAYS.get(settings.get("frequency"), 14))


def new_posts(sb, since: datetime) -> list[dict]:
    """Every post published since `since`, newest first, up to FETCH_LIMIT.

    Returns the full set (not just what an issue shows) so callers can gate on
    the real count and render an accurate overflow line.
    """
    try:
        return (
            sb.table("posts")
            .select("title,slug,excerpt,category,cover_url,published_at")
            .eq("status", "published")
            .gt("published_at", since.isoformat())
            .order("published_at", desc=True)
            .limit(FETCH_LIMIT)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Newsletter post lookup failed: %s", exc)
        return []


def build_issue(settings: dict, posts: list[dict], site_url: str) -> dict:
    """Render the digest markdown. Returns {subject, preheader, body}."""
    site = site_url.rstrip("/")
    total = len(posts)
    shown = posts[:SHOW_LIMIT]
    overflow = total - len(shown)
    lead = posts[0]

    subject = lead["title"] if total == 1 else f"{lead['title']} — and {total - 1} more from the journal"
    preheader = (lead.get("excerpt") or "New writing from Debo Owoseni.")[:140]

    lines: list[str] = []
    intro = (settings.get("intro") or "").strip()
    if intro:
        lines += [intro, ""]
    else:
        lines += ["Here is what is new from the journal since the last note.", ""]

    for i, p in enumerate(shown):
        lines.append(f"## {p['title']}")
        if p.get("category"):
            lines.append(f"*{p['category']}*")
        if p.get("excerpt"):
            lines.append(p["excerpt"].strip())
        lines.append(f"[Read it]({site}/articles/{p['slug']})")
        if i < len(shown) - 1:
            lines += ["", "---", ""]

    if overflow > 0:
        lines += [
            "",
            "---",
            "",
            f"**Plus {overflow} more** published since the last issue — "
            f"[read everything in the journal]({site}/articles).",
        ]

    # A quiet standing close that points at the work, without hard-selling.
    lines += [
        "",
        "---",
        "",
        "If any of this is stirring something, the Life Transformation Enquiry is "
        "where that becomes a plan.",
        "",
        f"[See the pathways]({site}/programmes)",
        "",
        "Debo",
    ]

    return {"subject": subject, "preheader": preheader, "body": "\n".join(lines)}


def run_if_due(sb, deliver_fn: Callable[[str], Any]) -> dict:
    """Entry point for the hourly task. Sends an issue if the schedule says so.

    deliver_fn is the campaign sender (server.deliver_campaign); passing it in
    keeps this module free of a circular import back into the app.
    """
    settings = load_settings(sb)
    now = _now()

    if not is_due(settings, now):
        return {"newsletter": "not_due", "frequency": settings.get("frequency")}

    posts = new_posts(sb, _window_start(settings, now))
    if len(posts) < int(settings.get("min_posts", 1) or 1):
        # Nothing worth sending. Do NOT stamp last_sent_at — otherwise a quiet
        # fortnight would push the next possible issue out by another cycle.
        logger.info("Newsletter due but only %d new posts; skipping.", len(posts))
        return {"newsletter": "skipped_no_content", "new_posts": len(posts)}

    issue = build_issue(settings, posts, mailer.SITE_URL)

    try:
        campaign = (
            sb.table("campaigns")
            .insert(
                {
                    "subject": issue["subject"],
                    "preheader": issue["preheader"],
                    "body": issue["body"],
                    "segment": "all",
                    "status": "sending",
                }
            )
            .execute()
        ).data[0]
    except Exception as exc:  # noqa: BLE001
        logger.warning("Newsletter campaign create failed: %s", exc)
        return {"newsletter": "error", "detail": str(exc)[:200]}

    # Stamp the send time up front so a crash mid-send cannot double-issue.
    try:
        sb.table("newsletter_settings").update({"last_sent_at": now.isoformat()}).eq("id", 1).execute()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Newsletter stamp failed: %s", exc)

    deliver_fn(campaign["id"])
    logger.info("Newsletter issue queued: %s (%d posts).", issue["subject"], len(posts))
    return {"newsletter": "sent", "campaign_id": campaign["id"], "posts": len(posts)}
