"""Transactional + broadcast email for debowoseni.com, via Resend.

Deliberately small: one send function, one batch function, and a house
template so every email that leaves the site looks the same.

If RESEND_API_KEY is unset the module stays in dry-run mode — sends are
logged and reported as skipped rather than raising, so the site keeps working
on a deploy that has no mail configured yet.
"""

from __future__ import annotations

import html as html_lib
import logging
import os
import re
from typing import Iterable, Optional

import httpx

logger = logging.getLogger("debowoseni.mailer")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
RESEND_ENDPOINT = "https://api.resend.com/emails"
RESEND_BATCH_ENDPOINT = "https://api.resend.com/emails/batch"

# "Debo Owoseni <hello@debowoseni.com>" — the domain must be verified in Resend.
MAIL_FROM = os.environ.get("MAIL_FROM", "Debo Owoseni <hello@debowoseni.com>")
MAIL_REPLY_TO = os.environ.get("MAIL_REPLY_TO", "hello@debowoseni.com")
SITE_URL = os.environ.get("PUBLIC_SITE_URL", "https://debowoseni.com").rstrip("/")

# Resend accepts up to 100 messages per batch call.
BATCH_SIZE = 100

enabled = bool(RESEND_API_KEY)
if not enabled:
    logger.warning("RESEND_API_KEY not set — mailer is in dry-run mode.")


# ---------------------------------------------------------------------------
# Body formatting
# ---------------------------------------------------------------------------
# The lookbehind keeps an image `![alt](url)` from being read as a link.
_LINK_RE = re.compile(r"(?<!!)\[([^\]]+)\]\(([^)\s]+)\)")
_BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
_ITALIC_RE = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")
# A standalone image line: ![alt text](https://url). Handled as its own block
# on the RAW text (before escaping) so the URL isn't double-escaped.
_IMAGE_LINE_RE = re.compile(r"^!\[([^\]]*)\]\(([^)\s]+)\)$")


def _img_tag(alt: str, url: str) -> str:
    return (
        f'<img src="{html_lib.escape(url, quote=True)}" '
        f'alt="{html_lib.escape(alt)}" '
        'style="display:block;width:100%;max-width:528px;height:auto;'
        'border-radius:12px;margin:0 auto;" />'
    )


def _inline(text: str) -> str:
    """Escape, then re-apply the small subset of markdown the composer allows."""
    out = html_lib.escape(text)
    out = _LINK_RE.sub(
        r'<a href="\2" style="color:#1c1c1c;text-decoration:underline;">\1</a>', out
    )
    out = _BOLD_RE.sub(r"<strong>\1</strong>", out)
    out = _ITALIC_RE.sub(r"<em>\1</em>", out)
    return out


def markdown_to_html(body: str) -> str:
    """Markdown-lite → email HTML: headings, lists, links, bold/italic, rules.

    Not a general markdown implementation — just enough for someone writing a
    newsletter in a plain textarea, with everything escaped first so a stray
    angle bracket can never break the layout.
    """
    blocks: list[str] = []
    bullets: list[str] = []

    def flush_bullets() -> None:
        if bullets:
            items = "".join(
                f'<li style="margin:0 0 8px;">{_inline(b)}</li>' for b in bullets
            )
            blocks.append(
                f'<ul style="margin:0 0 20px;padding-left:20px;color:#333;'
                f'font-size:16px;line-height:1.7;">{items}</ul>'
            )
            bullets.clear()

    for raw in (body or "").split("\n"):
        line = raw.rstrip()
        stripped = line.strip()

        if not stripped:
            flush_bullets()
            continue

        if stripped.startswith(("- ", "* ")):
            bullets.append(stripped[2:])
            continue

        flush_bullets()

        m_img = _IMAGE_LINE_RE.match(stripped)
        if m_img:
            blocks.append(
                '<p style="margin:0 0 24px;text-align:center;">'
                f"{_img_tag(m_img.group(1), m_img.group(2))}</p>"
            )
            continue

        if stripped in ("---", "***", "___"):
            blocks.append(
                '<hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0;" />'
            )
        elif stripped.startswith("### "):
            blocks.append(
                f'<h3 style="margin:28px 0 10px;font-size:18px;font-weight:600;'
                f'color:#111;">{_inline(stripped[4:])}</h3>'
            )
        elif stripped.startswith("## "):
            blocks.append(
                f'<h2 style="margin:32px 0 12px;font-size:22px;font-weight:600;'
                f'color:#111;">{_inline(stripped[3:])}</h2>'
            )
        elif stripped.startswith("# "):
            blocks.append(
                f'<h1 style="margin:0 0 16px;font-size:26px;font-weight:600;'
                f'color:#111;">{_inline(stripped[2:])}</h1>'
            )
        else:
            blocks.append(
                f'<p style="margin:0 0 18px;color:#333;font-size:16px;'
                f'line-height:1.7;">{_inline(stripped)}</p>'
            )

    flush_bullets()
    return "\n".join(blocks)


def to_plain_text(body: str) -> str:
    """Plain-text alternative. A text part measurably helps inbox placement."""
    out = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", r"[image: \2]", body or "")
    out = _LINK_RE.sub(r"\1 (\2)", out)
    out = _BOLD_RE.sub(r"\1", out)
    out = _ITALIC_RE.sub(r"\1", out)
    out = re.sub(r"^#{1,3}\s+", "", out, flags=re.MULTILINE)
    return out.strip()


