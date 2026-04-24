# PokéForge — Claude Code Context

Single-file HTML Pokémon generator. Open `pokeforge_4.html` in any browser, no server needed.

## What this project is

A 7-step casino/carnival themed wizard that generates a unique Pokémon with AI-generated pixel-art sprite via Pollinations.ai (free, no key). Each step has its own widget (carnival wheel, coin flip, gacha machine, slot reel, lever, card deal, stat bars). No rerolls — every result is final.

## Key files

| File | Role |
|---|---|
| `pokeforge_4.html` | The entire game — ~3000 lines, single-file HTML |
| `pokeforge-proxy.js` | Optional Node proxy for Anthropic AI backend |
| `TECHNICAL.md` | Architecture, backends, data model |
| `DESIGN.md` | Design pillars, step definitions, aesthetic |

Do NOT edit `pokeforge_3.html` — it's the previous version kept for reference.

## Architecture in one paragraph

IIFE script inside a `<div id="pokeforge">`. Global `state` object tracks all wizard progress. `renderStep()` builds each step's HTML via `buildStepWidget(stepKey, segments)`. `spinStep(stepKey)` runs animations and commits results. For the perk step, `animateCardPick()` makes cards interactive (user clicks to reveal). `generateAiArt()` calls Pollinations (default) or Anthropic (optional). Pokédex is saved to `localStorage`.

## Design rules (enforce these)

- **No rerolls.** Spin buttons lock to "✓ LOCKED IN" after one use. `clearFrom()` is only called on full reset.
- **AI art generates once per forge** — `state.aiArtData` check at the top of `generateAiArt()` prevents re-generation.
- **Pokemon style** — Pollinations prompt must always include "official pokemon art, ken sugimori style, bold black outlines, flat cel shading, white background".
- **Perk step is interactive** — `animateCardPick()` fans cards face-down then waits for user click. Do not revert to automatic reveal.
- **No stage/rarity gates on perks** — all 5 perks are always available regardless of rarity or stage.

## AI backends

Default: Pollinations (free, anonymous). Change in ⚙ AI SETTINGS modal.
Anthropic default model: `claude-opus-4-7`.

## Common tasks

**Add a new type:** Add to `SPECIAL_TYPES` array, add a color entry to `typeToColor` in `buildPollinationsPrompt`, add bias to `TYPE_BIAS` in `rollStats`, add ability effect to `ABILITY_EFFECTS`, add species to `SPECIES`.

**Change perk weights:** Edit `PERKS` array (weights must not need to sum to 100 — they're relative).

**Debug AI art failure:** Check the COPY FULL LOG button in the error panel. Stack trace will identify whether it's CORS, rate-limit (HTTP 429), or network.

**If Pollinations fails silently:** The `<img>` fallback in `tryPollinations` stores the raw URL (not a data URL). If that URL stops working, the Pokédex entry loses its art. Add a retry or cache-bust seed if needed.
