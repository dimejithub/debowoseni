# Email setup — debowoseni.com

How mail flows, and the one-time dashboard setup that isn't in code.

## What the code already does
The site **sends** via Resend, always as:
- **From / Reply-To:** `hello@debowoseni.com` (`MAIL_FROM` / `MAIL_REPLY_TO` in `backend/mailer.py`, set in `render.yaml`).

Resend **only sends** — it never receives. Where mail *to* `hello@` (and replies)
lands is decided by DNS (MX records), set up once in Cloudflare. No code change
is needed for any of the below.

## Goal
```
Client emails hello@debowoseni.com
        │  Cloudflare Email Routing  (receiving)
        ▼
debowoseni.events@gmail.com     ← Debo reads it here
        │  Gmail "Send mail as"      (replying)
        ▼
Client sees the reply from  hello@debowoseni.com
```

## Part 1 — Receiving (Cloudflare Email Routing, free) — DO THIS FIRST
Without it, mail to `hello@` bounces.
1. Cloudflare dashboard → **debowoseni.com** → **Email → Email Routing → Enable**.
   It auto-adds MX + TXT records. This does NOT affect Resend sending.
2. **Routing rules → Custom addresses → Create:**
   `hello@debowoseni.com`  →  `debowoseni.events@gmail.com`
3. **Catch-all address** (same screen): toggle **on**, Action **Send to an email**,
   Destination `debowoseni.events@gmail.com`, **Save**. Now *anything*@debowoseni.com
   forwards to the Gmail; the `hello@` rule still takes precedence.
4. Cloudflare emails a **confirmation link to the Gmail** — click it once to verify.

> If DNS is not on Cloudflare, use ImprovMX (free) for the same forwarding, or
> move DNS to Cloudflare first.

## Part 2 — Replying as hello@ (Gmail "Send mail as")
So recipients see `hello@`, not the Gmail.
1. In **debowoseni.events@gmail.com**: Settings → **Accounts and Import →
   "Send mail as" → Add another email address**.
2. Name **Debo Owoseni**, Email **hello@debowoseni.com**, keep "Treat as an alias" → Next.
3. SMTP server (authenticated send, via the already-verified Resend domain):
   - Server: `smtp.resend.com`   Port: `465` (SSL)
   - Username: `resend`
   - Password: a **Resend API key** (Resend dashboard → API Keys). Keep it secret.
4. Gmail sends a **confirmation code to hello@** → it forwards to the Gmail (Part 1) → enter it.
5. Accounts and Import → set **"Reply from the same address the message was sent to."**

## Notes
- Debo's manual replies go through Resend SMTP and count toward Resend sending
  volume — negligible for personal replies.
- A catch-all attracts more spam over time; narrow it to specific addresses if it gets noisy.
- The website **contact form** is separate: those messages are stored and shown in
  **admin → Enquiries**, so that channel works regardless of the above.
- `admin@debowoseni.com` is only the CMS login identity (Supabase Auth); it does not
  need to be a real mailbox.
