# PokéForge — Technical Reference

Single-file HTML Pokémon generator. Open `pokeforge_4.html` in any browser — no server, no build step.

---

## Architecture

Everything lives in one file: `<style>` block → `<div id="pokeforge">` HTML → `<script>` IIFE.

State is a flat object:
```js
state = {
  rarity, typeCount, type1, type2, isMystery, isSpecial1, isSpecial2,
  stage, perk, perkDetail, stats, name, species, flavor,
  aiArtData, dexNum, step, spinning, lastAiError
}
```

Storage uses a 3-tier fallback: `window.storage` → `localStorage` → in-memory. Pokédex saved under `pokeforge:dex:all`, AI config under `pokeforge:ai-config`.

---

## AI Art Backends

Default backend is **Pollinations.ai** (free, no signup). Anthropic backends are optional.

| Backend | Cost | Setup | Output |
|---|---|---|---|
| `pollinations` | Free | None | JPEG via Flux model |
| `anthropic-direct` | Paid | Paste API key in ⚙ AI SETTINGS | SVG |
| `anthropic-proxy` | Paid | Run `pokeforge-proxy.js` on localhost | SVG |
| `anthropic-claudeai` | Paid | Only works inside claude.ai preview | SVG |

### Pollinations

URL format: `https://image.pollinations.ai/prompt/{prompt}?width=512&height=512&seed={n}&model=flux&nologo=true`

- Anonymous tier: 1 request per 15 seconds
- Same seed + same prompt = same image (deterministic)
- CORS-open: works from `file://`

**Prompt strategy:** `buildPollinationsPrompt()` uses "official pokemon art, ken sugimori style" keywords with type→color-name mapping (hex codes don't work well in diffusion models).

**Known null-origin CORS fix:** `fetch()` fails in `file://` / `about:srcdoc` contexts. Fallback: load image via `<img>` tag (bypasses CORS) and store the URL directly instead of a data URL.

### Anthropic (optional, paid)

Default model: `claude-opus-4-7`. The `anthropic-dangerous-direct-browser-access: true` header is required for direct browser calls to bypass CORS.

**If AI art fails:** Check the COPY FULL LOG button in the error panel. Common causes:
- Rate limited (HTTP 429) — wait 15s and retry
- Null-origin CORS block — IMG fallback should handle this automatically
- API key invalid or missing (Anthropic backends)

### Art generation rules

AI art generates **once per forge** and locks. The button shows "✓ ART LOCKED" after success and cannot be clicked again. Reset (HOME button) clears the art.

---

## Running the proxy

For Anthropic backends without a browser-visible key:

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-...
node pokeforge-proxy.js
```

Then set backend to `ANTHROPIC via local proxy` in ⚙ AI SETTINGS.

---

## Data model

**Rarities** (5): NORMAL · STARTER · SEMI-PSEUDO · PSEUDO-LEGENDARY · LEGENDARY  
**Types** (18 canon + 30 special = 48 total): stored in `TYPES` + `SPECIAL_TYPES` → `ALL_TYPES_POOL`  
**Perks** (5): STANDARD ABILITY · HIDDEN ABILITY · SIGNATURE MOVE · MEGA EVOLUTION · GIGANTAMAX  
**Stats** (6): HP · ATK · DEF · SPA · SPD · SPE — rolled weighted-random summing to rarity BST anchor ± 50

---

## File manifest

| File | Purpose |
|---|---|
| `pokeforge_4.html` | The game — open in any browser |
| `pokeforge-proxy.js` | Optional Node proxy for Anthropic |
| `TECHNICAL.md` | This file |
| `DESIGN.md` | Game design and aesthetic reference |
| `CLAUDE.md` | Context for Claude Code |
