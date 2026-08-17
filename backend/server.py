"""debowoseni.com — FastAPI backend.

Thin admin/forms layer in front of Supabase (Postgres + Auth + Storage).
Public reads (published posts/books/publications/testimonials/events) flow through
this backend; mutations are admin-only with a Supabase JWT.
"""

from __future__ import annotations

import io
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    Form,
    Header,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware
from supabase import Client, create_client
from PIL import Image, ImageOps

import automations
import mailer

# Shared secret for the scheduled task endpoint that drives email sequences.
AUTOMATION_TOKEN = os.environ.get("AUTOMATION_TOKEN", "").strip()

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@debowoseni.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("debowoseni")

sb_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
sb_anon: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

app = FastAPI(title="debowoseni.com API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Auth helper
# ---------------------------------------------------------------------------
def require_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not creds or not creds.credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        result = sb_anon.auth.get_user(creds.credentials)
        if not result or not result.user:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
        return result.user
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Auth verification failed: %s", exc)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from exc


def slugify(text: str) -> str:
    text = (text or "").lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:80] or uuid.uuid4().hex[:8]


def ensure_unique_slug(table: str, slug: str, exclude_id: Optional[str] = None) -> str:
    base = slug
    n = 1
    while True:
        q = sb_admin.table(table).select("id").eq("slug", slug)
        if exclude_id:
            q = q.neq("id", exclude_id)
        res = q.limit(1).execute()
        if not res.data:
            return slug
        n += 1
        slug = f"{base}-{n}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class PostIn(BaseModel):
    title: str
    slug: Optional[str] = None
    category: str = "Transformation"
    excerpt: Optional[str] = ""
    body: Optional[str] = ""
    cover_url: Optional[str] = None
    author_name: str = "Debo Owoseni"
    author_avatar: Optional[str] = None
    status: str = Field(default="draft", pattern="^(draft|published)$")


class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None
    cover_url: Optional[str] = None
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)


class SubscribeIn(BaseModel):
    email: EmailStr
    name: Optional[str] = Field(default=None, max_length=200)
    source: Optional[str] = Field(default=None, max_length=80)
    tags: list[str] = []


class TestimonialIn(BaseModel):
    quote: str
    attribution: str
    role: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str = Field(default="published", pattern="^(draft|published)$")
    sort_order: int = 0


class TestimonialUpdate(BaseModel):
    quote: Optional[str] = None
    attribution: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")
    sort_order: Optional[int] = None


class BookIn(BaseModel):
    title: str
    slug: Optional[str] = None
    one_liner: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    buy_url: Optional[str] = None
    is_featured: bool = False
    status: str = Field(default="published", pattern="^(draft|published)$")
    sort_order: int = 0


class BookUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    one_liner: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    buy_url: Optional[str] = None
    is_featured: Optional[bool] = None
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")
    sort_order: Optional[int] = None


class PublicationIn(BaseModel):
    title: str
    year: Optional[str] = None
    url: Optional[str] = None
    sort_order: int = 0


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    year: Optional[str] = None
    url: Optional[str] = None
    sort_order: Optional[int] = None


class EventIn(BaseModel):
    title: str
    slug: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    gallery: list[str] = []
    location: Optional[str] = None
    location_type: str = "in_person"
    event_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_free: bool = True
    price: Optional[float] = None
    currency: str = "GBP"
    register_url: Optional[str] = None
    registration_open: bool = False
    capacity: Optional[int] = None
    status: str = Field(default="published", pattern="^(draft|published)$")
    sort_order: int = 0


class EventUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    gallery: Optional[list[str]] = None
    location: Optional[str] = None
    location_type: Optional[str] = None
    event_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_free: Optional[bool] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    register_url: Optional[str] = None
    registration_open: Optional[bool] = None
    capacity: Optional[int] = None
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")
    sort_order: Optional[int] = None


class RegistrationIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    notes: Optional[str] = Field(default=None, max_length=2000)


class RegistrationUpdate(BaseModel):
    status: Optional[str] = Field(
        default=None, pattern="^(registered|waitlisted|attended|no_show|cancelled)$"
    )
    notes: Optional[str] = None


class CampaignIn(BaseModel):
    subject: str = Field(min_length=1, max_length=300)
    preheader: Optional[str] = Field(default=None, max_length=300)
    body: str = ""
    segment: str = "all"


class CampaignUpdate(BaseModel):
    subject: Optional[str] = None
    preheader: Optional[str] = None
    body: Optional[str] = None
    segment: Optional[str] = None


class TestSendIn(BaseModel):
    email: EmailStr


class UnsubscribeIn(BaseModel):
    token: str


class CommunityJoinIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    group_key: str = "lte"


class CommunityMemberUpdate(BaseModel):
    status: Optional[str] = Field(default=None, pattern="^(joined|left|removed)$")
    notes: Optional[str] = None


