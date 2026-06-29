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
from fastapi import APIRouter, Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware
from supabase import Client, create_client
from PIL import Image, ImageOps

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
    event_date: Optional[str] = None
    register_url: Optional[str] = None
    status: str = Field(default="published", pattern="^(draft|published)$")
    sort_order: int = 0


class EventUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    gallery: Optional[list[str]] = None
    location: Optional[str] = None
    event_date: Optional[str] = None
    register_url: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")
    sort_order: Optional[int] = None


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------
@api.get("/")
def root():
    return {"ok": True, "service": "debowoseni.com"}


@api.get("/health")
def health():
    out: dict[str, Any] = {"ok": True, "tables": {}, "bucket_ready": False, "error": None}
    for t in ("posts", "testimonials", "books", "publications", "events"):
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


@api.post("/newsletter")
def subscribe(payload: SubscribeIn):
    try:
        sb_admin.table("subscribers").upsert(
            {"email": payload.email}, on_conflict="email"
        ).execute()
    except Exception as exc:
        logger.warning("Newsletter insert failed: %s", exc)
        raise HTTPException(500, "Could not subscribe right now.") from exc
    return {"ok": True}


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
