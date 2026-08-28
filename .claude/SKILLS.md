# Design Skills & Tools

This project ships three design capabilities so any AI coding assistant (Claude Code,
Cursor, etc.) has strong UI/UX guidance when building or restyling the site.

Two are **Agent Skills** vendored into `.claude/skills/` — they load automatically for
anyone who opens this repo. The third is an **MCP server** configured in `.mcp.json`.

| Capability | Type | Location | Source |
|---|---|---|---|
| **Frontend Design** (Anthropic) | Skill | `.claude/skills/frontend-design/` | https://github.com/anthropics/skills |
| **UI/UX Pro Max** (7 skills: `ui-ux-pro-max`, `design`, `design-system`, `brand`, `ui-styling`, `banner-design`, `slides`) | Skills | `.claude/skills/*` | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| **21st.dev Magic** (search 10k+ React/Tailwind components, generate UI) | MCP server | `.mcp.json` (server `magic`) | https://21st.dev/mcp |

## 21st.dev — one setup step required

The `magic` MCP server needs a 21st.dev API key. **No key is committed** — the config
reads it from an environment variable so nothing secret lands in git:

```jsonc
// .mcp.json
"env": { "API_KEY": "${TWENTY_FIRST_API_KEY}" }
```

1. Get a key at https://21st.dev/mcp
2. Export it before launching Claude Code:
   ```bash
   export TWENTY_FIRST_API_KEY="your-key-here"
   ```
   (or add it to your shell profile / a local `.env` that is **not** committed)

Until the key is set, the two skills still work fully; only the Magic component
search/generation is inactive.

---

## Install these permanently on YOUR machine (all projects)

The skills above travel with **this repo**. To make them available in **every** project
you design — without reinstalling — install them at the **user level** on your own
computer. Run these once in a local terminal:

```bash
# 1) Frontend Design (Anthropic) — user-level skill
mkdir -p ~/.claude/skills/frontend-design
curl -fsSL https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md \
  -o ~/.claude/skills/frontend-design/SKILL.md
curl -fsSL https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/LICENSE.txt \
  -o ~/.claude/skills/frontend-design/LICENSE.txt

# 2) UI/UX Pro Max — via its official npm CLI, run inside any project you want it in
#    (Claude Code loads project-level .claude/skills automatically)
npx -y ui-ux-pro-max-cli@latest init --ai claude
#    …or install it as a Claude Code plugin (available in ALL projects):
#    /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
#    /plugin install ui-ux-pro-max@ui-ux-pro-max-skill

# 3) 21st.dev Magic (MCP) — configure your client once, globally
npx -y @21st-dev/cli@latest install claude --api-key YOUR_21ST_KEY
```

After installing, restart your AI assistant so it picks up the new skills/MCP server.
