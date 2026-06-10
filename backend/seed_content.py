"""Seed Supabase with real content for debowoseni.com (idempotent)."""
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
now = datetime.now(timezone.utc).isoformat()

BOOKS = [
    dict(slug="how-god-gives-feedback", title="How God Gives Feedback",
         one_liner="A devotional with journaling for those seeking to hear God and lead with grace.",
         description="A guided devotional that pairs Scripture with structured journaling prompts — built for the leader, the parent, the founder who wants to hear, not just hustle.",
         cover_url="https://images.pexels.com/photos/2425232/pexels-photo-2425232.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=900",
         buy_url="https://www.amazon.co.uk/dp/B0H4276KFB",
         is_featured=True, status="published", sort_order=0),
    dict(slug="your-marriage-in-a-mirror", title="Your Marriage In a Mirror",
         one_liner="A Scripture-guided tool to examine, renew, and strengthen relationships.",
         description="A workbook for couples and those preparing for covenant — practical reflections that help you see the relationship you actually have, not the one you've been performing. Designed for slow, honest reading.",
         cover_url="https://images.unsplash.com/photo-1638376776402-9a4b75fe21bb?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
         buy_url="https://www.amazon.co.uk/Your-Marriage-Mirror-Adebowale-Owoseni-ebook/dp/B0F4F64VNZ",
         is_featured=False, status="published", sort_order=10),
    dict(slug="imole", title="Ìmọ̀lẹ̀",
         one_liner="Spoken-word poetry on identity, purpose, and the journey toward wholeness.",
         description="A collection of spoken-word reflections written for the vulnerable parts of transformation — for the seasons where the old self is no longer accurate and the new self is still being formed.",
         cover_url="https://images.unsplash.com/photo-1567095751004-aa51a2690368?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
         buy_url="https://www.amazon.co.uk/%C3%8Cm%C3%B3l%E1%BA%B9%CC%80-reflections-journeys-vulnerable-transformation/dp/B0FQCQ6JRL",
         is_featured=False, status="published", sort_order=20),
    dict(slug="ijinle", title="Ìjìnlẹ̀",
         one_liner="Reflections on navigating life's crossroads with wisdom, faith, and direction.",
         description="A short book of inspiring reflections to encourage purpose-driven decisions at the moments that matter most — for the crossroads where the easy answer is the wrong one.",
         cover_url="https://images.unsplash.com/photo-1710438399422-2fca27686bcd?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
         buy_url="https://www.amazon.co.uk/Ijinl%E1%BA%B9%CC%80-collection-inspiring-reflections-encourage/dp/B0FF3LV3XF",
         is_featured=False, status="published", sort_order=30),
    dict(slug="taking-your-day", title="Taking Your Day",
         one_liner="A 365-day devotional for the purpose-driven, one steady morning at a time.",
         description="A year-long companion of short, sharp readings — written to be read first thing, before the day decides what you'll be. [Blurb to be confirmed]",
         cover_url="https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
         buy_url=None, is_featured=False, status="published", sort_order=40),
]

PUBLICATIONS = [
    dict(title="Generative AI in Higher Education", year="2024",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=10),
    dict(title="Generative AI in Research", year="2026",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=20),
    dict(title="Artificial Intelligence in the Informal Economy", year="2026",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=30),
    dict(title="Effectuated Spirituality", year="2025",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=40),
    dict(title="Employment 5.0", year="2022",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=50),
]

TESTIMONIALS = [
    dict(quote="I came in with goals and Debo' helped me find the assignment underneath them. Six months on, the work I do is finally mine.",
         attribution="Tobi A.", role="Programme Director · London",
         status="published", sort_order=10),
    dict(quote="He does not teach you to hustle harder. He teaches you to listen better — to yourself, to your people, and to God.",
         attribution="Funmi O.", role="Founder · Lagos",
         status="published", sort_order=20),
    dict(quote="The LTE framework gave language to what I had been quietly carrying for a decade. After that, the next step was obvious.",
         attribution="David K.", role="Senior Lecturer · Manchester",
         status="published", sort_order=30),
]

EVENT = dict(
    slug="lte-london-workshop",
    title="LTE Live · London",
    description="A live cohort of the Life Transformation Experience — purpose-driven professionals walking through the Wheel of Life and the LTE map together. In-person session with rich conversation and practical tools.",
    cover_url="https://customer-assets.emergentagent.com/job_debo-platform/artifacts/auoge5e1__D5A3033.jpg",
    gallery=[
        "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/auoge5e1__D5A3033.jpg",
        "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/t2iwgjek__D5A3030.jpg",
        "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/7b2phnc9__D5A3048.jpg",
    ],
    location="London, UK",
    event_date="2025-11-15",
    status="published",
    sort_order=10,
)

def upsert(table: str, rows: list, key: str, has_updated_at: bool = True):
    for r in rows:
        r.setdefault("created_at", now)
        if has_updated_at:
            r["updated_at"] = now
    sb.table(table).upsert(rows, on_conflict=key).execute()
    print(f"  {table}: {len(rows)} row(s) upserted")

upsert("books", BOOKS, "slug")

# Publications: no unique constraint on title and no updated_at — insert only if empty
existing_pubs = sb.table("publications").select("id").execute().data or []
if not existing_pubs:
    sb.table("publications").insert(PUBLICATIONS).execute()
    print(f"  publications: {len(PUBLICATIONS)} row(s) inserted")
else:
    print(f"  publications: {len(existing_pubs)} already present, skipping")

# Testimonials have no unique key besides id, so we clear+insert if empty
existing = sb.table("testimonials").select("id").execute().data or []
if not existing:
    sb.table("testimonials").insert(TESTIMONIALS).execute()
    print(f"  testimonials: {len(TESTIMONIALS)} row(s) inserted")
else:
    print(f"  testimonials: {len(existing)} already present, skipping")
upsert("events", [EVENT], "slug")
print("Done.")
