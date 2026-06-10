"""Replace Webflow placeholder blog covers with thematically fitting stock images.

Idempotent — deterministic assignment: keyword rules first (marriage, fire,
time, fog, ...), then per-category pools, round-robin within each pool so
neighbouring posts don't share covers. All URLs verified (HTTP 200) before
being added here.
"""
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

U = "https://images.unsplash.com/photo-{}?w=1200&q=80&auto=format&fit=crop"


def pool(*ids):
    return [U.format(i) for i in ids]


POOLS = {
    "leadership": pool(
        "1521737604893-d14cc237f11d",  # team hands together
        "1522202176988-66273c2fd55f",  # collaboration at laptops
        "1556761175-5973dc0f32e7",     # boardroom meeting
        "1517245386807-bb43f82c33c4",  # speaker presenting
        "1517048676732-d65bc937f952",  # table discussion
        "1454165804606-c3d57bc86b40",  # strategy planning desk
    ),
    "relationships": pool(
        "1519741497674-611481863552",  # wedding couple
        "1511285560929-80b456fea0bc",  # wedding hands
        "1494178270175-e96de2971df9",  # two coffees, conversation
        "1518241353330-0f7941c2d9b5",  # silhouettes at dusk
        "1508672019048-805c876b67e2",  # walking the shoreline
        "1492681290082-e932832941e6",  # two beneath the stars
        "1476611317561-60117649dd94",  # friends at sunset
        "1507003211169-0a1dd7228f2d",  # thoughtful portrait
    ),
    "transformation": pool(
        "1506905925346-21bda4d32df4",  # summit climb
        "1470071459604-3b5ec3a7fe05",  # fog lifting over hills
        "1431794062232-2a99a5431c6c",  # ridge walker
        "1475924156734-496f6cac6ec1",  # sunrise over the sea
        "1528716321680-815a8cdb8cbe",  # arms raised on the cliff
        "1499002238440-d264edd596ec",  # golden field, open road
        "1470770841072-f978cf4d019e",  # mountain lake stillness
        "1506126613408-eca07ce68773",  # meditation at sunset
    ),
    "inspirational": pool(
        "1441974231531-c6227db76b6e",  # light through the forest
        "1518495973542-4542c06a5843",  # sun through leaves
        "1490730141103-6cac27aaab94",  # morning light rays
        "1469474968028-56623f02e42e",  # valley sunbeam
        "1519681393784-d120267933ba",  # mountains under stars
        "1506744038136-46273834b3fb",  # lake at dusk
        "1507525428034-b723cf961d3e",  # open shoreline
        "1447752875215-b2761acb3c5d",  # forest sunlight
    ),
    "scripture": pool(
        "1457369804613-52c61a468e7d",  # open book
        "1516979187457-637abb4f9353",  # book on the table
        "1490730141103-6cac27aaab94",  # light rays
        "1518495973542-4542c06a5843",  # light through leaves
        "1481627834876-b7833e8f5570",  # library
    ),
    "work": pool(
        "1454165804606-c3d57bc86b40",  # planning desk
        "1477959858617-67f85cf4f1df",  # city skyline
        "1486312338219-ce68d2c6f44d",  # hands typing
        "1554224155-6726b3ff858f",     # ledger and calculator
    ),
    "writing": pool(
        "1504805572947-34fad45aed93",  # typewriter
        "1455390582262-044cdead277a",  # fountain pen
        "1488190211105-8b0e65b80b4e",  # notebook on desk
        "1517842645767-c639042777db",  # journal and coffee
    ),
    "mind": pool(
        "1544367567-0f2fcb009e0b",     # meditation
        "1506126613408-eca07ce68773",  # stillness at sunset
        "1473773508845-188df298d2d1",  # reflection at the window
    ),
    "marriage": pool(
        "1519741497674-611481863552",
        "1511285560929-80b456fea0bc",
        "1518241353330-0f7941c2d9b5",
    ),
    "fire": pool("1511632765486-a01980e01a18"),
    "time": pool("1495364141860-b0d03eccd065", "1434626881859-194d67b2b86f"),
    "storm": pool("1500674425229-f692875b0ab7"),
    "fog": pool("1470071459604-3b5ec3a7fe05"),
    "snow": pool("1506905925346-21bda4d32df4"),
    "season": pool("1470770841072-f978cf4d019e"),
    "conversation": pool("1494178270175-e96de2971df9"),
    "study": pool("1503676260728-1c00da094a0b", "1434030216411-0b793f4b4173",
                  "1456513080510-7bf3a84b82f8", "1474366521946-c3d4b507abf2",
                  "1532012197267-da84d127e765"),
}

# First matching rule wins. Keywords are checked against the lowercase title.
RULES = [
    (("marriage", "couple", "wedding"), "marriage"),
    (("fire",), "fire"),
    (("fog",), "fog"),
    (("snow",), "snow"),
    (("time",), "time"),
    (("season",), "season"),
    (("mind", "think", "spirituality", "self-awareness"), "mind"),
    (("storm", " war ", "conflict", "anger", "pain"), "storm"),
    (("listening", "conversation", "talks"), "conversation"),
    (("bible", "gospel", "god", "grace", "blood", "love", "wisdom", "truth", "final word"), "scripture"),
    (("busy", "working", "economy", "exchange", "integrity", "rules"), "work"),
    (("writing", "wall",), "writing"),
    (("leader", "lead", "followership", "gatekeeping", "celebrities"), "leadership"),
    (("knowing", "see", "look"), "study"),
]

CATEGORY_DEFAULT = {
    "Leadership": "leadership",
    "Relationships": "relationships",
    "Transformation": "transformation",
    "Inspirational": "inspirational",
    "Digital Tech & AI": "work",
}


def pick_pool(title: str, category: str) -> str:
    t = title.lower()
    for keywords, pool_name in RULES:
        if any(k in t for k in keywords):
            return pool_name
    return CATEGORY_DEFAULT.get(category, "inspirational")


posts = sb.table("posts").select("id,slug,title,category").order("slug").execute().data
counters = {k: 0 for k in POOLS}
updated = 0
for p in posts:
    name = pick_pool(p["title"], p["category"])
    images = POOLS[name]
    url = images[counters[name] % len(images)]
    counters[name] += 1
    sb.table("posts").update({"cover_url": url}).eq("id", p["id"]).execute()
    updated += 1
    print(f"{p['slug'][:50]:52} -> {name}")

print(f"\nUpdated {updated} covers")
