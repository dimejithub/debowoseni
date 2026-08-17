# Moving debowoseni.com off Systeme.io

Everything Systeme was doing — the programmes/sales page, event sign-ups and the
email list — now runs on this site. This replaces `SYSTEME_IO_GUIDE.md`, which
described the old CSV hand-off and is no longer accurate.

Stripe is untouched: it already takes the money, and it still does.

---

## What moved

| Was on Systeme | Is now |
|---|---|
| `lte.debowoseni.com/programmes` | `/programmes` on this site |
| Online Bootcamp order page (€119) | Stripe Payment Link on the tier-3 card |
| In-Person Bootcamp order page (€178) | Stripe Payment Link on the tier-2 card |
| 1-to-1 booking | Calendly, linked from the tier-1 card |
| Free Event Funnel opt-in | `/events` → on-site registration form |
| Welcome email campaign | Admin → **Emails** |
| Contact tags | Subscriber `tags` + `source` in Supabase |

Nothing on the site links to `lte.debowoseni.com` any more.

---

## Cutover, in order

### 1. Run the schema

Paste `backend/supabase_schema_phase3.sql` into the Supabase SQL editor and Run.
It is safe to re-run. It also repairs drift: the event time/price/location
columns were previously added by hand and were missing from the repo, so a fresh
deploy would have broken.

### 2. Set the backend environment

On Render:

```
RESEND_API_KEY=re_...                        # required to actually send mail
MAIL_FROM=Debo Owoseni <hello@debowoseni.com>
MAIL_REPLY_TO=hello@debowoseni.com
PUBLIC_SITE_URL=https://debowoseni.com       # used to build unsubscribe links
```

Without `RESEND_API_KEY` nothing breaks — the site runs in dry-run mode, logging
emails instead of sending them, and the dashboard shows a warning.

### 3. Verify the sending domain in Resend

**Do this before sending anything to the list.** In Resend → Domains → add
`debowoseni.com` and publish the SPF, DKIM and DMARC records it gives you.

Then warm up: send to a few dozen of the most engaged people first, then a few
hundred, then everyone. Blasting a cold list from a brand-new domain is the one
mistake that is genuinely hard to undo — it damages the reputation of
`debowoseni.com` itself, which is the same domain Debo sends personal mail from.

### 4. Set the frontend environment

```
REACT_APP_STRIPE_TIER_2_URL=https://buy.stripe.com/...   # In-person, €178
REACT_APP_STRIPE_TIER_3_URL=https://buy.stripe.com/...   # Online, €119
REACT_APP_PRICE_CURRENCY=EUR                             # default; set GBP if you re-price
REACT_APP_CALENDLY_URL=https://calendly.com/debowoseni-events/30min
REACT_APP_WHATSAPP_URL=https://wa.me/447534496595
```

Create the two Payment Links in Stripe (Products → Payment links). Prices default
to €178 and €119 to match what was live on Systeme; change them in Stripe, and
override `REACT_APP_TIER_2_PRICE` / `REACT_APP_TIER_3_PRICE` here so the page
label matches. A tier with no link set still converts — it falls back to the
contact form rather than showing a dead button.

### 5. Export the Systeme contacts before cancelling

Systeme → Contacts → Export CSV. Then Admin → **Subscribers** to check the list
looks right after import. **Do not cancel the Systeme subscription until this
export is safely in hand** — the contact list is the one thing that cannot be
rebuilt.

### 6. Point the subdomain

`lte.debowoseni.com` can now redirect to `debowoseni.com/programmes`, or be
retired entirely. Nothing in this codebase references it.

---

## Running it day to day

### Events

Admin → **Events** → set Registration to *"Take sign-ups on this site"*. Add a
capacity if the room is limited (the Leicester bootcamp is capped at 10) and
anyone past it is automatically waitlisted rather than turned away.

Sign-ups appear in Admin → **Registrations**. After the event, mark people
*attended* — that record is what makes the follow-up email worth sending.

Everyone who registers joins the mailing list tagged `event:<slug>`, so a
follow-up can be sent to exactly that room.

### Emails

Admin → **Emails** → New email. Write in plain text; `# heading`, `**bold**`,
`*italic*`, `[link](url)`, `- bullet` and `---` all work. Pick a segment,
**send yourself a test first**, then send.

Every email carries a working unsubscribe link and the `List-Unsubscribe` header
Gmail and Yahoo require. Unsubscribed people are excluded from every future send
automatically — this is not optional, and it is what keeps the domain healthy.

Segments available today: everyone, newsletter sign-ups, anyone who took a quiz,
and each individual quiz result (LTE, tier-1, tier-2, tier-3).

### Metrics

Admin dashboard shows list growth over 30 days, where subscribers came from,
registration and attendance counts, and emails sent.

---

## Two things worth knowing

**The 15-second delay is gone.** Public content is now read straight from
Supabase, which is always awake, instead of through the FastAPI backend on
Render's free tier. The backend still handles admin work, form posts and email —
a cold start there costs Debo a few seconds when he logs in, not every visitor.
Paying for Render Starter is now optional rather than necessary.

**Open engagement tracking.** `campaign_sends` has `opened_at` and `clicked_at`
columns and the statuses to match, but nothing writes to them yet — that needs a
Resend webhook endpoint. Sent/failed counts are live and accurate today.
