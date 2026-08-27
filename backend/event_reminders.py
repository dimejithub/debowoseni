"""Countdown reminders for event registrants.

As an event approaches, everyone who registered gets a short "N days to go"
nudge — at 7, 3, 2 and 1 days out. Unlike the drip sequences in automations.py
(which count forward from the moment someone enrols), these are anchored to the
*event date*: the same target for everyone, so the schedule is identical whether
you registered months ago or this morning.

Design:

* Idempotent. Every send is recorded in `event_reminders(event_id, email,
  days_before)`, which is uniquely constrained — so the hourly scheduler firing
  all day on the milestone day still sends each person exactly one.
* Late-registration friendly. Someone who registers three days out simply picks
  up the 3/2/1 milestones; they never get a stale "7 days to go".
* Best-effort. A mail or database hiccup is logged and skipped, never raised —
  a reminder problem must not take the scheduled task down.
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Any, Optional

import mailer

logger = logging.getLogger("debowoseni.event_reminders")

# When registrants are nudged, in days before the event. Descending only for
# readability — the logic keys off exact day-count matches, not order.
REMINDER_MILESTONES = [7, 3, 2, 1]

# One run sends at most this many reminders, so a large event can never hold the
# scheduled task open indefinitely. The next hourly tick picks up the remainder
# (still the same milestone day, so nothing is missed).
MAX_SENDS_PER_RUN = 300


def _today() -> date:
    return datetime.now(timezone.utc).date()


def _parse_event_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def _when_where(event: dict) -> tuple[str, str]:
    when = " · ".join(
        p for p in (event.get("event_date"), (event.get("start_time") or "")[:5]) if p
    )
    where = event.get("location") or (
        "Online" if event.get("location_type") == "online" else ""
    )
    return when, where


def build_reminder(event: dict, days_before: int, first_name: str) -> tuple[str, str, str]:
    """Return (subject, preheader, markdown_body) for one countdown email."""
    title = event.get("title") or "Your event"
    when, where = _when_where(event)
    unit = "day" if days_before == 1 else "days"
    countdown = f"{days_before} {unit} to go"
    events_url = f"{mailer.SITE_URL}/events"

    lines = [
        f"# {countdown}",
        "",
        f"Hi {first_name or 'there'},",
        "",
        f"Just a quick note that **{title}** is almost here.",
        "",
    ]
    if when:
        lines.append(f"**When:** {when}")
    if where:
        lines.append(f"**Where:** {where}")
    lines += [
        "",
        f"[See the details →]({events_url})",
        "",
        "---",
        "",
        "Looking forward to seeing you there.",
        "",
        "Debo",
    ]
    subject = f"{countdown} — {title}"
    preheader = when or f"{title} is coming up"
    return subject, preheader, "\n".join(lines)


def _registrants(sb, event_id: str) -> list[dict]:
    try:
        return (
            sb.table("event_registrations")
            .select("email,name,status")
            .eq("event_id", event_id)
            .in_("status", ["registered", "attended"])
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Registrant lookup failed for %s: %s", event_id, exc)
        return []


def _already_sent(sb, event_id: str, days_before: int) -> set[str]:
    try:
        rows = (
            sb.table("event_reminders")
            .select("email")
            .eq("event_id", event_id)
            .eq("days_before", days_before)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Reminder history lookup failed for %s: %s", event_id, exc)
        # Fail closed: if we cannot tell what was already sent, send nothing this
        # run rather than risk a duplicate blast.
        return None  # type: ignore[return-value]
    return {(r.get("email") or "").strip().lower() for r in rows}


def _subscribers_by_email(sb, emails: list[str]) -> dict[str, dict]:
    """Map email -> subscriber row, for unsubscribe tokens and opt-out checks."""
    out: dict[str, dict] = {}
    if not emails:
        return out
    try:
        rows = (
            sb.table("subscribers").select("*").in_("email", emails).execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Subscriber lookup failed: %s", exc)
        return out
    for r in rows:
        out[(r.get("email") or "").strip().lower()] = r
    return out


def run_due_reminders(sb) -> dict[str, Any]:
    """Send every countdown reminder that is due right now. Returns a report.

    Called on the same hourly tick as the drip sequences.
    """
    today = _today()
    try:
        events = (
            sb.table("events").select("*").eq("status", "published").execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Event lookup failed: %s", exc)
        return {"ok": False, "error": str(exc)[:200], "sent": 0, "failed": 0, "skipped": 0}

    sent = failed = skipped = 0

    for event in events:
        ev_date = _parse_event_date(event.get("event_date"))
        if not ev_date:
            continue
        days_until = (ev_date - today).days
        if days_until not in REMINDER_MILESTONES:
            continue

        registrants = _registrants(sb, event["id"])
        if not registrants:
            continue

        done = _already_sent(sb, event["id"], days_until)
        if done is None:  # history unreadable — skip this event this run
            continue

        emails = [(r.get("email") or "").strip().lower() for r in registrants]
        subs = _subscribers_by_email(sb, [e for e in emails if e])

        for reg in registrants:
            if sent >= MAX_SENDS_PER_RUN:
                return {
                    "ok": True, "sent": sent, "failed": failed, "skipped": skipped,
                    "more": True,
                }
            email = (reg.get("email") or "").strip().lower()
            if not email or email in done:
                continue

            subscriber = subs.get(email)
            # Respect an explicit opt-out; otherwise a registrant is expected to
            # hear about the event they signed up for.
            if subscriber and subscriber.get("status") == "unsubscribed":
                skipped += 1
                continue

            first_name = (reg.get("name") or "").split(" ")[0]
            subject, preheader, body = build_reminder(event, days_until, first_name)
            unsub = mailer.unsubscribe_url_for(
                subscriber.get("unsubscribe_token") or ""
            ) if subscriber else None

            result = mailer.send(
                email,
                subject,
                mailer.render_layout(
                    mailer.markdown_to_html(body),
                    preheader=preheader,
                    unsubscribe_url=unsub,
                ),
                text=mailer.to_plain_text(body),
                unsubscribe_url=unsub,
            )
            ok = bool(result.get("ok"))
            sent += 1 if ok else 0
            failed += 0 if ok else 1

            # Record the send whether or not it succeeded: a hard-failing address
            # should not be retried every hour for the rest of the milestone day.
            try:
                sb.table("event_reminders").insert(
                    {
                        "event_id": event["id"],
                        "email": email,
                        "days_before": days_until,
                        "status": "sent" if ok else "failed",
                        "provider_id": result.get("id"),
                        "error": result.get("error"),
                    }
                ).execute()
                done.add(email)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Recording reminder for %s failed: %s", email, exc)

    if sent or failed or skipped:
        logger.info(
            "Event reminders: %d sent, %d failed, %d skipped.", sent, failed, skipped
        )

    return {"ok": True, "sent": sent, "failed": failed, "skipped": skipped, "more": False}
