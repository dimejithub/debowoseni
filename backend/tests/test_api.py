"""End-to-end pytest suite for debowoseni.com FastAPI backend.

Covers public endpoints (health, posts, contact, newsletter), admin auth
guard, admin CRUD posts, admin upload. Uses real Supabase via the
configured backend URL from REACT_APP_BACKEND_URL.
"""

import io
import os
import time
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv

# Load frontend .env to get REACT_APP_BACKEND_URL (preview URL)
load_dotenv(Path("/app/frontend/.env"))

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
SUPABASE_URL = os.environ["REACT_APP_SUPABASE_URL"].rstrip("/")
SUPABASE_ANON_KEY = os.environ["REACT_APP_SUPABASE_ANON_KEY"]
ADMIN_EMAIL = "admin@debowoseni.com"
ADMIN_PASSWORD = "KUz6h4PpCt46QK0Tqhis"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def access_token():
    """Sign in to Supabase via password grant to obtain an access_token."""
    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        },
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    if r.status_code != 200:
        pytest.skip(f"Admin signin failed ({r.status_code}): {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_client(access_token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {access_token}"})
    return s


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------
class TestHealthAndPublic:
    def test_health(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/health", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        assert data["schema_ready"] is True
        assert data["bucket_ready"] is True

    def test_list_published_posts_includes_seed(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/posts", timeout=30)
        assert r.status_code == 200
        posts = r.json()["posts"]
        slugs = [p["slug"] for p in posts]
        assert "are-you-in-there" in slugs
        # All listed posts must be published
        assert all(p["status"] == "published" for p in posts)

    def test_get_seed_post(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/posts/are-you-in-there", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == "are-you-in-there"
        assert data["status"] == "published"
        assert data["body"] and len(data["body"]) > 50

    def test_get_post_404(self, api_client):
        r = api_client.get(
            f"{BASE_URL}/api/posts/this-slug-does-not-exist-xyz", timeout=30
        )
        assert r.status_code == 404


class TestContact:
    def test_contact_valid(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/contact",
            json={
                "name": "TEST_Visitor",
                "email": "test_visitor@example.com",
                "message": "TEST_ automated message — please ignore.",
            },
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json()["ok"] is True

    def test_contact_invalid_email(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/contact",
            json={"name": "x", "email": "not-an-email", "message": "hi"},
            timeout=30,
        )
        assert r.status_code == 422


class TestNewsletter:
    EMAIL = f"test_sub_{uuid.uuid4().hex[:8]}@example.com"

    def test_subscribe(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/newsletter", json={"email": self.EMAIL}, timeout=30
        )
        assert r.status_code == 200, r.text
        assert r.json()["ok"] is True

    def test_subscribe_idempotent(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/newsletter", json={"email": self.EMAIL}, timeout=30
        )
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_subscribe_invalid_email(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/newsletter", json={"email": "nope"}, timeout=30
        )
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# Admin auth guard
# ---------------------------------------------------------------------------
class TestAdminAuthGuard:
    def test_admin_posts_requires_token(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/admin/posts", timeout=30)
        assert r.status_code == 401

    def test_admin_create_requires_token(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/admin/posts",
            json={"title": "x"},
            timeout=30,
        )
        assert r.status_code == 401

    def test_admin_upload_requires_token(self, api_client):
        # Multipart, no auth header
        files = {"file": ("a.png", b"\x89PNG\r\n", "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, timeout=30)
        assert r.status_code == 401

    def test_admin_bad_token(self, api_client):
        r = requests.get(
            f"{BASE_URL}/api/admin/posts",
            headers={"Authorization": "Bearer not-a-real-token"},
            timeout=30,
        )
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Admin (authenticated)
# ---------------------------------------------------------------------------
class TestAdminAuthenticated:
    def test_me(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/admin/me", timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["email"].lower() == ADMIN_EMAIL.lower()

    def test_list_all_posts_includes_drafts_capability(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/admin/posts", timeout=30)
        assert r.status_code == 200
        posts = r.json()["posts"]
        assert isinstance(posts, list)
        # seed post should be present
        slugs = [p["slug"] for p in posts]
        assert "are-you-in-there" in slugs


class TestAdminPostCRUD:
    """Create -> Read -> Update (publish) -> public visibility -> Delete."""

    created_id = None
    created_slug = None

    def test_create_post_as_draft(self, auth_client):
        title = f"TEST_ Automated Post {uuid.uuid4().hex[:6]}"
        r = auth_client.post(
            f"{BASE_URL}/api/admin/posts",
            json={
                "title": title,
                "excerpt": "TEST_ excerpt",
                "body": "<p>TEST_ body</p>",
                "category": "Transformation",
            },
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == title
        assert data["status"] == "draft"
        assert data["slug"]  # auto-slug generated
        assert data["published_at"] in (None, "")
        TestAdminPostCRUD.created_id = data["id"]
        TestAdminPostCRUD.created_slug = data["slug"]

    def test_draft_not_public(self, api_client):
        assert TestAdminPostCRUD.created_slug
        r = api_client.get(
            f"{BASE_URL}/api/posts/{TestAdminPostCRUD.created_slug}", timeout=30
        )
        assert r.status_code == 404  # drafts hidden from public

    def test_update_publish(self, auth_client):
        assert TestAdminPostCRUD.created_id
        r = auth_client.put(
            f"{BASE_URL}/api/admin/posts/{TestAdminPostCRUD.created_id}",
            json={"status": "published", "excerpt": "TEST_ excerpt updated"},
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "published"
        assert data["published_at"]
        assert data["excerpt"] == "TEST_ excerpt updated"

    def test_published_visible_publicly(self, api_client):
        assert TestAdminPostCRUD.created_slug
        # tiny wait for any propagation
        time.sleep(1)
        r = api_client.get(
            f"{BASE_URL}/api/posts/{TestAdminPostCRUD.created_slug}", timeout=30
        )
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "published"

    def test_delete(self, auth_client):
        assert TestAdminPostCRUD.created_id
        r = auth_client.delete(
            f"{BASE_URL}/api/admin/posts/{TestAdminPostCRUD.created_id}", timeout=30
        )
        assert r.status_code == 200
        # verify gone
        r2 = auth_client.get(
            f"{BASE_URL}/api/admin/posts/{TestAdminPostCRUD.created_id}", timeout=30
        )
        assert r2.status_code == 404


class TestAdminUpload:
    def test_upload_image_returns_public_url(self, access_token):
        # 1x1 PNG
        png = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
            "890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
        )
        files = {"file": ("TEST_pixel.png", io.BytesIO(png), "image/png")}
        r = requests.post(
            f"{BASE_URL}/api/admin/upload",
            files=files,
            data={"folder": "tests"},
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"].startswith("http")
        assert "blog-images" in data["url"]
        # Public URL loads
        rr = requests.get(data["url"], timeout=30)
        assert rr.status_code == 200, f"Public URL did not load: {rr.status_code}"
        assert rr.content[:4] == b"\x89PNG"
