# Moving debowoseni.com off Systeme.io

Everything Systeme was doing — the programmes/sales page, event sign-ups, the
email list, **and the automated sequences** — now runs on this site. This
replaces `SYSTEME_IO_GUIDE.md`, which described the old CSV hand-off.

Stripe is untouched: it already takes the money, and it still does.

---

## What moved

| Was on Systeme | Is now |
|---|---|
| `lte.debowoseni.com/programmes` | `/programmes` on this site |
| Online Bootcamp checkout (€119) | Stripe Payment Link, tier-3 card |
| In-Person Bootcamp checkout (€178) | Stripe Payment Link, tier-2 card |
| 1-to-1 booking | Calendly, linked from the tier-1 card |
| Free Event Funnel opt-in | `/events` → on-site registration |
| LTE Welcome email campaign | Admin → **Automations** |
| Rules ("when tag added → send campaign") | Admin → **Automations** triggers |
| Contact tags | Subscriber `tags` + `source` in Supabase |
| — (Systeme had no equivalent) | Admin → **People**, the CRM timeline |

Nothing on the site links to `lte.debowoseni.com` any more.

---

## Cutover, in order

### 1. Run the schema — you must do this yourself

Paste these two files into the Supabase SQL editor and press Run, in order:

1. `backend/supabase_schema_phase3.sql`
2. `backend/supabase_schema_phase4.sql`

Both are safe to re-run. Phase 3 also repairs drift: the event
time/price/location columns were previously added by hand and were missing from
the repo, so a fresh deploy would have broken.

There is no way to automate this — Supabase does not expose arbitrary DDL over
its REST API, so the SQL editor is the route.

### 2. Create the Resend API key — you must do this yourself

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month,
   100/day — enough to start).
2. **Domains → Add Domain → `debowoseni.com`.** Resend gives you three DNS
   records: SPF, DKIM and DMARC. Add all three at your DNS provider and wait
   for the status to go green. **Do not skip this** — sending from an
   unverified domain is what puts mail in spam.
3. **API Keys → Create API Key**, permission "Sending access". Copy it once —
   it is only shown at creation.
4. Paste it into Render as `RESEND_API_KEY`.

### 3. Set the backend environment (Render)

```
RESEND_API_KEY=re_...
MAIL_FROM=Debo Owoseni <hello@debowoseni.com>
MAIL_REPLY_TO=hello@debowoseni.com
PUBLIC_SITE_URL=https://debowoseni.com
AUTOMATION_TOKEN=<any long random string you invent>
COMMUNITY_LTE_INVITE_URL=https://chat.whatsapp.com/...
```

Without `RESEND_API_KEY` nothing breaks — the site runs in dry-run mode,
logging emails instead of sending them, and the dashboard shows a warning.

### 4. Turn on the automation scheduler

Render's free and starter web services have no cron, so sequences are driven by
an hourly GitHub Action (`.github/workflows/run-automations.yml`). In the repo:
**Settings → Secrets and variables → Actions → New repository secret**:

```
BACKEND_URL       https://<your-render-service>.onrender.com     (no trailing slash)
AUTOMATION_TOKEN  the same random string you set on Render
```

Until both are set, sequences will enrol people but never send. The dashboard
warns when this is the case. The hourly ping also keeps the backend warm.

### 5. Set the frontend environment

```
REACT_APP_STRIPE_TIER_2_URL=https://buy.stripe.com/...   # In-person, €178
REACT_APP_STRIPE_TIER_3_URL=https://buy.stripe.com/...   # Online, €119
REACT_APP_PRICE_CURRENCY=EUR                             # default; set GBP if you re-price
REACT_APP_CALENDLY_URL=https://calendly.com/debowoseni-events/30min
REACT_APP_WHATSAPP_URL=https://wa.me/447534496595
```

Create the two Payment Links in Stripe (Products → Payment links). Prices
default to €178 and €119 to match what was live on Systeme; change them in
Stripe and override `REACT_APP_TIER_2_PRICE` / `REACT_APP_TIER_3_PRICE` so the
page label matches. A tier with no link still converts — it falls back to the
contact form rather than showing a dead button.

### 6. Rebuild the sequences that were in Systeme

The mechanism is here; the *content* of the old Systeme campaigns is not — those
pages could not be read from this environment. For each Systeme campaign, open
Admin → **Automations** → New automation, pick the trigger, and add its emails
with their delays.

The LTE Welcome campaign is the one to do first: trigger *"Someone joins the
mailing list"*, then the same emails and gaps Systeme had.

### 7. Export the Systeme contacts, then cancel

Systeme → Contacts → Export CSV. Check the list in Admin → **Subscribers**
after import. **Do not cancel the subscription until this export is safely in
hand** — the contact list is the one thing that cannot be rebuilt.

### 8. Point the subdomain

`lte.debowoseni.com` can redirect to `debowoseni.com/programmes`, or be retired.
Nothing in this codebase references it.

---

## Running it day to day

### Automations (Systeme's "rules")

Admin → **Automations**. A sequence is a trigger plus emails on delays.

Triggers available: someone joins the list, a tag is added, someone registers
for an event, someone joins the community, or manual.

Delays count from the previous email, so `0 → 2 → 5` means immediately, two days
later, then five days after that. "Send anything due now" on a sequence lets you
test without waiting for the hourly run.

Two safeguards worth knowing: nobody is enrolled in the same sequence twice, and
the subscriber's status is re-checked at send time — unsubscribing mid-series
stops the rest of it.

### Events

Admin → **Events** → Registration → *"Take sign-ups on this site"*. Add a
capacity if the room is limited (Leicester caps at 10); anyone past it is
waitlisted rather than turned away. Sign-ups land in Admin → **Registrations**.

Mark people *attended* after the event — that record is what makes the follow-up
worth sending, and it shows up on their timeline.

### Community

`/community` takes the join and hands back the WhatsApp invite. The site owns
the membership record and the tag; WhatsApp hosts the conversation, which is
where the audience already is and what the LTE programmes already promise.

Set `COMMUNITY_LTE_INVITE_URL` to the WhatsApp group invite link. Without it the
join is still recorded, and the page says Debo will send the link by email.

### People (the CRM)

Admin → **People**. Everyone the site knows about, merged by email — subscribers,
event registrants, community members, programme enrolments. Open anyone for a
single merged timeline: what they subscribed to, which events they registered
for and attended, which emails they received, what they wrote in the contact
form, and which programmes they are in.

Programme enrolments are added from a person's page: pick the programme, the
stage (enquired → booked → paid → in progress → completed) and the amount.

### Emails

Admin → **Emails** for one-off broadcasts. Write in plain text; `# heading`,
`**bold**`, `*italic*`, `[link](url)`, `- bullet` and `---` all work. Pick a
segment, **send yourself a test first**, then send.

Every email — broadcast and automated alike — carries a working unsubscribe link
and the `List-Unsubscribe` header Gmail and Yahoo require. Unsubscribed people
are excluded from every future send automatically.

---

## Warming up the domain

Before any large send: a few dozen of the most engaged people, then a few
hundred, then everyone. Blasting a cold list from a brand-new sending domain is
the one mistake that is genuinely hard to undo — it damages the reputation of
`debowoseni.com` itself, the same domain Debo sends personal mail from.

---

## Known gaps

**Open and click tracking.** `campaign_sends` has `opened_at` and `clicked_at`
columns and the statuses to match, but nothing writes to them — that needs a
Resend webhook endpoint. Sent/failed counts are live and accurate today.

**Sequence content.** The mechanism is complete; the emails from the old Systeme
campaigns have to be re-entered by hand, because those pages were unreachable
from the build environment.