class EnrolmentIn(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    programme: str = Field(min_length=1, max_length=80)
    programme_label: Optional[str] = None
    stage: str = Field(
        default="enquired", pattern="^(enquired|booked|paid|in_progress|completed|cancelled)$"
    )
    amount: Optional[float] = None
    currency: str = "EUR"
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    notes: Optional[str] = None


class EnrolmentUpdate(BaseModel):
    programme: Optional[str] = None
    programme_label: Optional[str] = None
    stage: Optional[str] = Field(
        default=None, pattern="^(enquired|booked|paid|in_progress|completed|cancelled)$"
    )
    amount: Optional[float] = None
    currency: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    notes: Optional[str] = None


class SequenceIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    trigger_type: str = Field(
        default="tag_added",
        pattern="^(tag_added|subscriber_created|event_registered|event_attended|community_joined|manual)$",
    )
    trigger_value: Optional[str] = None
    status: str = Field(default="active", pattern="^(active|paused)$")


class SequenceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = Field(
        default=None,
        pattern="^(tag_added|subscriber_created|event_registered|event_attended|community_joined|manual)$",
    )
    trigger_value: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(active|paused)$")


class SequenceStepIn(BaseModel):
    position: int = 1
    delay_days: int = 0
    subject: str = Field(min_length=1, max_length=300)
    preheader: Optional[str] = None
    body: str = ""


class SequenceStepUpdate(BaseModel):
    position: Optional[int] = None
    delay_days: Optional[int] = None
    subject: Optional[str] = None
    preheader: Optional[str] = None
    body: Optional[str] = None


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------
@api.get("/")
def root():
    return {"ok": True, "service": "debowoseni.com"}


@api.get("/health")
def health():
    out: dict[str, Any] = {"ok": True, "tables": {}, "bucket_ready": False, "error": None}
    for t in (
        "posts",
        "testimonials",
        "books",
        "publications",
        "events",
        "event_registrations",
        "campaigns",
        "campaign_sends",
        "community_members",
        "programme_enrolments",
        "sequences",
        "sequence_steps",
        "sequence_enrolments",
    ):
        try:
            sb_admin.table(t).select("id").limit(1).execute()
            out["tables"][t] = True
        except Exception as exc:
            out["tables"][t] = False
            out["error"] = out["error"] or f"{t}: {exc}"
    try:
        buckets = sb_admin.storage.list_buckets()
        out["bucket_ready"] = any(getattr(b, "name", None) == "blog-images" for b in buckets)
    except Exception as exc:
        out["error"] = out["error"] or str(exc)
    out["schema_ready"] = all(out["tables"].values())
    return out


@api.get("/posts")
def list_published_posts(limit: int = 50):
    res = (
        sb_admin.table("posts").select("*").eq("status", "published")
        .order("published_at", desc=True).limit(min(max(limit, 1), 100)).execute()
    )
    return {"posts": res.data or []}


@api.get("/posts/{slug}")
def get_post(slug: str):
    res = sb_admin.table("posts").select("*").eq("slug", slug).limit(1).execute()
    rows = res.data or []
    if not rows or rows[0].get("status") != "published":
        raise HTTPException(404, "Post not found")
    return rows[0]


@api.get("/testimonials")
def list_testimonials():
    try:
        res = (
            sb_admin.table("testimonials").select("*").eq("status", "published")
            .order("sort_order", desc=False).order("created_at", desc=True).execute()
        )
        return {"testimonials": res.data or []}
    except Exception:
        return {"testimonials": []}


@api.get("/books")
def list_books():
    try:
        res = (
            sb_admin.table("books").select("*").eq("status", "published")
            .order("is_featured", desc=True).order("sort_order", desc=False)
            .order("created_at", desc=True).execute()
        )
        return {"books": res.data or []}
    except Exception:
        return {"books": []}


@api.get("/publications")
def list_publications():
    try:
        res = (
            sb_admin.table("publications").select("*")
            .order("sort_order", desc=False).order("year", desc=True).execute()
        )
        return {"publications": res.data or []}
    except Exception:
        return {"publications": []}


@api.get("/events")
def list_events():
    try:
        res = (
            sb_admin.table("events").select("*").eq("status", "published")
            .order("sort_order", desc=False).order("event_date", desc=True).execute()
        )
        return {"events": res.data or []}
    except Exception:
        return {"events": []}


@api.get("/events/{slug}")
def get_event(slug: str):
    res = sb_admin.table("events").select("*").eq("slug", slug).limit(1).execute()
    rows = res.data or []
    if not rows or rows[0].get("status") != "published":
        raise HTTPException(404, "Event not found")
    return rows[0]


@api.post("/contact")
def submit_contact(payload: ContactIn):
    try:
        sb_admin.table("contact_messages").insert(
            {"name": payload.name, "email": payload.email, "message": payload.message}
        ).execute()
    except Exception as exc:
        logger.warning("Contact insert failed: %s", exc)
        raise HTTPException(500, "Could not save your message right now.") from exc
    return {"ok": True}


def upsert_subscriber(
    email: str,
    name: Optional[str] = None,
    source: Optional[str] = None,
    tags: Optional[list[str]] = None,
) -> Optional[dict]:
    """Add or refresh a subscriber. Returns the stored row, or None on failure.

    Never clobbers an existing name with a blank one, and merges tags rather
    than replacing them so a person who arrives twice keeps both trails.
    """
    email = email.strip().lower()
    try:
        existing = (
            sb_admin.table("subscribers").select("*").eq("email", email).limit(1).execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Subscriber lookup failed: %s", exc)
        existing = []

    row: dict[str, Any] = {"email": email}
    if name:
        row["name"] = name
    if tags:
        merged = set(tags) | set((existing[0].get("tags") or []) if existing else [])
        row["tags"] = sorted(merged)
    if existing:
        # Re-subscribing after an unsubscribe is an explicit opt-in again.
        if existing[0].get("status") == "unsubscribed":
            row["status"] = "subscribed"
            row["unsubscribed_at"] = None
    else:
        row["source"] = source or "website"
        row["status"] = "subscribed"

    try:
        res = sb_admin.table("subscribers").upsert(row, on_conflict="email").execute()
        saved = (res.data or [None])[0]
    except Exception as exc:  # noqa: BLE001
        logger.warning("Subscriber upsert failed: %s", exc)
        return None

    # Fire automations. New subscribers trigger the welcome path; every tag
    # applied triggers its own, so a quiz result can start its own nurture.
    if saved:
        sub_id = saved.get("id")
        if not existing:
            automations.fire(sb_admin, "subscriber_created", email, None, sub_id)
        for tag in tags or []:
            automations.fire(sb_admin, "tag_added", email, tag, sub_id)

    return saved


@api.post("/newsletter")
def subscribe(payload: SubscribeIn):
    row = upsert_subscriber(payload.email, payload.name, payload.source, payload.tags)
    if row is None:
        raise HTTPException(500, "Could not subscribe right now.")
    return {"ok": True}


@api.post("/newsletter/unsubscribe")
def unsubscribe(payload: UnsubscribeIn):
    """Honour an unsubscribe link. Idempotent, and never reveals whether the
    token matched — an invalid token gets the same confirmation."""
    try:
        sb_admin.table("subscribers").update(
            {"status": "unsubscribed", "unsubscribed_at": now_iso()}
        ).eq("unsubscribe_token", payload.token).execute()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Unsubscribe failed: %s", exc)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Public — EVENT REGISTRATION
# ---------------------------------------------------------------------------
def registration_email(event: dict, reg: dict, unsub_url: Optional[str]) -> None:
    """Confirmation email. Best-effort — a mail failure never fails the sign-up."""
    when = " · ".join(
        p for p in (event.get("event_date"), (event.get("start_time") or "")[:5]) if p
    )
    where = event.get("location") or (
        "Online" if event.get("location_type") == "online" else ""
    )
    waitlisted = reg.get("status") == "waitlisted"

    lines = [
        f"# {'You are on the waitlist' if waitlisted else 'You are registered'}",
        "",
        f"Hi {reg.get('name', '').split(' ')[0] or 'there'},",
        "",
        (
            f"Thanks for your interest in **{event.get('title')}**. The room is currently "
            "full, so you are on the waitlist — we will email you the moment a place opens."
            if waitlisted
            else f"Your place at **{event.get('title')}** is confirmed."
        ),
        "",
    ]
    if when:
        lines.append(f"**When:** {when}")
    if where:
        lines.append(f"**Where:** {where}")
    lines += [
        "",
        "---",
        "",
        "If you need to cancel or change anything, just reply to this email.",
        "",
        "Debo",
    ]
    body = "\n".join(lines)
    html = mailer.render_layout(
        mailer.markdown_to_html(body), preheader=f"Your place at {event.get('title')}"
    )
    mailer.send(
        reg["email"],
        f"{'Waitlist' if waitlisted else 'Confirmed'}: {event.get('title')}",
        html,
        text=mailer.to_plain_text(body),
        unsubscribe_url=unsub_url,
    )


@api.post("/events/{slug}/register")
def register_for_event(slug: str, payload: RegistrationIn, background: BackgroundTasks):
    res = sb_admin.table("events").select("*").eq("slug", slug).limit(1).execute()
    rows = res.data or []
    if not rows or rows[0].get("status") != "published":
        raise HTTPException(404, "Event not found")
    event = rows[0]

    if not event.get("registration_open"):
        raise HTTPException(400, "Registration is closed for this event.")

    email = payload.email.strip().lower()

    # Capacity check. A small race is possible here and is fine — an extra
    # person on a 10-seat bootcamp is a conversation, not a bug.
    reg_status = "registered"
    capacity = event.get("capacity")
    if capacity:
        try:
            taken = (
                sb_admin.table("event_registrations")
                .select("id", count="exact")
                .eq("event_id", event["id"])
                .in_("status", ["registered", "attended"])
                .execute()
            )
            if (taken.count or 0) >= capacity:
                reg_status = "waitlisted"
        except Exception as exc:  # noqa: BLE001
            logger.warning("Capacity check failed: %s", exc)

    record = {
        "event_id": event["id"],
        "name": payload.name.strip(),
        "email": email,
        "phone": payload.phone,
        "notes": payload.notes,
        "status": reg_status,
        "source": "website",
        "updated_at": now_iso(),
    }
    try:
        saved = (
            sb_admin.table("event_registrations")
            .upsert(record, on_conflict="event_id,email")
            .execute()
        ).data or [record]
    except Exception as exc:
        logger.warning("Registration insert failed: %s", exc)
        raise HTTPException(500, "Could not save your registration right now.") from exc

    # Registering is also an opt-in to hear from Debo.
    subscriber = upsert_subscriber(
        email, payload.name, source=f"event:{slug}", tags=[f"event:{slug}"]
    )
    unsub = (
        mailer.unsubscribe_url_for(subscriber["unsubscribe_token"])
        if subscriber and subscriber.get("unsubscribe_token")
        else None
    )
    background.add_task(registration_email, event, saved[0], unsub)
    background.add_task(
        automations.fire,
        sb_admin,
        "event_registered",
        email,
        slug,
        subscriber.get("id") if subscriber else None,
    )

    return {"ok": True, "status": reg_status}


# ---------------------------------------------------------------------------
# Public — COMMUNITY
# ---------------------------------------------------------------------------
COMMUNITY_GROUPS = {
    "lte": {
        "label": "The LTE Community",
        "invite_url": os.environ.get("COMMUNITY_LTE_INVITE_URL", ""),
        "channel": "whatsapp",
    },
}


@api.get("/community/{group_key}")
def community_info(group_key: str):
    """Public metadata for a community group — used to show a live member count."""
    group = COMMUNITY_GROUPS.get(group_key)
    if not group:
        raise HTTPException(404, "Unknown community")
    try:
        res = (
            sb_admin.table("community_members")
            .select("id", count="exact")
            .eq("group_key", group_key)
            .eq("status", "joined")
            .execute()
        )
        members = res.count or 0
    except Exception:  # noqa: BLE001
        members = 0
    return {"group_key": group_key, "label": group["label"], "member_count": members}


@api.post("/community/join")
def community_join(payload: CommunityJoinIn, background: BackgroundTasks):
    """Record the join, then hand back the invite link.

    The site owns the membership record; the conversation happens in WhatsApp.
    """
    group = COMMUNITY_GROUPS.get(payload.group_key)
    if not group:
        raise HTTPException(404, "Unknown community")

    email = payload.email.strip().lower()
    subscriber = upsert_subscriber(
        email,
        payload.name,
        source=f"community:{payload.group_key}",
        tags=["community", f"community:{payload.group_key}"],
    )

    try:
        sb_admin.table("community_members").upsert(
            {
                "email": email,
                "name": payload.name.strip(),
                "subscriber_id": subscriber.get("id") if subscriber else None,
                "group_key": payload.group_key,
                "channel": group["channel"],
                "status": "joined",
                "source": "website",
                "left_at": None,
                "updated_at": now_iso(),
            },
            on_conflict="email,group_key",
        ).execute()
    except Exception as exc:
        logger.warning("Community join failed: %s", exc)
        raise HTTPException(500, "Could not record your join right now.") from exc

    background.add_task(
        automations.fire,
        sb_admin,
        "community_joined",
        email,
        payload.group_key,
        subscriber.get("id") if subscriber else None,
    )

    return {"ok": True, "invite_url": group["invite_url"], "label": group["label"]}


# ---------------------------------------------------------------------------
# Admin — POSTS
# ---------------------------------------------------------------------------
@api.get("/admin/me")
def me(user=Depends(require_user)):
    return {"email": user.email, "id": user.id}


@api.get("/admin/subscribers")
def admin_list_subscribers(user=Depends(require_user)):
    res = (
        sb_admin.table("subscribers").select("*")
        .order("created_at", desc=True).execute()
    )
    return {"subscribers": res.data or []}


@api.get("/admin/posts")
def admin_list_posts(user=Depends(require_user)):
    res = sb_admin.table("posts").select("*").order("created_at", desc=True).execute()
    return {"posts": res.data or []}


@api.get("/admin/posts/{post_id}")
def admin_get_post(post_id: str, user=Depends(require_user)):
    res = sb_admin.table("posts").select("*").eq("id", post_id).limit(1).execute()
    rows = res.data or []
    if not rows:
        raise HTTPException(404, "Not found")
    return rows[0]


@api.post("/admin/posts")
def admin_create_post(payload: PostIn, user=Depends(require_user)):
    now = now_iso()
    slug = ensure_unique_slug("posts", payload.slug or slugify(payload.title))
    record = {
        "title": payload.title,
        "slug": slug,
        "category": payload.category or "Transformation",
        "excerpt": payload.excerpt or "",
        "body": payload.body or "",
        "cover_url": payload.cover_url,
        "author_name": payload.author_name or "Debo Owoseni",
        "author_avatar": payload.author_avatar,
        "status": payload.status,
        "published_at": now if payload.status == "published" else None,
        "created_at": now,
        "updated_at": now,
    }
    res = sb_admin.table("posts").insert(record).execute()
    return (res.data or [record])[0]


@api.put("/admin/posts/{post_id}")
def admin_update_post(post_id: str, payload: PostUpdate, user=Depends(require_user)):
    current = sb_admin.table("posts").select("*").eq("id", post_id).limit(1).execute()
    if not current.data:
        raise HTTPException(404, "Not found")
    existing = current.data[0]
    update = payload.model_dump(exclude_unset=True)
    if "slug" in update and update["slug"]:
        update["slug"] = ensure_unique_slug("posts", slugify(update["slug"]), exclude_id=post_id)
    if update.get("status") == "published" and not existing.get("published_at"):
        update["published_at"] = now_iso()
    update["updated_at"] = now_iso()
    res = sb_admin.table("posts").update(update).eq("id", post_id).execute()
    return (res.data or [{}])[0]


@api.delete("/admin/posts/{post_id}")
def admin_delete_post(post_id: str, user=Depends(require_user)):
    sb_admin.table("posts").delete().eq("id", post_id).execute()
    return {"ok": True}


# ---------------------------------------------------------------------------
# Admin — Generic resource factory for testimonials / books / publications / events
# ---------------------------------------------------------------------------
def _admin_list(table: str):
    res = sb_admin.table(table).select("*").order("created_at", desc=True).execute()
    return res.data or []


def _admin_get(table: str, item_id: str):
    res = sb_admin.table(table).select("*").eq("id", item_id).limit(1).execute()
    rows = res.data or []
    if not rows:
        raise HTTPException(404, "Not found")
    return rows[0]


_TABLES_WITHOUT_UPDATED_AT = {"publications"}


def _admin_insert(table: str, payload: dict):
    extras = {"created_at": now_iso()}
    if table not in _TABLES_WITHOUT_UPDATED_AT:
        extras["updated_at"] = now_iso()
    payload = {**payload, **extras}
    res = sb_admin.table(table).insert(payload).execute()
    return (res.data or [payload])[0]


def _admin_update(table: str, item_id: str, payload: dict):
    if table not in _TABLES_WITHOUT_UPDATED_AT:
        payload = {**payload, "updated_at": now_iso()}
    res = sb_admin.table(table).update(payload).eq("id", item_id).execute()
    return (res.data or [{}])[0]


def _admin_delete(table: str, item_id: str):
    sb_admin.table(table).delete().eq("id", item_id).execute()
    return {"ok": True}


# TESTIMONIALS
@api.get("/admin/testimonials")
def admin_list_testimonials(user=Depends(require_user)):
    return {"testimonials": _admin_list("testimonials")}


@api.post("/admin/testimonials")
def admin_create_testimonial(payload: TestimonialIn, user=Depends(require_user)):
    return _admin_insert("testimonials", payload.model_dump())


@api.put("/admin/testimonials/{item_id}")
def admin_update_testimonial(item_id: str, payload: TestimonialUpdate, user=Depends(require_user)):
    return _admin_update("testimonials", item_id, payload.model_dump(exclude_unset=True))


@api.delete("/admin/testimonials/{item_id}")
def admin_delete_testimonial(item_id: str, user=Depends(require_user)):
    return _admin_delete("testimonials", item_id)


# BOOKS
@api.get("/admin/books")
def admin_list_books(user=Depends(require_user)):
    return {"books": _admin_list("books")}


@api.post("/admin/books")
def admin_create_book(payload: BookIn, user=Depends(require_user)):
    data = payload.model_dump()
    data["slug"] = ensure_unique_slug("books", data.get("slug") or slugify(payload.title))
    return _admin_insert("books", data)


@api.put("/admin/books/{item_id}")
def admin_update_book(item_id: str, payload: BookUpdate, user=Depends(require_user)):
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"]:
        data["slug"] = ensure_unique_slug("books", slugify(data["slug"]), exclude_id=item_id)
    return _admin_update("books", item_id, data)


@api.delete("/admin/books/{item_id}")
def admin_delete_book(item_id: str, user=Depends(require_user)):
    return _admin_delete("books", item_id)


# PUBLICATIONS
@api.get("/admin/publications")
def admin_list_publications(user=Depends(require_user)):
    return {"publications": _admin_list("publications")}


@api.post("/admin/publications")
def admin_create_publication(payload: PublicationIn, user=Depends(require_user)):
    return _admin_insert("publications", payload.model_dump())


@api.put("/admin/publications/{item_id}")
def admin_update_publication(item_id: str, payload: PublicationUpdate, user=Depends(require_user)):
    return _admin_update("publications", item_id, payload.model_dump(exclude_unset=True))


@api.delete("/admin/publications/{item_id}")
def admin_delete_publication(item_id: str, user=Depends(require_user)):
    return _admin_delete("publications", item_id)


# EVENTS
@api.get("/admin/events")
def admin_list_events(user=Depends(require_user)):
    return {"events": _admin_list("events")}


@api.post("/admin/events")
def admin_create_event(payload: EventIn, user=Depends(require_user)):
    data = payload.model_dump()
    data["slug"] = ensure_unique_slug("events", data.get("slug") or slugify(payload.title))
    return _admin_insert("events", data)


@api.put("/admin/events/{item_id}")
def admin_update_event(item_id: str, payload: EventUpdate, user=Depends(require_user)):
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"]:
        data["slug"] = ensure_unique_slug("events", slugify(data["slug"]), exclude_id=item_id)
    return _admin_update("events", item_id, data)


@api.delete("/admin/events/{item_id}")
def admin_delete_event(item_id: str, user=Depends(require_user)):
    return _admin_delete("events", item_id)


# ---------------------------------------------------------------------------
# Admin — EVENT REGISTRATIONS
# ---------------------------------------------------------------------------
@api.get("/admin/registrations")
def admin_list_registrations(event_id: Optional[str] = None, user=Depends(require_user)):
    """Every registration, newest first, with its event title joined in."""
    try:
        q = sb_admin.table("event_registrations").select("*")
        if event_id:
            q = q.eq("event_id", event_id)
        rows = (q.order("created_at", desc=True).execute()).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Registration list failed: %s", exc)
        return {"registrations": []}

    try:
        events = (sb_admin.table("events").select("id,title,slug,event_date").execute()).data or []
        by_id = {e["id"]: e for e in events}
        for r in rows:
            ev = by_id.get(r.get("event_id")) or {}
            r["event_title"] = ev.get("title")
            r["event_slug"] = ev.get("slug")
            r["event_date"] = ev.get("event_date")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Registration event join failed: %s", exc)

    return {"registrations": rows}


@api.put("/admin/registrations/{item_id}")
def admin_update_registration(
    item_id: str, payload: RegistrationUpdate, user=Depends(require_user)
):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    data["updated_at"] = now_iso()
    return _admin_update("event_registrations", item_id, data)


@api.delete("/admin/registrations/{item_id}")
def admin_delete_registration(item_id: str, user=Depends(require_user)):
    return _admin_delete("event_registrations", item_id)


# ---------------------------------------------------------------------------
# Admin — CAMPAIGNS (the mailing system)
# ---------------------------------------------------------------------------
def resolve_segment(segment: str) -> list[dict]:
    """Turn a segment string into the subscribers it selects.

    'all'            — everyone still subscribed
    'tag:<name>'     — subscribers carrying that tag (e.g. tag:event:mens-night)
    'source:<name>'  — subscribers captured by a given form
    """
    q = sb_admin.table("subscribers").select("*").eq("status", "subscribed")
    if segment.startswith("tag:"):
        q = q.contains("tags", [segment[4:]])
    elif segment.startswith("source:"):
        q = q.eq("source", segment[7:])
    try:
        return (q.execute()).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Segment resolve failed: %s", exc)
        return []


@api.get("/admin/campaigns")
def admin_list_campaigns(user=Depends(require_user)):
    return {"campaigns": _admin_list("campaigns")}


@api.get("/admin/campaigns/{item_id}")
def admin_get_campaign(item_id: str, user=Depends(require_user)):
    campaign = _admin_get("campaigns", item_id)
    try:
        sends = (
            sb_admin.table("campaign_sends")
            .select("*")
            .eq("campaign_id", item_id)
            .execute()
        ).data or []
    except Exception:  # noqa: BLE001
        sends = []
    campaign["sends"] = sends
    return campaign


@api.post("/admin/campaigns")
def admin_create_campaign(payload: CampaignIn, user=Depends(require_user)):
    return _admin_insert("campaigns", payload.model_dump())


@api.put("/admin/campaigns/{item_id}")
def admin_update_campaign(item_id: str, payload: CampaignUpdate, user=Depends(require_user)):
    current = _admin_get("campaigns", item_id)
    if current.get("status") == "sent":
        raise HTTPException(400, "This campaign has already been sent.")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return _admin_update("campaigns", item_id, data)


@api.delete("/admin/campaigns/{item_id}")
def admin_delete_campaign(item_id: str, user=Depends(require_user)):
    return _admin_delete("campaigns", item_id)


@api.get("/admin/campaigns/{item_id}/preview")
def admin_preview_campaign(item_id: str, user=Depends(require_user)):
    campaign = _admin_get("campaigns", item_id)
    html = mailer.render_layout(
        mailer.markdown_to_html(campaign.get("body") or ""),
        preheader=campaign.get("preheader") or "",
        unsubscribe_url=f"{mailer.SITE_URL}/unsubscribe?token=preview",
    )
    recipients = resolve_segment(campaign.get("segment") or "all")
    return {"html": html, "recipient_count": len(recipients)}


@api.post("/admin/campaigns/{item_id}/test")
def admin_test_campaign(item_id: str, payload: TestSendIn, user=Depends(require_user)):
    campaign = _admin_get("campaigns", item_id)
    body = campaign.get("body") or ""
    html = mailer.render_layout(
        mailer.markdown_to_html(body),
        preheader=campaign.get("preheader") or "",
        unsubscribe_url=f"{mailer.SITE_URL}/unsubscribe?token=preview",
    )
    result = mailer.send(
        payload.email,
        f"[TEST] {campaign.get('subject')}",
        html,
        text=mailer.to_plain_text(body),
    )
    if not result.get("ok"):
        raise HTTPException(502, result.get("error") or "Test send failed.")
    return {"ok": True, "dry_run": bool(result.get("skipped"))}


def deliver_campaign(campaign_id: str) -> None:
    """Send a campaign in the background, recording per-recipient status.

    Runs after the HTTP response so a few thousand recipients never block the
    admin's browser. Each recipient gets their own unsubscribe link.
    """
    try:
        campaign = (
            sb_admin.table("campaigns").select("*").eq("id", campaign_id).limit(1).execute()
        ).data[0]
    except Exception as exc:  # noqa: BLE001
        logger.warning("Campaign %s vanished before send: %s", campaign_id, exc)
        return

    recipients = resolve_segment(campaign.get("segment") or "all")
    body = campaign.get("body") or ""
    content_html = mailer.markdown_to_html(body)
    text = mailer.to_plain_text(body)
    subject = campaign.get("subject") or ""
    preheader = campaign.get("preheader") or ""

    sent = failed = 0

    for start in range(0, len(recipients), mailer.BATCH_SIZE):
        chunk = recipients[start : start + mailer.BATCH_SIZE]
        messages = []
        for sub in chunk:
            unsub = mailer.unsubscribe_url_for(sub.get("unsubscribe_token") or "")
            messages.append(
                mailer.build_message(
                    sub["email"],
                    subject,
                    mailer.render_layout(
                        content_html, preheader=preheader, unsubscribe_url=unsub
                    ),
                    text=text,
                    unsubscribe_url=unsub,
                )
            )

        results = mailer.send_batch(messages)
        rows = []
        for sub, result in zip(chunk, results):
            ok = result.get("ok")
            sent += 1 if ok else 0
            failed += 0 if ok else 1
            rows.append(
                {
                    "campaign_id": campaign_id,
                    "subscriber_id": sub.get("id"),
                    "email": sub["email"],
                    "status": "sent" if ok else "failed",
                    "provider_id": result.get("id"),
                    "error": result.get("error"),
                    "sent_at": now_iso() if ok else None,
                    "updated_at": now_iso(),
                }
            )
        try:
            sb_admin.table("campaign_sends").upsert(
                rows, on_conflict="campaign_id,email"
            ).execute()
            sb_admin.table("subscribers").update({"last_emailed_at": now_iso()}).in_(
                "id", [s["id"] for s in chunk if s.get("id")]
            ).execute()
        except Exception as exc:  # noqa: BLE001
            logger.warning("Recording sends failed: %s", exc)

    try:
        sb_admin.table("campaigns").update(
            {
                "status": "sent" if failed < len(recipients) or not recipients else "failed",
                "recipient_count": len(recipients),
                "sent_count": sent,
                "failed_count": failed,
                "sent_at": now_iso(),
                "updated_at": now_iso(),
            }
        ).eq("id", campaign_id).execute()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Campaign status update failed: %s", exc)

    logger.info("Campaign %s: %d sent, %d failed.", campaign_id, sent, failed)


@api.post("/admin/campaigns/{item_id}/send")
def admin_send_campaign(item_id: str, background: BackgroundTasks, user=Depends(require_user)):
    campaign = _admin_get("campaigns", item_id)
    if campaign.get("status") in ("sending", "sent"):
        raise HTTPException(400, "This campaign has already been sent.")
    if not (campaign.get("body") or "").strip():
        raise HTTPException(400, "Write the email before sending it.")

    recipients = resolve_segment(campaign.get("segment") or "all")
    if not recipients:
        raise HTTPException(400, "That segment has no subscribers.")

    _admin_update(
        "campaigns",
        item_id,
        {"status": "sending", "recipient_count": len(recipients)},
    )
    background.add_task(deliver_campaign, item_id)
    return {"ok": True, "recipient_count": len(recipients)}


# ---------------------------------------------------------------------------
# Admin — SEQUENCES (automations)
# ---------------------------------------------------------------------------
@api.get("/admin/sequences")
def admin_list_sequences(user=Depends(require_user)):
    seqs = _admin_list("sequences")
    # Attach step and enrolment counts so the list page is useful on its own.
    for s in seqs:
        s["step_count"] = _count("sequence_steps", sequence_id=s["id"])
        s["active_count"] = _count("sequence_enrolments", sequence_id=s["id"], status="active")
        s["completed_count"] = _count(
            "sequence_enrolments", sequence_id=s["id"], status="completed"
        )
    return {"sequences": seqs}


@api.get("/admin/sequences/{item_id}")
def admin_get_sequence(item_id: str, user=Depends(require_user)):
    sequence = _admin_get("sequences", item_id)
    try:
        sequence["steps"] = (
            sb_admin.table("sequence_steps")
            .select("*")
            .eq("sequence_id", item_id)
            .order("position", desc=False)
            .execute()
        ).data or []
    except Exception:  # noqa: BLE001
        sequence["steps"] = []
    sequence["active_count"] = _count("sequence_enrolments", sequence_id=item_id, status="active")
    return sequence


@api.post("/admin/sequences")
def admin_create_sequence(payload: SequenceIn, user=Depends(require_user)):
    return _admin_insert("sequences", payload.model_dump())


@api.put("/admin/sequences/{item_id}")
def admin_update_sequence(item_id: str, payload: SequenceUpdate, user=Depends(require_user)):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return _admin_update("sequences", item_id, data)


@api.delete("/admin/sequences/{item_id}")
def admin_delete_sequence(item_id: str, user=Depends(require_user)):
    return _admin_delete("sequences", item_id)


@api.post("/admin/sequences/{item_id}/steps")
def admin_create_step(item_id: str, payload: SequenceStepIn, user=Depends(require_user)):
    data = payload.model_dump()
    data["sequence_id"] = item_id
    return _admin_insert("sequence_steps", data)


@api.put("/admin/sequences/steps/{step_id}")
def admin_update_step(step_id: str, payload: SequenceStepUpdate, user=Depends(require_user)):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return _admin_update("sequence_steps", step_id, data)


@api.delete("/admin/sequences/steps/{step_id}")
def admin_delete_step(step_id: str, user=Depends(require_user)):
    return _admin_delete("sequence_steps", step_id)


@api.post("/admin/sequences/{item_id}/run")
def admin_run_sequences(item_id: str, user=Depends(require_user)):
    """Manual 'send anything due now' — useful for testing without waiting."""
    return automations.run_due_steps(sb_admin)


# ---------------------------------------------------------------------------
# Scheduled task endpoint
#
# Render's free and starter web services have no cron, so an external
# scheduler (see .github/workflows/run-automations.yml) calls this on a
# timer. It doubles as a keep-warm ping for the backend.
# ---------------------------------------------------------------------------
@api.post("/tasks/run-sequences")
def run_sequences_task(x_task_token: Optional[str] = Header(default=None)):
    if not AUTOMATION_TOKEN:
        raise HTTPException(503, "AUTOMATION_TOKEN is not configured.")
    if x_task_token != AUTOMATION_TOKEN:
        raise HTTPException(401, "Bad task token")
    return automations.run_due_steps(sb_admin)


# ---------------------------------------------------------------------------
# Admin — COMMUNITY
# ---------------------------------------------------------------------------
@api.get("/admin/community")
def admin_list_community(user=Depends(require_user)):
    try:
        rows = (
            sb_admin.table("community_members")
            .select("*")
            .order("joined_at", desc=True)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Community list failed: %s", exc)
        rows = []
    return {"members": rows}


@api.put("/admin/community/{item_id}")
def admin_update_community(
    item_id: str, payload: CommunityMemberUpdate, user=Depends(require_user)
):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if data.get("status") == "joined":
        data["left_at"] = None
    elif data.get("status") in ("left", "removed"):
        data["left_at"] = now_iso()
    data["updated_at"] = now_iso()
    return _admin_update("community_members", item_id, data)


@api.delete("/admin/community/{item_id}")
def admin_delete_community(item_id: str, user=Depends(require_user)):
    return _admin_delete("community_members", item_id)


# ---------------------------------------------------------------------------
# Admin — PROGRAMME ENROLMENTS
# ---------------------------------------------------------------------------
@api.get("/admin/enrolments")
def admin_list_enrolments(user=Depends(require_user)):
    try:
        rows = (
            sb_admin.table("programme_enrolments")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Enrolment list failed: %s", exc)
        rows = []
    return {"enrolments": rows}


@api.post("/admin/enrolments")
def admin_create_enrolment(payload: EnrolmentIn, user=Depends(require_user)):
    data = payload.model_dump()
    data["email"] = data["email"].strip().lower()
    # Keep the person on the mailing list in step with their programme record.
    subscriber = upsert_subscriber(
        data["email"], data.get("name"), source="programme", tags=[f"programme:{data['programme']}"]
    )
    if subscriber:
        data["subscriber_id"] = subscriber.get("id")
    return _admin_insert("programme_enrolments", data)


@api.put("/admin/enrolments/{item_id}")
def admin_update_enrolment(item_id: str, payload: EnrolmentUpdate, user=Depends(require_user)):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    data["updated_at"] = now_iso()
    return _admin_update("programme_enrolments", item_id, data)


@api.delete("/admin/enrolments/{item_id}")
def admin_delete_enrolment(item_id: str, user=Depends(require_user)):
    return _admin_delete("programme_enrolments", item_id)


# ---------------------------------------------------------------------------
# Admin — PEOPLE (the CRM)
# ---------------------------------------------------------------------------
def _rows(table: str, **filters) -> list[dict]:
    try:
        q = sb_admin.table(table).select("*")
        for col, val in filters.items():
            q = q.eq(col, val)
        return (q.execute()).data or []
    except Exception as exc:  # noqa: BLE001
        logger.warning("Read of %s failed: %s", table, exc)
        return []


@api.get("/admin/people")
def admin_list_people(user=Depends(require_user)):
    """One row per person, with the counts that make the list scannable.

    Email is the join key — it is the only identifier every capture point has.
    """
    subscribers = _rows("subscribers")
    people: dict[str, dict] = {}
    for s in subscribers:
        email = (s.get("email") or "").lower()
        if not email:
            continue
        people[email] = {
            "email": email,
            "name": s.get("name"),
            "status": s.get("status"),
            "source": s.get("source"),
            "tags": s.get("tags") or [],
            "created_at": s.get("created_at"),
            "last_emailed_at": s.get("last_emailed_at"),
            "registrations": 0,
            "attended": 0,
            "enrolments": 0,
            "in_community": False,
        }

    def bucket(email: str) -> Optional[dict]:
        """People who never subscribed still deserve a row."""
        email = (email or "").lower()
        if not email:
            return None
        if email not in people:
            people[email] = {
                "email": email,
                "name": None,
                "status": "not_subscribed",
                "source": None,
                "tags": [],
                "created_at": None,
                "last_emailed_at": None,
                "registrations": 0,
                "attended": 0,
                "enrolments": 0,
                "in_community": False,
            }
        return people[email]

    for r in _rows("event_registrations"):
        p = bucket(r.get("email"))
        if p:
            p["registrations"] += 1
            if r.get("status") == "attended":
                p["attended"] += 1
            p["name"] = p["name"] or r.get("name")

    for e in _rows("programme_enrolments"):
        p = bucket(e.get("email"))
        if p:
            p["enrolments"] += 1
            p["name"] = p["name"] or e.get("name")

    for c in _rows("community_members", status="joined"):
        p = bucket(c.get("email"))
        if p:
            p["in_community"] = True
            p["name"] = p["name"] or c.get("name")

    ordered = sorted(people.values(), key=lambda p: p.get("created_at") or "", reverse=True)
    return {"people": ordered}


@api.get("/admin/people/{email}")
def admin_get_person(email: str, user=Depends(require_user)):
    """Everything known about one person, as a single merged timeline."""
    email = email.strip().lower()

    subs = _rows("subscribers", email=email)
    subscriber = subs[0] if subs else None

    registrations = _rows("event_registrations", email=email)
    enrolments = _rows("programme_enrolments", email=email)
    community = _rows("community_members", email=email)
    messages = _rows("contact_messages", email=email)
    broadcasts = _rows("campaign_sends", email=email)
    automated = _rows("sequence_sends", email=email)

    # Resolve the names the timeline needs, in two queries rather than N.
    events = {e["id"]: e for e in _rows("events")}
    campaigns = {c["id"]: c for c in _rows("campaigns")}

    timeline: list[dict] = []

    def add(at: Optional[str], kind: str, title: str, detail: str = "") -> None:
        if at:
            timeline.append({"at": at, "kind": kind, "title": title, "detail": detail})

    if subscriber:
        add(
            subscriber.get("created_at"),
            "subscribed",
            "Joined the mailing list",
            f"via {subscriber.get('source') or 'website'}",
        )
        if subscriber.get("unsubscribed_at"):
            add(subscriber["unsubscribed_at"], "unsubscribed", "Unsubscribed")

    for r in registrations:
        ev = events.get(r.get("event_id")) or {}
        add(
            r.get("created_at"),
            "registered",
            f"Registered for {ev.get('title') or 'an event'}",
            r.get("status") or "",
        )

    for e in enrolments:
        add(
            e.get("created_at"),
            "enrolled",
            f"Enrolled — {e.get('programme_label') or e.get('programme')}",
            f"{e.get('stage')}"
            + (f" · {e.get('currency')} {e.get('amount')}" if e.get("amount") else ""),
        )

    for c in community:
        add(c.get("joined_at"), "community", f"Joined the {c.get('group_key')} community")
        if c.get("left_at"):
            add(c["left_at"], "community_left", f"Left the {c.get('group_key')} community")

    for m in messages:
        add(m.get("created_at"), "message", "Sent a message", (m.get("message") or "")[:200])

    for b in broadcasts:
        c = campaigns.get(b.get("campaign_id")) or {}
        add(
            b.get("sent_at") or b.get("updated_at"),
            "email",
            f"Received “{c.get('subject') or 'a broadcast'}”",
            b.get("status") or "",
        )

    for a in automated:
        add(
            a.get("sent_at"),
            "email_auto",
            f"Automated email — “{a.get('subject') or ''}”",
            a.get("status") or "",
        )

    timeline.sort(key=lambda t: t["at"], reverse=True)

    return {
        "email": email,
        "subscriber": subscriber,
        "name": (
            (subscriber or {}).get("name")
            or next((r.get("name") for r in registrations if r.get("name")), None)
            or next((e.get("name") for e in enrolments if e.get("name")), None)
        ),
        "registrations": registrations,
        "enrolments": enrolments,
        "community": community,
        "messages": messages,
        "timeline": timeline,
        "counts": {
            "registrations": len(registrations),
            "attended": sum(1 for r in registrations if r.get("status") == "attended"),
            "enrolments": len(enrolments),
            "emails": len(broadcasts) + len(automated),
        },
    }


# ---------------------------------------------------------------------------
# Admin — STATS
# ---------------------------------------------------------------------------
def _count(table: str, **filters) -> int:
    try:
        q = sb_admin.table(table).select("id", count="exact")
        for col, val in filters.items():
            q = q.eq(col, val)
        return (q.execute()).count or 0
    except Exception as exc:  # noqa: BLE001
        logger.warning("Count on %s failed: %s", table, exc)
        return 0


@api.get("/admin/stats")
def admin_stats(user=Depends(require_user)):
    """Everything the dashboard shows, in one round trip."""
    try:
        subscribers = (
            sb_admin.table("subscribers").select("created_at,status,source").execute()
        ).data or []
    except Exception:  # noqa: BLE001
        subscribers = []

    # Growth over the last 30 days, bucketed by day for the sparkline.
    from collections import Counter
    from datetime import timedelta

    today = datetime.now(timezone.utc).date()
    window = [today - timedelta(days=i) for i in range(29, -1, -1)]
    per_day = Counter()
    for s in subscribers:
        created = (s.get("created_at") or "")[:10]
        if created:
            per_day[created] += 1
    growth = [{"date": d.isoformat(), "count": per_day.get(d.isoformat(), 0)} for d in window]

    by_source = Counter(s.get("source") or "unknown" for s in subscribers)

    try:
        regs = (
            sb_admin.table("event_registrations").select("status,event_id,created_at").execute()
        ).data or []
    except Exception:  # noqa: BLE001
        regs = []

    return {
        "subscribers": {
            "total": len(subscribers),
            "active": sum(1 for s in subscribers if s.get("status") == "subscribed"),
            "unsubscribed": sum(1 for s in subscribers if s.get("status") == "unsubscribed"),
            "last_30_days": sum(g["count"] for g in growth),
            "growth": growth,
            "by_source": [{"source": k, "count": v} for k, v in by_source.most_common()],
        },
        "registrations": {
            "total": len(regs),
            "registered": sum(1 for r in regs if r.get("status") == "registered"),
            "waitlisted": sum(1 for r in regs if r.get("status") == "waitlisted"),
            "attended": sum(1 for r in regs if r.get("status") == "attended"),
        },
        "content": {
            "posts": _count("posts", status="published"),
            "events": _count("events", status="published"),
            "books": _count("books", status="published"),
        },
        "campaigns": {
            "total": _count("campaigns"),
            "sent": _count("campaigns", status="sent"),
        },
        "community": {
            "members": _count("community_members", status="joined"),
        },
        "enrolments": {
            "total": _count("programme_enrolments"),
            "active": _count("programme_enrolments", stage="in_progress"),
            "completed": _count("programme_enrolments", stage="completed"),
        },
        "automations": {
            "sequences": _count("sequences", status="active"),
            "enrolled": _count("sequence_enrolments", status="active"),
        },
        "contact_messages": _count("contact_messages"),
        "mail_configured": mailer.enabled,
        "automation_scheduler_configured": bool(AUTOMATION_TOKEN),
    }


# IMAGE UPLOAD

# Cap the largest stored dimension and re-encode to WebP. A typical 3–5 MB
# phone photo drops to ~100–300 KB with no visible quality loss at display size.
MAX_IMAGE_DIM = 1600
WEBP_QUALITY = 80


def optimize_image(contents: bytes, content_type: Optional[str]):
    """Resize + re-encode a raster image to WebP.

    Returns (out_bytes, ext, content_type). For inputs Pillow can't safely
    process (SVGs, animated GIFs/WebP) the original bytes pass through with
    ext=None so the caller keeps the original filename and content type.
    """
    try:
        img = Image.open(io.BytesIO(contents))
        # Preserve animation rather than flattening to a single frame.
        if getattr(img, "is_animated", False):
            return contents, None, content_type
        img = ImageOps.exif_transpose(img)  # honour phone photo orientation
        # Only ever downscale, never upscale.
        img.thumbnail((MAX_IMAGE_DIM, MAX_IMAGE_DIM), Image.Resampling.LANCZOS)
        # Keep transparency where it exists, otherwise flatten to RGB.
        img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
        out = io.BytesIO()
        img.save(out, format="WEBP", quality=WEBP_QUALITY, method=6)
        return out.getvalue(), "webp", "image/webp"
    except Exception as exc:  # noqa: BLE001 — non-images are stored untouched
        logger.info("Image optimise skipped (%s); storing original.", exc)
        return contents, None, content_type


@api.post("/admin/upload")
async def admin_upload(
    file: UploadFile = File(...),
    folder: str = Form(default="posts"),
    user=Depends(require_user),
):
    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", file.filename or "image")
    contents = await file.read()

    opt_bytes, opt_ext, opt_ct = optimize_image(contents, file.content_type)
    if opt_ext:
        base = re.sub(r"\.[^.]+$", "", safe_name) or "image"
        safe_name = f"{base}.{opt_ext}"
        contents = opt_bytes
        content_type = opt_ct
    else:
        content_type = file.content_type or "application/octet-stream"

    object_path = f"{folder}/{uuid.uuid4().hex}-{safe_name}"
    try:
        sb_admin.storage.from_("blog-images").upload(
            path=object_path,
            file=contents,
            file_options={
                "content-type": content_type,
                "upsert": "true",
            },
        )
    except Exception as exc:
        logger.warning("Upload failed: %s", exc)
        raise HTTPException(500, "Upload failed. Make sure the blog-images bucket exists.") from exc
    public = sb_admin.storage.from_("blog-images").get_public_url(object_path)
    return {"url": public, "path": object_path}


# ---------------------------------------------------------------------------
# Startup: seed admin user (idempotent)
# ---------------------------------------------------------------------------
@app.on_event("startup")
def seed_admin():
    if not ADMIN_PASSWORD:
        logger.warning("ADMIN_PASSWORD not set; skipping admin seed.")
        return
    try:
        existing = sb_admin.auth.admin.list_users()
        users = existing if isinstance(existing, list) else getattr(existing, "users", [])
        for u in users or []:
            email = getattr(u, "email", None) or (u.get("email") if isinstance(u, dict) else None)
            if email and email.lower() == ADMIN_EMAIL.lower():
                logger.info("Admin %s already exists.", ADMIN_EMAIL)
                return
        sb_admin.auth.admin.create_user(
            {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD,
             "email_confirm": True, "user_metadata": {"role": "admin"}}
        )
        logger.info("Admin %s created.", ADMIN_EMAIL)
    except Exception as exc:
        logger.warning("Admin seeding skipped: %s", exc)


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
