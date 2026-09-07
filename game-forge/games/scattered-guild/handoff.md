# The Scattered Guild — Project Handoff

## What This Is
A D&D-style text adventure / visual novel hybrid built in React, playable in-browser. Based on a class assignment from Professor Liz ("The Multiverse Wizard"): "Given everything you know about me, make me a D&D character sheet with realistic stats." The game uses those real stats for gameplay.

---

## Current Deliverables

### 1. `scattered-guild.jsx` — React artifact (playable in Claude)
### 2. `scattered-guild.html` — Standalone HTML file (shareable, runs in any browser)

Both are the same game. The HTML wraps the JSX with React/Babel CDN imports.

---

## Game Architecture

### Engine
- **React functional component** with useState/useRef for state management
- **Scene graph**: `SCENES` object where each key is a scene with `title`, `text`, `choices`, and optional `resolve` function for dynamic outcomes
- **Skill check system**: d20 + ability modifier + proficiency bonus, checked against DC
- **Interactive pixel dice**: Player clicks a pixel-art d20 to roll — spins with animation, shows PASS/FAIL/NAT 20/CRIT FAIL
- **Party system**: 4 characters, player picks who attempts each skill check (sees bonuses + proficiency markers)
- **Inventory tracking**: Items collected affect available choices and ending grade
- **Typewriter text**: Skippable by clicking

### Characters (in `CHARACTERS` object)
Each character has: name, title, level, hp, stats (STR/DEX/CON/INT/WIS/CHA), skill proficiencies, tools, flaw, bond, pixel sprite data, color.

**Current roster:**
- **Rachael** (real player) — Lvl 12 Artificer/Bard. INT 17, high CHA/WIS. Skills: persuasion, insight, investigation, arcana, performance, animal handling, etc. Flaw: undercharges for services.
- **Marcus** (NPC placeholder) — Lvl 11 Fighter/Wizard. STR 16, INT 16. The tactical thinker with analysis paralysis.
- **Jade** (NPC placeholder) — Lvl 11 Rogue/Ranger. DEX 17, WIS 16. Data-driven, doesn't ask for help.
- **Devon** (NPC placeholder) — Lvl 11 Cleric/Sorcerer. WIS 17, CHA 16. Empathetic, burns out taking on others' emotions.

### Pixel Sprites
Each character has a `pixel` array (12 rows × 8 chars) and a `palette` map. Rendered as tiny div grids. Simple but effective at small sizes.

### Story: Chapter One — "The Scattered Guild"
Set in fantasy Florida ("Floridae"). The Weavers' Concord — a guild of textile artisans — was scattered by a merchant named Corso who's monopolizing the craft through economic pressure. Player party must find and reunite 4 missing masters: Hana (Dyer), Kenji (Embroiderer), Sora (Loom-Singer), Tadashi (Pattern-Keeper). Yuki (Thread-Spinner) is the quest-giver.

Three starting paths branch and reconverge. Professor Liz frames it as a graded class assignment, popping in with commentary.

---

## Key Design Rules

### 1. Every player gets a personalized world object
The embroidered map was Rachael's — it nods to her sewing/textile skills. When real students replace NPCs, each must get at least one in-game object that mirrors their real skills and interests. A coder gets a debugging puzzle. A cook gets an alchemy challenge. An artist gets a visual clue. The object should make that player feel *seen*.

### 2. Multiplayer game = party's story, not Rachael's
Distribute key moments so each player's stats and personal object are the critical path in different scenes. No one player is the protagonist.

### 3. Solo Rachael game = separate project
Can be as Rachael-centric as desired. Potential build target: cyberdeck Python game system (TBD spec).

### 4. NPC slots are swappable
When real student sheets come in, replace entries in the `CHARACTERS` object. The engine handles the rest — party banter, skill checks, and choices all read from character data dynamically.

---

## Known Bug Fix (already applied)
**Problem:** Scenes with `resolve` functions and `text: null` (e.g., skill check scenes) would crash when `useEffect` tried to re-resolve them with a null result after `setSceneId` fired.
**Fix:** `checkedResolveRef` — executeCheck stashes the resolved scene in a ref, and useEffect picks it up instead of re-resolving.

---

## Tech Stack
- React 18 (hooks only, no class components)
- Press Start 2P font (Google Fonts CDN)
- No external dependencies beyond React
- CSS-in-JS (inline styles)
- Pixel art via div grids (no images/canvas)
- Babel standalone for JSX transpilation in HTML version

---

## What's Next

### Immediate (Monday Sept 7, 2026)
- [ ] Collect student D&D character sheets from classmates
- [ ] Swap real students into `CHARACTERS`, replacing NPC placeholders
- [ ] Design personalized world objects for each real player
- [ ] Update party banter to match real student personalities

### Future
- [ ] Chapter Two (Kenji's northern port, Sora's Singing Caves, Tadashi's Archive Tower, Corso confrontation)
- [ ] Solo Rachael game on cyberdeck Python system (separate project)
- [ ] Potential: game-making agent pipeline — spec → generate → test → export (came from Agentic SDLC class insights)

---

## Rachael's Character Sheet (source of truth)

```
Class: Level 12 Artificer (Alchemist) / Bard (College of Lore)
Race: Human (Variant) — Feat: Skilled
Background: Guild Artisan / Folk Hero hybrid
Alignment: Neutral Good
HP: 88

STR 8 | DEX 14 | CON 13 | INT 17 | WIS 15 | CHA 15

Skills: Persuasion, Insight, Nature, Investigation, Sleight of Hand, Arcana, Performance (visual arts), Animal Handling (reptiles), History (art/craft technique)

Tools: Herbalism kit, calligrapher's supplies, painter's supplies, weaver's tools, tinker's tools, gaming set (MTG)

Languages: Common, Japanese (ceremonial), Python, JavaScript

Flaw: Undercharges for services
Bonds: The Delegation. The garden. Whichever craft has her attention this week.
```

---

## Context from the Build Session
- Rachael directed every design decision — she works by iterative steering, not upfront specs
- "Control issues or values depending how you see it" — she steers closely because she has a vision she can't always express upfront, and small tests course-correct toward it
- The game was built as AI agent study practice (she's pivoting into AI/CS)
- Professor Liz's Agentic SDLC intensive is today — may produce new ideas for a game-making agent system
- Rachael's top values: Creativity, Enjoyment, Knowledge, Peace — Enjoyment has been low lately (burnout), and this game project was a breakthrough back into fun-mode
