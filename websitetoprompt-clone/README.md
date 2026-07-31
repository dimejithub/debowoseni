# Distil — website → AI build-prompt

A self-contained clone of [websitetoprompt.com](https://websitetoprompt.com/): paste any
website URL and Distil reverse-engineers its **layout, design system, content, and tech
signals** into a detailed, production-ready prompt you can drop into Cursor, Claude, v0,
Bolt, Lovable, or ChatGPT to rebuild the vibe.

Same job as the original — **deliberately different styling and UI** (a warm near-black
canvas with tangerine + indigo accents and a terminal-style generator card, versus the
original's neon-purple look).

## What it does

1. **Paste a URL** (or pick a sample).
2. Distil fetches the page's public HTML through read-only CORS proxies.
3. It parses the markup **locally in your browser** and extracts:
   - Title, description, language
   - Section order and page structure
   - Navigation labels and calls-to-action
   - Colour palette (inline styles, `theme-color`, CSS custom props)
   - Typography (Google Fonts links + `font-family` declarations)
   - Tech-stack signals (Next.js, React, Vue, Nuxt, Svelte, Astro, Shopify,
     WordPress, Wix, Webflow, Squarespace, Tailwind, Bootstrap, Framer…)
   - Real headings, a voice/tone sample, media, forms, and social links
4. It assembles a structured build prompt, **tuned for the AI tool you pick**
   (Cursor / Claude / v0 / Bolt / Lovable / ChatGPT / Generic).
5. **Copy** it or **download** it as Markdown.

Everything runs client-side — no sign-up, no backend, and your URLs/prompts never leave
the page.

## Run it

It's a static site with no build step. Open `index.html` directly, or serve the folder:

```bash
cd websitetoprompt-clone
python3 -m http.server 8000
# → http://localhost:8000
```

> Live URL fetching relies on public CORS proxies. If a site blocks them, use the
> **“Paste source manually”** toggle (View Source → Copy → paste) for a fully offline
> analysis — the generator works either way.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Landing page + in-browser app (hero, how-it-works, features, use cases, FAQ, footer) |
| `styles.css` | Standalone theme — responsive, animated, reduced-motion aware |
| `app.js` | Fetch pipeline, HTML analysis engine, and tool-tuned prompt builder |

## Notes

Distil captures a site's *feel* — structure, hierarchy, palette, type, and messaging —
as a brief you refine, not a pixel-perfect copy. Use it for inspiration and starting
points; respect trademarks, copy, and each site's terms.
