# AI Backend Research — Reducing Hallucinations in PokéForge Sprite Generation

**Date:** 2026-04-25
**Author:** Claude (Opus 4.7) at user's request
**Trigger:** "Lots of hallucinations and not the best things" from the current Pollinations + FLUX setup.

---

## 1. Current setup (baseline)

| Field | Value |
|---|---|
| Backend | `image.pollinations.ai` (free, no auth) |
| Model | `flux` (FLUX.1 schnell variant) |
| Size | 512 × 512 |
| Params used | `width`, `height`, `seed`, `model`, `nologo` |
| Negative prompt | **not used** |
| Prompt enhance | **not used** |

Prompt structure today: long single-line string starting with `"official Pokémon artwork by Ken Sugimori"` followed by 7 comma-separated descriptor blocks (stage, type, rarity, palette, style, anti-text, quality).

### Observed problems
1. Multiple creatures in one frame ("a herd of pokémon").
2. Trainer figures, pokéballs, or Game Boy frames bleeding into the picture.
3. Random text / "POKEMON" watermarks despite `no text, no watermark` in the prompt — FLUX largely ignores positive-form prohibitions.
4. Style drift toward 3D render, anime portrait, or generic concept art when the prompt is too long.
5. `flux` (schnell) is fast but loosely follows the brief.

---

## 2. Alternatives evaluated

I checked everything that doesn't require the user to sign up, paste a key, or run a server (those are non-starters for a single-file HTML toy).

| Option | Free / no-auth? | Quality for stylized art | Verdict |
|---|---|---|---|
| **Pollinations `flux`** (current) | ✅ | mid | baseline |
| **Pollinations `gptimage` / `gptimage-large`** | ✅ | **high** prompt adherence — OpenAI gpt-image-1 model exposed for free. Available since 2026-04-22. | **WINNER** |
| **Pollinations `turbo`** | ✅ | low — faster but lower fidelity | not worth |
| **Pollinations `seedream` (ByteDance)** | ✅ | good for stylized illustration | useful as fallback |
| **Pollinations `kontext`** | ✅ | best for image-editing (needs ref image) | not applicable |
| Hugging Face Inference API | needs token | varies | requires account / key — out of scope |
| fal.ai / Replicate / Together.ai / Stability | needs account + billing | high | out of scope |
| Perchance / Nokemon (other free pokémon-trained sites) | ✅ but no API | n/a | scrapeable but fragile, no API |

**Conclusion:** stay on Pollinations — it's the only zero-friction option — but switch the default model and exploit the parameters we weren't using.

---

## 3. Pollinations parameters we weren't using

Verified by reading `enter.pollinations.ai/api/docs` and probing `image.pollinations.ai/prompt/...` directly (all returned `200 OK`).

| Param | Effect | Use |
|---|---|---|
| `negative_prompt` | strings to actively avoid in the generation | **biggest single fix** — moves "no text, no humans, no extra creatures" out of the positive prompt where they are mostly ignored |
| `enhance=true` | server-side prompt enrichment via small LLM | small quality bump, free |
| `nofeed=true` | excludes the result from the public Pollinations feed | privacy hygiene |
| `private=true` | same idea — no feed exposure | privacy hygiene |
| `model=gptimage` | switches to OpenAI gpt-image-1 mini (much higher prompt adherence) | **default model swap** |

---

## 4. Prompt-engineering improvements

### Old prompt (2 lines, simplified)
```
official Pokémon artwork by Ken Sugimori, watercolor and ink, single full-body
creature centered, three-quarter pose, mid-evolution creature, fire-type, ordinary
pokémon, warm red color palette, soft pastel coloring, expressive friendly eyes,
clean white background, no text, no watermark, no logo, high detail
```

### New prompt (subject-first, FLUX-friendly)
```
single original Pokémon creature, full body, centered, three-quarter angled pose,
mid-stage evolution, fire-type with warm red and orange palette,
official Pokémon artwork style by Ken Sugimori,
hand-drawn watercolor and ink illustration, soft cel shading,
big expressive eyes, anime monster design,
solid pure white background
```

