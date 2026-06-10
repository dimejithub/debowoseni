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
         cover_url="https://customer-assets.emergentagent.com/job_debo-platform/artifacts/ib1lyvey_How%20God%20gives%20feedback.jpg",
         buy_url="https://www.amazon.co.uk/dp/B0H4276KFB",
         is_featured=True, status="published", sort_order=0),
    dict(slug="your-marriage-in-a-mirror", title="Your Marriage In a Mirror",
         one_liner="A Scripture-guided tool to examine, renew, and strengthen relationships.",
         description="A workbook for couples and those preparing for covenant — practical reflections that help you see the relationship you actually have, not the one you've been performing. Designed for slow, honest reading.",
         cover_url="https://customer-assets.emergentagent.com/job_debo-platform/artifacts/vryclmhk_your%20marriage%20in%20a%20mirror.jpg",
         buy_url="https://www.amazon.co.uk/Your-Marriage-Mirror-Adebowale-Owoseni-ebook/dp/B0F4F64VNZ",
         is_featured=False, status="published", sort_order=10),
    dict(slug="imole", title="Ìmọ̀lẹ̀",
         one_liner="Spoken-word poetry on identity, purpose, and the journey toward wholeness.",
         description="A collection of spoken-word reflections written for the vulnerable parts of transformation — for the seasons where the old self is no longer accurate and the new self is still being formed.",
         cover_url="https://customer-assets.emergentagent.com/job_debo-platform/artifacts/i9g97eh9_imole.jpg",
         buy_url="https://www.amazon.co.uk/%C3%8Cm%C3%B3l%E1%BA%B9%CC%80-reflections-journeys-vulnerable-transformation/dp/B0FQCQ6JRL",
         is_featured=False, status="published", sort_order=20),
    dict(slug="ijinle", title="Ìjìnlẹ̀",
         one_liner="Reflections on navigating life's crossroads with wisdom, faith, and direction.",
         description="A short book of inspiring reflections to encourage purpose-driven decisions at the moments that matter most — for the crossroads where the easy answer is the wrong one.",
         cover_url="https://customer-assets.emergentagent.com/job_debo-platform/artifacts/97cc65ku_ijinle.jpg",
         buy_url="https://www.amazon.co.uk/Ijinl%E1%BA%B9%CC%80-collection-inspiring-reflections-encourage/dp/B0FF3LV3XF",
         is_featured=False, status="published", sort_order=30),
    dict(slug="taking-your-day", title="Taking Your Day",
         one_liner="A Year of Taking What Is Already Yours — daily readings for the purpose-driven.",
         description="A year-long companion of short, sharp readings — written to be read first thing, before the day decides what you'll be. The morning anchor for those who want their hours back on purpose.",
         cover_url="https://customer-assets.emergentagent.com/job_debo-platform/artifacts/nnfg2q4o_Taking%20your%20day.png",
         buy_url=None, is_featured=False, status="published", sort_order=40),
    dict(slug="taking-your-day-journal", title="Taking Your Day — 365-Day Transformation Journal",
         one_liner="The companion journal to Taking Your Day — 365 days of guided pages for reflection and direction.",
         description="The lined, dated companion to Taking Your Day. One page a day, twelve months, for the reader who wants to write the day they intend to live.",
         cover_url="https://customer-assets.emergentagent.com/job_debo-platform/artifacts/ih15vs0v_Taking%20your%20day%20journal.png",
         buy_url=None, is_featured=False, status="published", sort_order=50),
]

PUBLICATIONS = [
    dict(title="Generative AI in Research", year="2026",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=10),
    dict(title="Artificial Intelligence in the Informal Economy", year="2026",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=10),
    dict(title="Effectuated Spirituality", year="2025",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=10),
    dict(title="Generative AI in Higher Education", year="2024",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=10),
    dict(title="Metaphorical Meaning of Digital Transformation",
         year="2023",
         url="https://www.emerald.com/dts/article/2/1/78/102283/What-is-digital-transformation-Investigating-the",
         sort_order=10),
    dict(title="Employment 5.0", year="2022",
         url="https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en", sort_order=10),
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
    slug="lte-live-leicester",
    title="LTE Live · Leicester",
    description="A live cohort of the Life Transformation Experience — purpose-driven professionals walking through the Wheel of Life and the LTE map together. In-person session with rich conversation and practical tools.",
    cover_url="https://customer-assets.emergentagent.com/job_debo-platform/artifacts/auoge5e1__D5A3033.jpg",
    gallery=[
        "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/auoge5e1__D5A3033.jpg",
        "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/t2iwgjek__D5A3030.jpg",
        "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/7b2phnc9__D5A3048.jpg",
    ],
    location="Phoenix Cinema, Leicester, UK",
    event_date="2026-03-07",
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

# Publications: no unique constraint on title — replace wholesale to keep the
# canonical list in seed_content.py as the source of truth.
sb.table("publications").delete().neq("title", "__never_match__").execute()
sb.table("publications").insert(PUBLICATIONS).execute()
print(f"  publications: replaced with {len(PUBLICATIONS)} row(s)")

# Testimonials have no unique key besides id, so we clear+insert if empty
existing = sb.table("testimonials").select("id").execute().data or []
if not existing:
    sb.table("testimonials").insert(TESTIMONIALS).execute()
    print(f"  testimonials: {len(TESTIMONIALS)} row(s) inserted")
else:
    print(f"  testimonials: {len(existing)} already present, skipping")
upsert("events", [EVENT], "slug")
print("Done.")