def render_layout(
    content_html: str,
    *,
    preheader: str = "",
    unsubscribe_url: Optional[str] = None,
) -> str:
    """Wrap body HTML in the house shell. Table-based — Outlook ignores flexbox."""
    preheader_block = (
        f'<div style="display:none;max-height:0;overflow:hidden;opacity:0;">'
        f"{html_lib.escape(preheader)}</div>"
        if preheader
        else ""
    )
    unsubscribe_block = (
        f'&nbsp;·&nbsp;<a href="{unsubscribe_url}" '
        'style="color:#9a9a9a;text-decoration:underline;">Unsubscribe</a>'
        if unsubscribe_url
        else ""
    )
    font = (
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',"
        "Helvetica,Arial,sans-serif;"
    )
    return f"""<!doctype html>
<html><body style="margin:0;padding:0;background:#eceae6;">
{preheader_block}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceae6;padding:32px 16px;{font}">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <!-- Branded header -->
      <tr><td style="background:#0d1211;padding:24px 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:19px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">
            debo&nbsp;owoseni<span style="color:#bcea3e;">.</span>
          </td>
          <td align="right" style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a938c;">
            Transformation
          </td>
        </tr></table>
      </td></tr>
      <!-- Lime accent rule -->
      <tr><td style="height:3px;background:#bcea3e;font-size:0;line-height:0;">&nbsp;</td></tr>
      <!-- Body -->
      <tr><td style="padding:40px 36px 8px;{font}">
        {content_html}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 36px 34px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="border-top:1px solid #eeeeee;padding-top:22px;">
            <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;line-height:1.5;color:#4a4a4a;">
              A mission to catalyse transformation in one million lives by 2035.
            </p>
            <p style="margin:0 0 16px;font-size:13px;color:#777;">
              <a href="{SITE_URL}/articles" style="color:#1c1c1c;text-decoration:none;font-weight:600;">Journal</a>
              &nbsp;·&nbsp;
              <a href="{SITE_URL}/books" style="color:#1c1c1c;text-decoration:none;font-weight:600;">Books</a>
              &nbsp;·&nbsp;
              <a href="{SITE_URL}/contact" style="color:#1c1c1c;text-decoration:none;font-weight:600;">Get in touch</a>
            </p>
            <p style="margin:0;color:#9a9a9a;font-size:12px;line-height:1.6;">
              You're receiving this because you signed up at
              <a href="{SITE_URL}" style="color:#9a9a9a;">debowoseni.com</a>.
              {unsubscribe_block}
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""


def unsubscribe_url_for(token: str) -> str:
    return f"{SITE_URL}/unsubscribe?token={token}"


# ---------------------------------------------------------------------------
# Sending
# ---------------------------------------------------------------------------
def _headers() -> dict:
    return {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }


def _message(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
    unsubscribe_url: Optional[str] = None,
) -> dict:
    msg: dict = {
        "from": MAIL_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
        "reply_to": MAIL_REPLY_TO,
    }
    if text:
        msg["text"] = text
    if unsubscribe_url:
        # One-click unsubscribe. Gmail and Yahoo require this on bulk mail.
        msg["headers"] = {
            "List-Unsubscribe": f"<{unsubscribe_url}>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
    return msg


def send(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
    unsubscribe_url: Optional[str] = None,
) -> dict:
    """Send one email. Never raises — returns {ok, id|error|skipped}."""
    if not enabled:
        logger.info("[dry-run] would email %s — %s", to, subject)
        return {"ok": True, "skipped": True}
    try:
        r = httpx.post(
            RESEND_ENDPOINT,
            headers=_headers(),
            json=_message(to, subject, html, text, unsubscribe_url),
            timeout=20,
        )
        if r.status_code >= 300:
            logger.warning("Resend %s for %s: %s", r.status_code, to, r.text[:300])
            return {"ok": False, "error": f"{r.status_code}: {r.text[:200]}"}
        return {"ok": True, "id": (r.json() or {}).get("id")}
    except Exception as exc:  # noqa: BLE001 — a failed send must not 500 the caller
        logger.warning("Resend request failed for %s: %s", to, exc)
        return {"ok": False, "error": str(exc)[:200]}


def send_batch(messages: Iterable[dict]) -> list[dict]:
    """Send up to BATCH_SIZE prepared messages in one call.

    Each message comes from build_message(). Returns one result dict per input
    message, in order, so the caller can record per-recipient status.
    """
    batch = list(messages)
    if not batch:
        return []
    if not enabled:
        logger.info("[dry-run] would email %d recipients", len(batch))
        return [{"ok": True, "skipped": True} for _ in batch]
    try:
        r = httpx.post(
            RESEND_BATCH_ENDPOINT, headers=_headers(), json=batch, timeout=60
        )
        if r.status_code >= 300:
            logger.warning("Resend batch %s: %s", r.status_code, r.text[:300])
            err = f"{r.status_code}: {r.text[:200]}"
            return [{"ok": False, "error": err} for _ in batch]
        data = (r.json() or {}).get("data") or []
        return [
            {"ok": True, "id": (data[i] or {}).get("id") if i < len(data) else None}
            for i in range(len(batch))
        ]
    except Exception as exc:  # noqa: BLE001
        logger.warning("Resend batch request failed: %s", exc)
        return [{"ok": False, "error": str(exc)[:200]} for _ in batch]


def build_message(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
    unsubscribe_url: Optional[str] = None,
) -> dict:
    """Prepare a message for send_batch()."""
    return _message(to, subject, html, text, unsubscribe_url)
