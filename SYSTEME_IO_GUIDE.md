# Wiring debowoseni.com ↔ Systeme.io — Step-by-Step Guide

This guide connects everything this site already captures (quiz emails, newsletter
sign-ups, contact-form leads) into Systeme.io, where your funnels, email automations
and the LTE sales page live.

---

## 0. What the site already does (no action needed)

| Capture point | Where | Stored in |
|---|---|---|
| "Start the Enquiry" quiz email gate | LTE page, Academic, Marriage 101, The Enquiry | Supabase `subscribers` |
| Newsletter form | Site footer (every page) | Supabase `subscribers` |
| Contact form | /contact | Supabase `contact_messages` |
| Upsell hand-off | Every LTE CTA → `lte.debowoseni.com/programmes` | Systeme (already yours) |

Admin panel → **Subscribers** tab (`/admin/subscribers`) shows every captured email
with a one-click **Export CSV** button.

---

## Phase 1 — Manual sync via CSV (works today, 5 minutes/week)

1. Log in at `yoursite.com/admin/login` → open **Subscribers** → click **Export CSV**.
2. In Systeme.io: **Contacts → Import contacts**.
3. Upload the CSV. Map the `email` column to *Email*. Skip `subscribed_at` or map to a custom field.
4. **Add a tag during import** — e.g. `website-capture`. Tags are how Systeme automations are triggered.
5. (Optional) Create a second tag batch for contact-form leads if you export those separately later.

> Do this weekly (or after any campaign) until Phase 2 is wired.

## Phase 2 — Automatic sync via the Systeme API (recommended, I build this for you)

What you do:
1. In Systeme.io go to **Settings → Public API keys → Create API key**. Copy it.
2. Paste the key to me in chat (it goes into the backend `.env` as `SYSTEME_API_KEY` — never in code).

What I then build (one session of work):
- Backend pushes every new capture straight into Systeme **the moment it happens**:
  - Quiz captures → tag `quiz-<result>` (e.g. `quiz-lte`, `quiz-marriage101`) — so you know what they need before you ever email them.
  - Footer newsletter → tag `newsletter`.
  - Contact form → tag `contact-lead` (+ name & message stored as a note/custom field).
- Supabase remains the backup record, the admin tab keeps working.
- API used: `POST https://api.systeme.io/api/contacts` with `X-API-Key` header (free plan includes API access).

## Phase 3 — Automations inside Systeme.io (you, ~30 min, no code)

1. **Welcome sequence**: Automations → Rules → *"When tag `website-capture` (or `newsletter`) is added → subscribe to campaign 'Welcome'"*. Write a 3–5 email warm-up sequence.
2. **Quiz-driven funnels** (after Phase 2): one rule per tag —
   - `quiz-lte` → campaign that sells the 3 LTE pathways → links to `lte.debowoseni.com/programmes`.
   - `quiz-marriage101` / `quiz-academic` → nurture emails → CTA to the contact form (custom-priced offers).
3. **Contact leads**: tag `contact-lead` → notify yourself (Rule: send email notification) so no enquiry waits.

## Phase 4 — Funnel & domain hygiene

- Keep pricing **only** on `lte.debowoseni.com` (this site deliberately never shows it — the warm-up happens here, the reveal happens there).
- Add UTM tags to Systeme links if you want source reporting, e.g. `?utm_source=debowoseni.com&utm_medium=lte-page&utm_campaign=tier-1`.
- When the main domain goes live, both stay as-is: main site on your deployment, `lte.` subdomain stays pointed at Systeme — no DNS changes needed.

## Quick checklist

- [ ] Phase 1: first CSV import + `website-capture` tag
- [ ] Welcome campaign live in Systeme
- [ ] Phase 2: send me your Systeme API key → I wire real-time sync + result tags
- [ ] Quiz-tag automation rules
- [ ] Contact-lead notification rule
