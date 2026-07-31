/* =========================================================================
   Distil — website → AI build-prompt engine
   Everything runs client-side. We fetch a target page's public HTML through
   read-only CORS proxies, parse the markup locally, distil its structure,
   design system, content and tech signals, then assemble a tool-tuned prompt.
   ========================================================================= */
(function () {
  "use strict";

  // ---------------------------------------------------------------- helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    target: "generic", busy: false,
    lastPrompt: "", lastHost: "",
    lastAnalysis: null, lastVia: "",
  };

  const els = {
    form: $("#urlform"),
    url: $("#url"),
    go: $("#go"),
    chips: $("#targetChips"),
    manualToggle: $("#manualToggle"),
    manualBox: $("#manualBox"),
    manualHtml: $("#manualHtml"),
    status: $("#status"),
    statusRow: $("#statusRow"),
    statusFill: $("#statusFill"),
    result: $("#result"),
    resultMeta: $("#resultMeta"),
    resultInsights: $("#resultInsights"),
    palette: $("#palette"),
    stats: $("#stats"),
    promptOut: $("#promptOut"),
    copyBtn: $("#copyBtn"),
    downloadBtn: $("#downloadBtn"),
    toast: $("#toast"),
  };

  const uniq = (arr) => Array.from(new Set(arr));
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function setStatus(html, pct) {
    els.status.hidden = false;
    els.statusRow.innerHTML = html;
    if (typeof pct === "number") els.statusFill.style.width = pct + "%";
  }

  function normalizeUrl(raw) {
    let u = clean(raw);
    if (!u) return null;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try {
      const parsed = new URL(u);
      if (!parsed.hostname.includes(".")) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  // ------------------------------------------------------------- fetch layer
  // A rotating set of read-only proxies. Each returns the target's raw HTML so
  // we can parse the DOM. jina.ai is a text-only last resort.
  const PROXIES = [
    { name: "allorigins", url: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, kind: "html" },
    { name: "corsproxy", url: (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`, kind: "html" },
    { name: "codetabs", url: (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`, kind: "html" },
    { name: "jina", url: (u) => `https://r.jina.ai/${u}`, kind: "text" },
  ];

  async function fetchWithTimeout(url, ms = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.text();
    } finally {
      clearTimeout(t);
    }
  }

  async function fetchSource(url) {
    for (let i = 0; i < PROXIES.length; i++) {
      const p = PROXIES[i];
      setStatus(`Fetching page source <span class="warn">· via ${p.name}</span>`, 15 + i * 12);
      try {
        const body = await fetchWithTimeout(p.url(url));
        if (body && body.length > 120) return { body, kind: p.kind, via: p.name };
      } catch (e) {
        /* try next proxy */
      }
    }
    return null;
  }

  // --------------------------------------------------------------- analysis
  function analyzeHtml(html, targetUrl) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const host = targetUrl.hostname.replace(/^www\./, "");
    const A = {
      host,
      url: targetUrl.href,
      title: "",
      description: "",
      lang: doc.documentElement.getAttribute("lang") || "",
      headings: [],
      nav: [],
      ctas: [],
      sections: [],
      colors: [],
      fonts: [],
      themeColor: "",
      imageCount: 0,
      hasForm: false,
      hasVideo: false,
      social: [],
      tech: [],
      generator: "",
      wordSample: "",
    };

    const meta = (sel, attr = "content") => {
      const el = doc.querySelector(sel);
      return el ? clean(el.getAttribute(attr)) : "";
    };

    A.title = clean(doc.querySelector("title")?.textContent) ||
      meta('meta[property="og:title"]') || host;
    A.description = meta('meta[name="description"]') ||
      meta('meta[property="og:description"]') || "";
    A.themeColor = meta('meta[name="theme-color"]');
    A.generator = meta('meta[name="generator"]');

    // Headings (structure + content voice)
    A.headings = uniq(
      $$("h1, h2, h3", doc).map((h) => ({
        level: h.tagName.toLowerCase(),
        text: clean(h.textContent),
      })).filter((h) => h.text && h.text.length < 120)
       .map((h) => `${h.level}:${h.text}`)
    ).slice(0, 40).map((s) => {
      const i = s.indexOf(":");
      return { level: s.slice(0, i), text: s.slice(i + 1) };
    });

    // Navigation labels
    const navRoot = doc.querySelector("nav, header");
    if (navRoot) {
      A.nav = uniq(
        $$("a", navRoot).map((a) => clean(a.textContent)).filter((t) => t && t.length < 24)
      ).slice(0, 12);
    }

    // Buttons / CTAs
    A.ctas = uniq(
      $$('a, button, [role="button"]', doc)
        .map((b) => clean(b.textContent))
        .filter((t) => t && t.length >= 2 && t.length < 30)
        .filter((t) => /(get|start|try|sign|buy|book|join|demo|free|contact|download|learn|explore|subscribe|shop|add|create|build|go|request|see)/i.test(t))
    ).slice(0, 12);

    // Sections (semantic + common wrapper ids/classes)
    const secEls = $$("section, [data-section], footer, header, main > div", doc);
    const secNames = [];
    secEls.forEach((s) => {
      const key = (s.id || s.className || s.getAttribute("data-section") || "").toString().toLowerCase();
      const label = clean(s.querySelector("h1,h2,h3")?.textContent || "");
      if (label) secNames.push(label);
      else if (key) {
        const m = key.match(/(hero|feature|pricing|testimonial|footer|header|cta|gallery|team|contact|faq|stats|logo|banner|about|service|product|blog|newsletter)/);
        if (m) secNames.push(cap(m[1]));
      }
    });
    A.sections = uniq(secNames).slice(0, 16);

    // Colours — inline styles + CSS custom props inside inline <style>
    const colorHits = [];
    $$("[style]", doc).slice(0, 400).forEach((el) => {
      const m = el.getAttribute("style").match(/#[0-9a-f]{3,8}\b|rgba?\([^)]+\)/gi);
      if (m) colorHits.push(...m);
    });
    $$("style", doc).forEach((st) => {
      const m = (st.textContent || "").match(/#[0-9a-f]{6}\b/gi);
      if (m) colorHits.push(...m);
    });
    if (A.themeColor) colorHits.unshift(A.themeColor);
    A.colors = topN(colorHits.map((c) => c.toLowerCase()), 6);

    // Fonts — google fonts links + font-family declarations
    const fontHits = [];
    $$('link[href*="fonts.googleapis"]', doc).forEach((l) => {
      const m = decodeURIComponent(l.getAttribute("href") || "").match(/family=([^:&]+)/g);
      if (m) m.forEach((x) => fontHits.push(x.replace("family=", "").replace(/\+/g, " ")));
    });
    $$("style", doc).forEach((st) => {
      const m = (st.textContent || "").match(/font-family:\s*([^;}]+)/gi);
      if (m) m.forEach((x) => {
        const fam = x.replace(/font-family:\s*/i, "").split(",")[0].replace(/['"]/g, "").trim();
        if (fam && !/^(inherit|initial|sans-serif|serif|monospace|system-ui|-apple-system)$/i.test(fam)) fontHits.push(fam);
      });
    });
    A.fonts = topN(fontHits, 4);

    // Media / forms
    A.imageCount = doc.querySelectorAll("img, picture, svg").length;
    A.hasForm = !!doc.querySelector("form, input, textarea");
    A.hasVideo = !!doc.querySelector("video, iframe[src*='youtube'], iframe[src*='vimeo']");

    // Social links
    A.social = uniq(
      $$('a[href]', doc)
        .map((a) => a.getAttribute("href") || "")
        .map((h) => (h.match(/(twitter|x\.com|linkedin|instagram|facebook|github|youtube|tiktok|discord)/i) || [])[1])
        .filter(Boolean)
        .map((s) => (s === "x.com" ? "twitter" : s.toLowerCase()))
    ).slice(0, 8);

    // Tech signals
    A.tech = detectTech(doc, html, A.generator);

    // Content voice sample
    const paras = $$("p", doc).map((p) => clean(p.textContent)).filter((t) => t.length > 40);
    A.wordSample = paras.slice(0, 3).join(" ").slice(0, 400);

    return A;
  }

  function analyzeText(text, targetUrl) {
    // Fallback path (jina text/markdown) — extract headings + copy only.
    const host = targetUrl.hostname.replace(/^www\./, "");
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const headings = [];
    lines.forEach((l) => {
      const m = l.match(/^(#{1,3})\s+(.*)/);
      if (m && m[2].length < 120) headings.push({ level: "h" + m[1].length, text: clean(m[2]) });
    });
    const title = headings.find((h) => h.level === "h1")?.text || host;
    const paras = lines.filter((l) => !/^#/.test(l) && l.length > 50);
    return {
      host, url: targetUrl.href, title,
      description: paras[0]?.slice(0, 200) || "",
      lang: "", headings: uniqHeadings(headings).slice(0, 30),
      nav: [], ctas: [], sections: [], colors: [], fonts: [],
      themeColor: "", imageCount: 0, hasForm: false, hasVideo: false,
      social: [], tech: [], generator: "",
      wordSample: paras.slice(0, 3).join(" ").slice(0, 400),
      _textOnly: true,
    };
  }

  function uniqHeadings(list) {
    const seen = new Set(); const out = [];
    list.forEach((h) => { const k = h.level + h.text; if (!seen.has(k)) { seen.add(k); out.push(h); } });
    return out;
  }

  function topN(arr, n) {
    const counts = {};
    arr.forEach((x) => { if (x) counts[x] = (counts[x] || 0) + 1; });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, n);
  }

  function detectTech(doc, html, generator) {
    const t = [];
    const has = (re) => re.test(html);
    if (generator) {
      if (/wordpress/i.test(generator)) t.push("WordPress");
      else if (/wix/i.test(generator)) t.push("Wix");
      else if (/webflow/i.test(generator)) t.push("Webflow");
      else if (/squarespace/i.test(generator)) t.push("Squarespace");
      else if (/ghost/i.test(generator)) t.push("Ghost");
      else t.push(cap(generator.split(" ")[0]));
    }
    if (has(/__NEXT_DATA__|\/_next\//)) t.push("Next.js");
    else if (has(/data-reactroot|react(?:-dom)?(?:\.production)?\.min\.js|__reactContainer/)) t.push("React");
    if (has(/__NUXT__|\/_nuxt\//)) t.push("Nuxt");
    else if (has(/data-v-[0-9a-f]{8}|vue(?:\.runtime)?(?:\.min)?\.js/)) t.push("Vue");
    if (has(/ng-version|angular/i) && has(/ng-version/)) t.push("Angular");
    if (has(/svelte/i) && has(/svelte-[0-9a-z]/)) t.push("Svelte");
    if (has(/cdn\.shopify|myshopify\.com|Shopify\./)) t.push("Shopify");
    if (has(/gatsby/i) && has(/___gatsby/)) t.push("Gatsby");
    if (has(/astro-island|astro-/)) t.push("Astro");
    // Tailwind: utility-class fingerprint
    if (has(/\b(?:flex|grid|hidden)\b[^"]*\b(?:items-center|justify-between|gap-\d|px-\d|py-\d|md:)/) ||
        doc.querySelector('[class*="md:"],[class*="lg:"]')) t.push("Tailwind CSS");
    if (has(/bootstrap(?:\.min)?\.css|class="[^"]*\b(container|row|col-(?:md|lg|sm))\b/)) t.push("Bootstrap");
    if (doc.querySelector('[data-framer-name], [class*="framer-"]')) t.push("Framer");
    return uniq(t).slice(0, 5);
  }

  // ---------------------------------------------------------- prompt builder
  const TARGETS = {
    generic: {
      label: "your AI builder",
      intro: (a) =>
        `You are a senior product engineer and designer. Build a modern, responsive, production-quality website inspired by the reference below. Match its structure, layout, and aesthetic — but write original code and copy.`,
      outro: `Deliver clean, semantic, accessible HTML/CSS (and JS where needed). Make it fully responsive and pixel-tidy. Explain any assumptions briefly, then output the full code.`,
    },
    cursor: {
      label: "Cursor",
      intro: (a) =>
        `# Role\nYou are pair-programming in Cursor. Scaffold a new project that recreates the *feel* of the reference site as a clean React + Tailwind CSS application. Prefer small, composable components and a clear file structure.`,
      outro: `Work step by step: propose the file tree first, then generate each component. Use Tailwind utility classes, semantic HTML, and accessible patterns. Keep copy original but on-brand with the reference.`,
    },
    claude: {
      label: "Claude",
      intro: (a) =>
        `You are an expert front-end engineer. I want to rebuild the vibe of a reference website as a single, self-contained, responsive page. Think carefully about layout hierarchy and visual rhythm before writing code.`,
      outro: `Produce one polished HTML file with embedded CSS (and minimal JS if useful). Prioritise typography, spacing, and a cohesive colour system. Keep all copy original. After the code, list 3 ways I could make it more distinct.`,
    },
    v0: {
      label: "v0",
      intro: (a) =>
        `Generate a React + Tailwind + shadcn/ui landing page that captures the structure and aesthetic of the reference below. Use the shadcn component library where it fits.`,
      outro: `Output modern, responsive components with sensible defaults. Use placeholder imagery. Keep the design system consistent (one accent colour, one type pairing).`,
    },
    bolt: {
      label: "Bolt",
      intro: (a) =>
        `Create a full web project in Bolt that recreates the layout and vibe of the reference site. Use Vite + React + Tailwind CSS. Set up the whole project so it runs immediately.`,
      outro: `Scaffold the project, install what you need, and build each section as a component. Make it responsive and deployable. Original copy only.`,
    },
    lovable: {
      label: "Lovable",
      intro: (a) =>
        `Build a responsive marketing website in Lovable inspired by the reference below. Use a clean React + Tailwind stack and keep the UI polished and modern.`,
      outro: `Create each section as its own component, wire up smooth scrolling and hover states, and ensure mobile looks great. Keep the copy original and the palette cohesive.`,
    },
    chatgpt: {
      label: "ChatGPT",
      intro: (a) =>
        `Act as a senior web designer and developer. Using the structured brief below, build a modern, responsive website that captures the same layout and mood.`,
      outro: `Return a complete, self-contained HTML document with embedded CSS. Make it responsive, accessible, and visually refined. Use original copy and placeholder images.`,
    },
  };

  function buildPrompt(a, target) {
    const T = TARGETS[target] || TARGETS.generic;
    const L = [];
    const push = (...x) => L.push(...x);

    push(T.intro(a), "");
    push("---", "");
    push(`## Reference site`);
    push(`- Source: ${a.url}`);
    push(`- Name / title: ${a.title || a.host}`);
    if (a.description) push(`- Meta description: "${a.description}"`);
    if (a.lang) push(`- Language: ${a.lang}`);
    push("");

    if (a.tech.length) {
      push(`## Detected stack (signals — rebuild with your preferred equivalent)`);
      push(a.tech.map((x) => `- ${x}`).join("\n"), "");
    }

    // Design system
    push(`## Design system`);
    if (a.colors.length) push(`- Colour palette (sampled): ${a.colors.join(", ")}`);
    else push(`- Colour palette: infer a cohesive palette that matches the mood (define one primary accent, neutrals, and a background).`);
    if (a.themeColor) push(`- Browser theme colour: ${a.themeColor}`);
    if (a.fonts.length) push(`- Typography: ${a.fonts.join(", ")}${a.fonts.length === 1 ? " (pair with a complementary neutral for body)" : ""}`);
    else push(`- Typography: choose a confident display face for headings and a clean, readable sans for body.`);
    push(`- Aesthetic: ${describeAesthetic(a)}`);
    push(`- Feel: capture the *energy* and rhythm of the reference (spacing, contrast, motion) rather than copying pixels.`);
    push("");

    // Layout & sections
    push(`## Layout & sections`);
    if (a.nav.length) push(`- Primary nav: ${a.nav.join(" · ")}`);
    const order = deriveSectionOrder(a);
    order.forEach((s, i) => push(`${i + 1}. ${s}`));
    push("");

    // Content
    if (a.headings.length) {
      push(`## Content & hierarchy (real headings from the page — reword into original copy)`);
      a.headings.slice(0, 22).forEach((h) => push(`- [${h.level.toUpperCase()}] ${h.text}`));
      push("");
    }
    if (a.ctas.length) {
      push(`## Calls to action`);
      push(a.ctas.map((c) => `- "${c}"`).join("\n"), "");
    }
    if (a.wordSample) {
      push(`## Voice & tone sample`);
      push(`> ${a.wordSample}`, "");
    }

    // Components / media
    const comps = [];
    if (a.hasForm) comps.push("forms / inputs (e.g. sign-up, contact, or newsletter)");
    if (a.hasVideo) comps.push("embedded video or media");
    if (a.imageCount) comps.push(`rich imagery (~${a.imageCount} image/icon elements — use tasteful placeholders)`);
    if (a.social.length) comps.push(`social links: ${a.social.join(", ")}`);
    if (comps.length) {
      push(`## Components & media`);
      push(comps.map((c) => `- ${c}`).join("\n"), "");
    }

    // Requirements
    push(`## Requirements`);
    push(`- Fully responsive (mobile-first), with smooth hover/scroll states.`);
    push(`- Semantic, accessible markup (landmarks, alt text, focus states, adequate contrast).`);
    push(`- A single cohesive accent colour and one type pairing throughout.`);
    push(`- Original copy and placeholder assets — do not reproduce the reference's exact text, logos, or images.`);
    push("");
    push("---", "");
    push(T.outro);

    if (a._textOnly) {
      push("", `> Note: this brief was built from a text-only read of the page (live HTML fetch was limited), so design details are inferred. Refine the palette and layout to taste.`);
    }
    return L.join("\n");
  }

  function describeAesthetic(a) {
    const bits = [];
    const dark = a.colors.some((c) => isDark(c)) || /dark/i.test(a.themeColor);
    if (a.colors.length) bits.push(dark ? "leans dark / high-contrast" : "bright and clean");
    if (a.fonts.some((f) => /grotesk|mono|space|neue|sans/i.test(f))) bits.push("modern & techy");
    if (a.fonts.some((f) => /serif|playfair|fraunces|garamond|georgia/i.test(f))) bits.push("editorial / refined");
    if (a.imageCount > 30) bits.push("image-rich and visual");
    if (!bits.length) bits.push("clean, modern, and professional");
    return bits.join(", ");
  }

  function isDark(hex) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return false;
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) < 110;
  }

  function deriveSectionOrder(a) {
    if (a.sections.length >= 3) {
      // Ensure a hero-like first item and footer last.
      const s = a.sections.slice();
      return s;
    }
    // Sensible default scaffold when we couldn't detect sections.
    const base = ["Sticky navigation bar with logo and primary links"];
    base.push(`Hero — headline${a.headings[0] ? ` (echoing "${a.headings[0].text}")` : ""}, subtext, and a primary CTA`);
    base.push("Social proof / logo strip");
    base.push("Feature or benefit grid (3–6 cards)");
    if (a.hasForm) base.push("Lead-capture / newsletter section");
    base.push("Secondary content — how it works, testimonials, or gallery");
    base.push("Closing call-to-action band");
    base.push("Footer with columns, links, and legal line");
    return base;
  }

  // ------------------------------------------------------------------ run it
  async function run(rawUrl) {
    if (state.busy) return;
    const target = normalizeUrl(rawUrl);
    const manual = clean(els.manualHtml.value);

    if (!target && !manual) {
      toast("Enter a valid URL (e.g. stripe.com)");
      els.url.focus();
      return;
    }

    state.busy = true;
    els.go.classList.add("is-loading");
    els.go.disabled = true;
    els.result.hidden = true;
    els.statusFill.style.width = "0%";

    try {
      let analysis, via = "manual paste";
      const targetUrl = target || new URL("https://pasted.local/");

      if (manual) {
        setStatus("Analysing pasted source…", 60);
        analysis = analyzeHtml(manual, targetUrl);
      } else {
        setStatus("Resolving " + target.hostname + "…", 8);
        const fetched = await fetchSource(target.href);
        if (!fetched) {
          throw new Error(
            "Couldn't fetch that page (it may block proxies). Try the “Paste source manually” option below the input."
          );
        }
        via = fetched.via;
        setStatus(`Parsing markup <span class="ok">· ${fetched.via}</span>`, 72);
        analysis = fetched.kind === "text"
          ? analyzeText(fetched.body, target)
          : analyzeHtml(fetched.body, target);
      }

      setStatus("Distilling the design system & structure…", 88);
      state.lastAnalysis = analysis;
      state.lastVia = via;
      const prompt = buildPrompt(analysis, state.target);
      state.lastPrompt = prompt;
      state.lastHost = analysis.host;

      setStatus('<span class="ok">✓ Prompt ready</span>', 100);
      renderResult(analysis, prompt, via);
    } catch (err) {
      setStatus(`<span class="warn">${(err && err.message) || "Something went wrong."}</span>`, 100);
      toast("Couldn't distil that one — try manual paste");
    } finally {
      state.busy = false;
      els.go.classList.remove("is-loading");
      els.go.disabled = false;
      setTimeout(() => { els.status.hidden = true; }, 900);
    }
  }

  function renderResult(a, prompt, via) {
    const facts = [];
    if (a.sections.length) facts.push(`${a.sections.length} sections`);
    if (a.colors.length) facts.push(`${a.colors.length} colours`);
    if (a.fonts.length) facts.push(`${a.fonts.length} fonts`);
    if (a.tech.length) facts.push(a.tech.join(" · "));
    els.resultMeta.innerHTML =
      `<b>${a.host}</b> → ${TARGETS[state.target].label} prompt` +
      (facts.length ? ` · ${facts.join(" · ")}` : "") +
      ` · <span style="opacity:.6">source: ${via}</span>`;
    // Detected-palette swatches
    const swatches = (a.colors || []).filter((c) => /^#|^rgb/.test(c)).slice(0, 6);
    if (swatches.length) {
      els.palette.innerHTML = swatches
        .map((c) => `<span class="swatch"><i style="background:${cssColor(c)}"></i>${c}</span>`)
        .join("");
    } else {
      els.palette.innerHTML = '<span class="swatch" style="padding-left:10px">palette inferred</span>';
    }

    // Live prompt stats — chars, words, ~tokens (≈4 chars/token heuristic)
    const chars = prompt.length;
    const words = (prompt.match(/\S+/g) || []).length;
    const tokens = Math.round(chars / 4);
    els.stats.innerHTML =
      `<span><b>${words.toLocaleString()}</b> words</span>` +
      `<span><b>${chars.toLocaleString()}</b> chars</span>` +
      `<span>~<b>${tokens.toLocaleString()}</b> tokens</span>`;
    els.resultInsights.hidden = false;

    els.promptOut.textContent = prompt;
    els.result.hidden = false;
    els.result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Guard against untrusted colour strings landing in inline style.
  function cssColor(c) {
    return /^#[0-9a-f]{3,8}$/i.test(c) || /^rgba?\([\d.,\s%]+\)$/i.test(c) ? c : "transparent";
  }

  // --------------------------------------------------------------- UI wiring
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(els.url.value);
  });

  els.chips.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    $$(".chip", els.chips).forEach((c) => c.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.target = btn.dataset.target;
    // Re-target instantly from the cached analysis — no re-fetch needed.
    if (state.lastAnalysis) {
      const prompt = buildPrompt(state.lastAnalysis, state.target);
      state.lastPrompt = prompt;
      renderResult(state.lastAnalysis, prompt, state.lastVia);
    }
  });

  $$(".sample").forEach((b) =>
    b.addEventListener("click", () => {
      els.url.value = b.dataset.url;
      run(b.dataset.url);
    })
  );

  els.manualToggle.addEventListener("click", () => {
    const open = els.manualBox.hidden;
    els.manualBox.hidden = !open;
    els.manualToggle.setAttribute("aria-expanded", String(open));
    if (open) els.manualHtml.focus();
  });

  els.copyBtn.addEventListener("click", async () => {
    if (!state.lastPrompt) return;
    try {
      await navigator.clipboard.writeText(state.lastPrompt);
      toast("Prompt copied to clipboard");
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = state.lastPrompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Prompt copied");
    }
  });

  els.downloadBtn.addEventListener("click", () => {
    if (!state.lastPrompt) return;
    const blob = new Blob([state.lastPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distil-${state.lastHost || "prompt"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Downloaded .md");
  });

  // Reveal-on-scroll
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("in")),
    { threshold: 0.12 }
  );
  $$(".step, .feature, .use, .qa, .section__head").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });

  // Year
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
