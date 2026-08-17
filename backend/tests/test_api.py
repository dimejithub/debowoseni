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
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@debowoseni.com")

# Never hardcode this. It used to be a literal in this file, which put the live
# CMS password into git history — rotate it in Supabase if that has not been
# done. Export ADMIN_PASSWORD (or put it in the .env this module loads) to run
# the admin half of the suite.
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")


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
    if not ADMIN_PASSWORD:
        pytest.skip("ADMIN_PASSWORD is not set; skipping admin tests.")
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


# ---------------------------------------------------------------------------
# Phase 2 — public list endpoints (testimonials/books/publications/events)
# ---------------------------------------------------------------------------
class TestPublicListsPhase2:
    def test_health_all_tables(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/health", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["schema_ready"] is True
        for t in ("posts", "testimonials", "books", "publications", "events"):
            assert d["tables"].get(t) is True, f"table missing: {t}"
        assert d["bucket_ready"] is True

    def test_books_seed_and_featured(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/books", timeout=30)
        assert r.status_code == 200
        books = r.json()["books"]
        assert len(books) >= 5
        featured = [b for b in books if b.get("is_featured")]
        assert any("How God Gives Feedback" in (b.get("title") or "") for b in featured), (
            f"Expected featured 'How God Gives Feedback', got featured={[b.get('title') for b in featured]}"
        )

    def test_testimonials_sorted(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/testimonials", timeout=30)
        assert r.status_code == 200
        ts = r.json()["testimonials"]
        assert len(ts) >= 3
        orders = [t.get("sort_order", 0) for t in ts]
        assert orders == sorted(orders), f"not sorted ascending: {orders}"

    def test_publications_seed(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/publications", timeout=30)
        assert r.status_code == 200
        pubs = r.json()["publications"]
        assert len(pubs) >= 5
        titles = " | ".join(p.get("title", "") for p in pubs)
        for expected in [
            "Generative AI in Higher Education",
            "Generative AI in Research",
            "Artificial Intelligence in the Informal Economy",
            "Effectuated Spirituality",
            "Employment 5.0",
        ]:
            assert expected in titles, f"missing publication: {expected}"

    def test_events_seed_and_gallery(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/events", timeout=30)
        assert r.status_code == 200
        events = r.json()["events"]
        assert len(events) >= 1
        lte = next((e for e in events if "Leicester" in (e.get("title") or "")), None)
        assert lte is not None, f"LTE Leicester event not found: {[e.get('title') for e in events]}"
        gallery = lte.get("gallery") or []
        assert isinstance(gallery, list) and len(gallery) >= 3
        assert (lte.get("location") or "").strip() == "Leicester, UK", f"location: {lte.get('location')}"

    def test_event_by_slug_and_404(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/events/lte-london-workshop", timeout=30)
        assert r.status_code == 200
        body = r.json()
        assert body.get("title") == "LTE Live · Leicester", f"title: {body.get('title')}"
        assert (body.get("location") or "").strip() == "Leicester, UK"
        r2 = api_client.get(f"{BASE_URL}/api/events/does-not-exist-xyz", timeout=30)
        assert r2.status_code == 404


# ---------------------------------------------------------------------------
# Phase 2 — admin auth guard on new resources
# ---------------------------------------------------------------------------
class TestAdminAuthGuardPhase2:
    @pytest.mark.parametrize("path", [
        "/api/admin/testimonials",
        "/api/admin/books",
        "/api/admin/publications",
        "/api/admin/events",
    ])
    def test_admin_get_requires_token(self, api_client, path):
        r = api_client.get(f"{BASE_URL}{path}", timeout=30)
        assert r.status_code == 401

    @pytest.mark.parametrize("path", [
        "/api/admin/testimonials",
        "/api/admin/books",
        "/api/admin/publications",
        "/api/admin/events",
    ])
    def test_admin_post_requires_token(self, api_client, path):
        r = api_client.post(f"{BASE_URL}{path}", json={"title": "x", "quote": "x", "attribution": "x"}, timeout=30)
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Phase 2 — admin CRUD: books, testimonials, publications, events
# ---------------------------------------------------------------------------
class TestAdminBooksCRUD:
    def test_books_crud_and_autoslug(self, auth_client):
        title = f"TEST_ Book {uuid.uuid4().hex[:6]}"
        r = auth_client.post(
            f"{BASE_URL}/api/admin/books",
            json={"title": title, "one_liner": "TEST_ ol", "is_featured": False},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["id"]
        assert b["title"] == title
        assert b["slug"] and b["slug"].startswith("test-book-")
        bid = b["id"]

        # update
        ru = auth_client.put(
            f"{BASE_URL}/api/admin/books/{bid}",
            json={"one_liner": "TEST_ ol updated", "is_featured": True},
            timeout=30,
        )
        assert ru.status_code == 200, ru.text
        assert ru.json()["one_liner"] == "TEST_ ol updated"
        assert ru.json()["is_featured"] is True

        # delete
        rd = auth_client.delete(f"{BASE_URL}/api/admin/books/{bid}", timeout=30)
        assert rd.status_code == 200


class TestAdminTestimonialsCRUD:
    def test_testimonials_crud(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/admin/testimonials",
            json={"quote": "TEST_ quote", "attribution": "TEST_ Person", "role": "Tester", "sort_order": 999},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        tid = r.json()["id"]
        ru = auth_client.put(
            f"{BASE_URL}/api/admin/testimonials/{tid}",
            json={"role": "Senior Tester"},
            timeout=30,
        )
        assert ru.status_code == 200
        assert ru.json()["role"] == "Senior Tester"
        rd = auth_client.delete(f"{BASE_URL}/api/admin/testimonials/{tid}", timeout=30)
        assert rd.status_code == 200


class TestAdminPublicationsCRUD:
    """Ensures publications table works WITHOUT updated_at column."""

    def test_publications_crud_no_updated_at_error(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/admin/publications",
            json={"title": f"TEST_ Pub {uuid.uuid4().hex[:6]}", "year": "2025", "url": "https://example.com", "sort_order": 999},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        # update should also succeed without updated_at
        ru = auth_client.put(
            f"{BASE_URL}/api/admin/publications/{pid}",
            json={"year": "2026"},
            timeout=30,
        )
        assert ru.status_code == 200, ru.text
        assert ru.json()["year"] == "2026"
        rd = auth_client.delete(f"{BASE_URL}/api/admin/publications/{pid}", timeout=30)
        assert rd.status_code == 200


class TestAdminEventsCRUD:
    def test_events_crud_gallery_persists(self, auth_client):
        title = f"TEST_ Event {uuid.uuid4().hex[:6]}"
        gallery = ["https://example.com/a.png", "https://example.com/b.png"]
        r = auth_client.post(
            f"{BASE_URL}/api/admin/events",
            json={"title": title, "description": "TEST_", "gallery": gallery, "location": "Nowhere"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        ev = r.json()
        eid = ev["id"]
        assert ev["gallery"] == gallery

        # add another image via update
        new_gallery = gallery + ["https://example.com/c.png"]
        ru = auth_client.put(
            f"{BASE_URL}/api/admin/events/{eid}",
            json={"gallery": new_gallery},
            timeout=30,
        )
        assert ru.status_code == 200, ru.text
        assert ru.json()["gallery"] == new_gallery

        rd = auth_client.delete(f"{BASE_URL}/api/admin/events/{eid}", timeout=30)
        assert rd.status_code == 200


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
        # Public URL loads and is the optimised WebP (RIFF....WEBP signature)
        rr = requests.get(data["url"], timeout=30)
        assert rr.status_code == 200, f"Public URL did not load: {rr.status_code}"
        assert rr.content[:4] == b"RIFF" and rr.content[8:12] == b"WEBP"
