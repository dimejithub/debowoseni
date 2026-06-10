"""Import the Webflow blog export (data/webflow_blogs.csv) into Supabase posts.

Idempotent — upserts on slug. Categories are normalised to the public set
(Leadership / Relationships / Transformation / Inspirational). Posts outside
those categories (e.g. "Digital Tech & AI") are imported as DRAFTS so they live
in the admin CMS but never appear on the public site.
"""
import csv
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "webflow_blogs.csv")

CATEGORY_MAP = {
    "Relationship": "Relationships",
    "Inspiration": "Inspirational",
}
PUBLIC_CATEGORIES = {"Leadership", "Relationships", "Transformation", "Inspirational"}


def parse_webflow_date(s: str):
    """'Tue Dec 16 2025 05:44:13 GMT+0000 (Coordinated Universal Time)' -> ISO."""
    if not s:
        return None
    s = s.split(" GMT")[0].strip()
    try:
        return datetime.strptime(s, "%a %b %d %Y %H:%M:%S").replace(tzinfo=timezone.utc).isoformat()
    except ValueError:
        return None


with open(CSV_PATH, encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

posts, published, drafts = [], 0, 0
for r in rows:
    raw_cat = (r["Blog CTG"] or "").strip()
    category = CATEGORY_MAP.get(raw_cat, raw_cat) or "Transformation"
    is_public = (
        category in PUBLIC_CATEGORIES
        and r["Draft"].strip().lower() != "true"
        and r["Archived"].strip().lower() != "true"
    )
    if is_public:
        published += 1
    else:
        drafts += 1
    posts.append(dict(
        slug=r["Slug"].strip(),
        title=r["Blog Title"].strip(),
        category=category,
        excerpt=(r["Blog Details"] or "").strip(),
        body=(r["Blog Rich Text"] or "").strip(),
        cover_url=(r["Blog Image"] or "").strip() or None,
        author_name=(r["Blog Author Name"] or "Debo Owoseni").strip(),
        author_avatar=(r["Blog Author Image"] or "").strip() or None,
        status="published" if is_public else "draft",
        published_at=parse_webflow_date(r["Created On"]) or parse_webflow_date(r["Published On"]),
        updated_at=datetime.now(timezone.utc).isoformat(),
    ))

sb.table("posts").upsert(posts, on_conflict="slug").execute()
print(f"Imported {len(posts)} posts -> {published} published, {drafts} drafts")