Key changes:
1. **Subject before style.** FLUX & gpt-image weight the first 60–80 tokens most — lead with what to draw, not how to draw it.
2. **"Single original Pokémon creature"** kills the "herd" failure mode at the source.
3. **Drop the prohibition list** from the positive prompt — push it into `negative_prompt`. Negative prompts are the canonical solution to "model keeps adding text/watermarks."
4. **Trim from ~60 tokens of style adjectives down to ~20** — reduces style soup and lets the few remaining tokens land harder.
5. **Per-rarity / per-stage cues are kept short** (`"mid-stage evolution"`, `"powerful draconic pseudo-legendary"`) instead of embedded in run-on clauses.

### New negative prompt
```
text, words, letters, logo, watermark, signature, caption, ui, hud, frame, border,
multiple creatures, group, pair, two characters, herd, crowd,
human, trainer, person, hands holding,
pokeball, gameboy, screen, photo, photograph, 3d render, cgi,
low quality, blurry, deformed, extra limbs
```

---

## 5. Recommendation summary

| Change | Effort | Impact |
|---|---|---|
| Switch default model `flux` → `gptimage` | trivial (one-line) | **high** |
| Add `negative_prompt` to URL | small | **high** |
| Restructure positive prompt (subject-first, shorter) | small | medium |
| Add `enhance=true` + `nofeed=true` | trivial | small |
| Keep `flux` as automatic fallback when `gptimage` is rate-limited | small | medium reliability |

All five are implemented in this PR.

---

## 6. Iteration 2 (2026-04-25, same day)

After the first round shipped, user feedback was: "images are too generic monsters,
not in pokémon art style." Investigation:

### What was still wrong

The earlier prompt said "single original Pokémon creature" + "anime monster design".
The model latched onto **monster** and **creature** as primary type tokens — both
words bias outputs toward generic D&D / kaiju / horror-fauna styling. Even with
"Sugimori watercolor" in the style block, the silhouettes came out wrong.

### Fix — three changes

1. **Drop "monster" and "creature" everywhere.** Replace with **"Pokémon character"**.
   The word *Pokémon* is itself a strong style token; the word *creature* dilutes it.
2. **Anchor with real Pokémon names by primary type.** A `TYPE_REFERENCES` map
   provides 3 canonical Pokémon per type (e.g. FIRE → Charizard, Arcanine, Cinderace).
   The prompt then says: *"same official artwork style as Charizard, Arcanine,
   Cinderace — same proportions, same line weight, same shading language"*. This is
   the single biggest quality lever — both `gptimage` and `flux` recognize these
   names as visual references and the output style snaps to "real Pokémon."
3. **Add Pokémon TCG framing.** *"Pokémon Trading Card Game illustrated card art
   aesthetic, Game Freak character design sheet, studio promotional artwork."*
   Aligns the model with a known commercial-art style.

### Negative prompt — added "generic monster" cluster

Previously only suppressed text/extra-creatures/photo. Added:
`generic monster`, `D&D monster`, `kaiju`, `horror creature`, `realistic animal`,
`oil painting`, `realistic fur`, `gritty`, `dark fantasy`, `figurine`. These were
the literal output buckets the user complained about.

### Re-forge support

Also exposed: the existing button locked permanently on first success. Now becomes
**🎨 RE-FORGE ART** after each successful generation, honoring the ~15s anonymous
cooldown with a visible countdown. Each re-forge uses a fresh random seed so the
output actually differs.

---

## 7. Sources

- [Pollinations API docs](https://github.com/pollinations/pollinations/blob/main/APIDOCS.md)
- [Pollinations model list page](https://pollinations-ai.com/models.html)
- [FLUX.1 prompt guide](https://www.giz.ai/flux-1-prompt-guide/)
- [Best Pokémon-with-FLUX guide](http://anakin.ai/blog/how-to-generate-a-pokemon-image-with-flux-a-step-by-step-guide-for-creating-your-dream-pokemon/)
- [3DAI Studio — FLUX prompts that work](https://www.3daistudio.com/blog/the-best-flux-black-forest-labs-prompts-for-good-results-in-ai-image-generation)
- Direct API probe with `curl -I` against `image.pollinations.ai/prompt/...?model=...&negative_prompt=...&enhance=true` (verified `200 OK` for all five params, 2026-04-25)
