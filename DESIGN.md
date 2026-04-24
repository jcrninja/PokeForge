# PokéForge — Design Reference

A casino/carnival Pokémon generator. Seven steps forge a unique mon, each step with its own widget. No rerolls — what you get is what fate gave you.

---

## Design Pillars

1. **Casino / carnival aesthetic.** Deep shadows, glossy gradients, neon accents, marquee borders, brass/chrome details, light bulbs. Pokéball motifs on top of the casino "venue."

2. **No rerolls.** Each step is one spin. The button locks to "✓ LOCKED IN" and the result is final. RESET is the only escape hatch.

3. **Suspense before reveals.** Deliberate pause after animation completes, before the result is shown. Flashing lights, build-up tension.

4. **No rarity gates.** Rarity only affects the BST stat target. A Normal-rarity mon can be stage-3. A Legendary can be base-form single-type. Everything is possible.

---

## The 7 Steps

| # | Step | Widget | Button label |
|---|---|---|---|
| 1 | RARITY | Carnival pie wheel | ▶ SPIN THE WHEEL |
| 2 | TYPE COUNT | 3D CSS coin flip | ▶ FLIP THE COIN |
| 3 | PRIMARY TYPE | Gacha capsule machine | ▶ DROP THE CLAW |
| 4 | SECONDARY TYPE | Slot reel | ▶ DROP THE CLAW |
| 5 | EVOLUTION | Horizontal lever | ▶ PULL THE LEVER |
| 6 | SPECIAL PERK | Card deal — user picks one | ▶ DEAL THE CARDS |
| 7 | BASE STATS | Animated gradient bars | ▶ ROLL THE STATS |

### Perk step — interactive card pick

Cards fan out face-down after clicking "DEAL THE CARDS." The user clicks one card to reveal the perk. Other cards fade away. The picked perk is final.

---

## Data

### Rarities

| Name | Weight | BST anchor |
|---|---|---|
| NORMAL | 50% | 400 |
| STARTER | 25% | 500 |
| SEMI-PSEUDO | 12% | 540 |
| PSEUDO-LEGENDARY | 8% | 600 |
| LEGENDARY | 5% | 680 |

BST roll: `anchor ± 50`, then × stage multiplier (0.60 / 0.80 / 1.00) × perk boost (1.08 for Mega/Gigantamax).

### Types

18 canon types + 30 special types (COSMIC, PLASMA, SOUND, CRYSTAL, MIRAGE, VOID, AETHER, MAGMA, GRAVITY, TIME, LIGHT, SHADOW, BLOOD, CHAOS, ORDER, STORM, DREAM, MACHINE, VIRUS, SPIRIT, HONOR, DECAY, FLORA, MAGNET, MIST, NUCLEAR, RUNE, GLASS, MEMORY, PRISM).

Special types are marked with ★ in the sidebar.

### Perks

| Perk | Weight | Kind |
|---|---|---|
| STANDARD ABILITY | 45 | Ability description |
| HIDDEN ABILITY | 25 | Ability description (rarer variants) |
| SIGNATURE MOVE | 15 | Custom move for this species |
| MEGA EVOLUTION | 10 | Mega form with name + lore |
| GIGANTAMAX | 5 | G-Max form |

---

## Color system

CSS variables used throughout:
- `--felt` / `--felt-dark` — casino table green
- `--brass` / `--brass-dark` — gold trim
- `--neon-pink` / `--neon-blue` — accents
- `--accent` (#ffcb05 gold) and `--accent-2` (#ff4757 red) — primary brand colors

---

## Art style

Pollinations Flux model. Prompt steers toward official Pokémon / Ken Sugimori aesthetic:
- "official pokemon art, ken sugimori style"
- "bold black outlines, flat cel shading, big expressive eyes"
- "white background, full body centered, no text no watermark"
- Type → color-name mapping (not hex codes)
- Stage descriptions: "baby form round proportions" / "mid-evolution" / "fully evolved imposing"

Art generates once per forge and locks — no rerolls on art either.

---

## Final View

After step 7, the final view shows:
- Art frame (AI-generated sprite or procedural SVG fallback)
- Pokémon name, species, type chips
- Pokédex flavor text
- Perk card (icon + ability/move name + description)
- Base stats bars with animated fill + total counter
- Save to Pokédex button
