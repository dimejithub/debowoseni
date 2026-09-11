# Events playbook

The same simple flow works for **every** event — the admin event form *is* the
template. Fill it in, publish, and the system handles the emails. Here's the
lifecycle end to end.

## 1. Create the event (any time)

Admin panel → **Events** → fill in the form:

- **Details** — title, description.
- **When & where** — date, start/end time, venue (or platform for online).
- **Location type** — In-person or Online.
- **Online joining details** *(online events)* — leave the link blank for now if
  you don't have it yet; you can add it later (step 4).
- **Tickets & registration** — free/paid, and either take sign-ups on the site
  or point to an external link.
- **Media** — a wide cover banner (~1600×600), and optionally a teaser video.

Keep **Status = Draft** while you're still writing.

## 2. Publish → the invite goes out automatically

Set **Status = Published** and save. **The first time** an event is published,
your whole mailing list is emailed the branded invite **once**. Editing the
event afterwards never re-sends it.

- The invite lands in **Campaigns** in the dashboard with open/click stats.
- New events default to Draft on purpose, so nothing sends until you decide to.

## 3. People register → they enter the reminder pipeline

Anyone who registers (on the site) is saved under **Registrations**, added to
your contacts tagged for this event, and gets a confirmation email. Debo also
gets a "new registration" alert.

From then on they automatically receive **countdown reminders** at **7, 3, 2 and
1 days** before the event — no action needed from you.

## 4. A few days before an online event → send the joining link

When you have the Zoom / Google Meet / Teams link:

1. Open the event → **Online joining details** → paste the **video call link**
   and any **dial-in text** (numbers, PIN).
2. Under **Broadcast joining link**, choose the audience:
   - **This event's registrants** *(default)* — the people who signed up.
   - **All subscribers** — the whole mailing list (for open online events anyone
     can join).
3. Click **Send joining link**. It saves the link and emails a branded message
   with a one-tap **Join the event** button + dial-in details.

Once the link is saved, it's also folded into the remaining countdown reminders
automatically, so registrants get "Join the event" right in those emails too.

You can send the joining link more than once (e.g. a fresh nudge on the morning
of the event) — each send is recorded as its own campaign.

## 5. After the event → it moves itself to "Past"

Once the end time passes, the event automatically moves from **Live/Upcoming**
to **Past** on the public Events page, and the register button disappears. Add
photos to the **Gallery** and they take over as the memories gallery.

---

### Quick reference

| Moment | What you do | What the system does |
| --- | --- | --- |
| Anytime | Create event as Draft | — |
| Ready to announce | Set to Published | Emails the invite to the list, once |
| Someone registers | — | Confirmation + Debo alert + 7/3/2/1-day reminders |
| Few days before (online) | Paste link → Send joining link | Emails the link (registrants by default); adds it to reminders |
| After it ends | Add gallery photos | Moves event to Past automatically |
