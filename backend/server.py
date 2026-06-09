"""debowoseni.com — FastAPI backend.

Acts as a thin admin/forms layer in front of Supabase (Postgres + Auth + Storage).
- Public reads (published posts) go directly via the frontend Supabase client.
- Mutations (create/update/delete/upload) go through this backend so the
  service_role key never touches the browser.
- Contact + newsletter forms are stored in Supabase via the service role.
"""

from __future__ import annotations

import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware
from supabase import Client, create_client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@debowoseni.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("debowoseni")

# Service role client: bypasses RLS, used for admin operations.
sb_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
# Anon client: used to verify a user's JWT (auth.get_user).
sb_anon: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

app = FastAPI(title="debowoseni.com API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Auth helpers
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
    except Exception as exc:  # pragma: no cover
        logger.warning("Auth verification failed: %s", exc)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from exc


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


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:80] or uuid.uuid4().hex[:8]


def ensure_unique_slug(slug: str, exclude_id: Optional[str] = None) -> str:
    base = slug
    n = 1
    while True:
        q = sb_admin.table("posts").select("id").eq("slug", slug)
        if exclude_id:
            q = q.neq("id", exclude_id)
        res = q.limit(1).execute()
        if not res.data:
            return slug
        n += 1
        slug = f"{base}-{n}"


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------
@api.get("/")
def root():
    return {"ok": True, "service": "debowoseni.com"}


@api.get("/health")
def health():
    schema_ready = False
    bucket_ready = False
    err = None
    try:
        sb_admin.table("posts").select("id").limit(1).execute()
        schema_ready = True
    except Exception as exc:
        err = str(exc)
    try:
        buckets = sb_admin.storage.list_buckets()
        bucket_ready = any(getattr(b, "name", None) == "blog-images" for b in buckets)
    except Exception as exc:  # pragma: no cover
        err = err or str(exc)
    return {
        "ok": True,
        "schema_ready": schema_ready,
        "bucket_ready": bucket_ready,
        "error": err,
    }


@api.get("/posts")
def list_published_posts(limit: int = 50):
    res = (
        sb_admin.table("posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", desc=True)
        .limit(min(max(limit, 1), 100))
        .execute()
    )
    return {"posts": res.data or []}


@api.get("/posts/{slug}")
def get_post(slug: str):
    res = sb_admin.table("posts").select("*").eq("slug", slug).limit(1).execute()
    rows = res.data or []
    if not rows or rows[0].get("status") != "published":
        raise HTTPException(404, "Post not found")
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
# Admin routes
# ---------------------------------------------------------------------------
@api.get("/admin/me")
def me(user=Depends(require_user)):
    return {"email": user.email, "id": user.id}


@api.get("/admin/posts")
def admin_list_posts(user=Depends(require_user)):
    res = (
        sb_admin.table("posts")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
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
    now = datetime.now(timezone.utc).isoformat()
    slug = ensure_unique_slug(payload.slug or slugify(payload.title))
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
        update["slug"] = ensure_unique_slug(slugify(update["slug"]), exclude_id=post_id)
    if "title" in update and update["title"] and not update.get("slug"):
        # only auto-rewrite slug when title changes AND existing slug looks auto-generated
        pass
    if update.get("status") == "published" and not existing.get("published_at"):
        update["published_at"] = datetime.now(timezone.utc).isoformat()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()

    res = sb_admin.table("posts").update(update).eq("id", post_id).execute()
    return (res.data or [{}])[0]


@api.delete("/admin/posts/{post_id}")
def admin_delete_post(post_id: str, user=Depends(require_user)):
    sb_admin.table("posts").delete().eq("id", post_id).execute()
    return {"ok": True}


@api.post("/admin/upload")
async def admin_upload(
    file: UploadFile = File(...),
    folder: str = Form(default="posts"),
    user=Depends(require_user),
):
    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", file.filename or "image")
    object_path = f"{folder}/{uuid.uuid4().hex}-{safe_name}"
    contents = await file.read()
    try:
        sb_admin.storage.from_("blog-images").upload(
            path=object_path,
            file=contents,
            file_options={
                "content-type": file.content_type or "application/octet-stream",
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
            {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "email_confirm": True,
                "user_metadata": {"role": "admin"},
            }
        )
        logger.info("Admin %s created.", ADMIN_EMAIL)
    except Exception as exc:  # pragma: no cover
        logger.warning("Admin seeding skipped: %s", exc)


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
