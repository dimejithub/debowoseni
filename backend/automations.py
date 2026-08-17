"""Triggered email sequences — the replacement for Systeme.io's rules.

A sequence is a trigger plus an ordered list of emails, each with a delay.
Something happens (a tag is added, someone registers for an event, someone
joins the community); matching sequences enrol that person; a scheduler calls
run_due_steps() periodically and sends whatever has come due.

Two deliberate properties:

* Enrolment is idempotent per (sequence, email). Taking the same quiz twice
  does not start the welcome series twice.
* Sending is driven entirely by `next_send_at`. Nothing is held in memory, so
  a sleeping or restarted web service loses no work — it just sends late.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import mailer

logger = logging.getLogger("debowoseni.automations")

# A single run only ever sends this many emails, so one enormous backlog can
# never hold a request open indefinitely. The next run picks up the remainder.
MAX_SENDS_PER_RUN = 200


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


# ---------------------------------------------------------------------------
# Enrolment
# ---------------------------------------------------------------------------
def matching_sequences(sb, trigger_type: str, trigger_value: Optional[str]) -> list[dict]:
    """Active sequences listening for this trigger.

    A sequence with an empty trigger_value is a wildcard: `event_registered`
    with no value fires for every event, which is what you want for a generic
    "thanks for registering" follow-up.
    """
    try:
        rows = (
            sb.table("sequences")
            .select("*")
            .eq("trigger_type", trigger_type)
            .eq("status", "active")
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Sequence lookup failed: %s", exc)
        return []

    out = []
    for seq in rows:
        want = (seq.get("trigger_value") or "").strip()
        if not want or want == (trigger_value or ""):
            out.append(seq)
    return out


def first_step_delay(sb, sequence_id: str) -> Optional[int]:
    """Delay in days before step 1. None means the sequence has no steps."""
    try:
        rows = (
            sb.table("sequence_steps")
            .select("delay_days")
            .eq("sequence_id", sequence_id)
            .order("position", desc=False)
            .limit(1)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Step lookup failed: %s", exc)
        return None
    return rows[0]["delay_days"] if rows else None


def enrol(sb, sequence: dict, email: str, subscriber_id: Optional[str] = None) -> None:
    """Put one person into one sequence, if they are not already in it."""
    email = (email or "").strip().lower()
    if not email:
        return

    delay = first_step_delay(sb, sequence["id"])
    if delay is None:
        logger.info("Sequence %s has no steps; not enrolling.", sequence.get("name"))
        return

    try:
        existing = (
            sb.table("sequence_enrolments")
            .select("id")
            .eq("sequence_id", sequence["id"])
            .eq("email", email)
            .limit(1)
            .execute()
        ).data or []
        if existing:
            return  # already been through this one

        sb.table("sequence_enrolments").insert(
            {
                "sequence_id": sequence["id"],
                "subscriber_id": subscriber_id,
                "email": email,
                "current_step": 0,
                "next_send_at": _iso(_now() + timedelta(days=delay)),
                "status": "active",
            }
        ).execute()
        logger.info("Enrolled %s in sequence %s", email, sequence.get("name"))
    except Exception as exc:  # noqa: BLE001
        logger.warning("Enrolment failed for %s: %s", email, exc)


def fire(
    sb,
    trigger_type: str,
    email: str,
    trigger_value: Optional[str] = None,
    subscriber_id: Optional[str] = None,
) -> None:
    """Entry point for the rest of the app: something happened, enrol as needed.

    Best-effort by design — an automation problem must never break the sign-up,
    registration or subscribe that triggered it.
    """
    try:
        for seq in matching_sequences(sb, trigger_type, trigger_value):
            enrol(sb, seq, email, subscriber_id)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Trigger %s failed for %s: %s", trigger_type, email, exc)


# ---------------------------------------------------------------------------
# Sending
# ---------------------------------------------------------------------------
def _step_for(sb, sequence_id: str, position: int) -> Optional[dict]:
    try:
        rows = (
            sb.table("sequence_steps")
            .select("*")
            .eq("sequence_id", sequence_id)
            .eq("position", position)
            .limit(1)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Step fetch failed: %s", exc)
        return None
    return rows[0] if rows else None


def _finish(sb, enrolment_id: str, status: str = "completed") -> None:
    try:
        sb.table("sequence_enrolments").update(
            {"status": status, "next_send_at": None, "updated_at": _iso(_now())}
        ).eq("id", enrolment_id).execute()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Closing enrolment %s failed: %s", enrolment_id, exc)


def run_due_steps(sb) -> dict[str, Any]:
    """Send every sequence step that has come due. Returns a small report."""
    now = _now()
    try:
        due = (
            sb.table("sequence_enrolments")
            .select("*")
            .eq("status", "active")
            .lte("next_send_at", _iso(now))
            .order("next_send_at", desc=False)
            .limit(MAX_SENDS_PER_RUN)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Due lookup failed: %s", exc)
        return {"ok": False, "error": str(exc)[:200], "sent": 0, "failed": 0, "skipped": 0}

    sent = failed = skipped = 0

    for enrolment in due:
        step = _step_for(sb, enrolment["sequence_id"], enrolment["current_step"] + 1)
        if not step:
            _finish(sb, enrolment["id"])
            continue

        # Re-read the subscriber at send time: someone who unsubscribed after
        # being enrolled must not receive the rest of the series.
        try:
            subs = (
                sb.table("subscribers")
                .select("*")
                .eq("email", enrolment["email"])
                .limit(1)
                .execute()
            ).data or []
        except Exception as exc:  # noqa: BLE001
            logger.warning("Subscriber re-check failed: %s", exc)
            subs = []

        subscriber = subs[0] if subs else None
        if not subscriber or subscriber.get("status") != "subscribed":
            _finish(sb, enrolment["id"], "cancelled")
            skipped += 1
            continue

        unsub = mailer.unsubscribe_url_for(subscriber.get("unsubscribe_token") or "")
        body = step.get("body") or ""
        result = mailer.send(
            enrolment["email"],
            step.get("subject") or "",
            mailer.render_layout(
                mailer.markdown_to_html(body),
                preheader=step.get("preheader") or "",
                unsubscribe_url=unsub,
            ),
            text=mailer.to_plain_text(body),
            unsubscribe_url=unsub,
        )
        ok = bool(result.get("ok"))
        sent += 1 if ok else 0
        failed += 0 if ok else 1

        try:
            sb.table("sequence_sends").insert(
                {
                    "sequence_id": enrolment["sequence_id"],
                    "step_id": step["id"],
                    "email": enrolment["email"],
                    "subject": step.get("subject"),
                    "status": "sent" if ok else "failed",
                    "provider_id": result.get("id"),
                    "error": result.get("error"),
                }
            ).execute()
        except Exception as exc:  # noqa: BLE001
            logger.warning("Recording sequence send failed: %s", exc)

        # A failed send still advances the series. Retrying forever would hammer
        # a hard-bounced address and drag the sending domain down with it.
        next_step = _step_for(sb, enrolment["sequence_id"], enrolment["current_step"] + 2)
        update: dict[str, Any] = {
            "current_step": enrolment["current_step"] + 1,
            "last_sent_at": _iso(now),
            "updated_at": _iso(now),
        }
        if next_step:
            update["next_send_at"] = _iso(now + timedelta(days=next_step.get("delay_days") or 0))
        else:
            update["status"] = "completed"
            update["next_send_at"] = None

        try:
            sb.table("sequence_enrolments").update(update).eq("id", enrolment["id"]).execute()
        except Exception as exc:  # noqa: BLE001
            logger.warning("Advancing enrolment %s failed: %s", enrolment["id"], exc)

    if due:
        logger.info("Sequence run: %d sent, %d failed, %d skipped.", sent, failed, skipped)

    return {
        "ok": True,
        "due": len(due),
        "sent": sent,
        "failed": failed,
        "skipped": skipped,
        "more": len(due) == MAX_SENDS_PER_RUN,
    }
