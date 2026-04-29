# WordCraft v5: The Semantic Sky Update
## Expansion Implementation Plan

**Target Audience:** Grades 2-3 (High Achievers)
**Core Focus:** Enhancing core gameplay loops (mining/crafting) while introducing advanced language arts concepts (Synonyms/Antonyms, Greek/Latin Roots) in an accessible, gamified format.

---

## Phase 1: Quality of Life & Tool Balancing
**Problem:** Students enjoy mining but find the current tool durability frustrating, as tools break quickly and are expensive to replace.
**Solution:**
*   **Durability Buff:** Increase the `maxHp` of all craftable tools significantly.
    *   *Wood Pickaxe:* Increase from 30 to 100.
    *   *Stone Pickaxe:* Increase from 50 to 200.
    *   *Iron Pickaxe:* Increase from 100 to 500.

**Code Context (`index.html`):**
```javascript
// Currently defined as:
const TOOLS = {
    "hand": { tier: 0, name: "Bare Hands" },
    "wood_pick": { tier: 1, maxHp: 30, name: "Wood Pickaxe" },
    "stone_pick": { tier: 2, maxHp: 50, name: "Stone Pickaxe" },
    "iron_pick": { tier: 3, maxHp: 100, name: "Iron Pickaxe" }
};
// Update maxHp values here.
```

*   **New Mechanic - The Repair Station:**
    *   Add a new "Repair" section in the Crafting tab (`#tab-craft`) or a new tab entirely.
    *   Players can spend a small amount of base resources (e.g., 2 Wood for Wood Pickaxe, 2 Stone for Stone Pickaxe) to completely restore the durability of their current tool.

**Code Context (`index.html`):**
```javascript
function craft(i) {
    // Add logic for repairing:
    else if(i === 'repair_wood_pick') {
        if(player.tool === 'wood_pick' && player.resources.wood >= 2) {
            player.resources.wood -= 2;
            player.toolHp = TOOLS["wood_pick"].maxHp;
            showToast("Wood Pickaxe Repaired!", "good");
        }
    }
    // ...
}
```

## Phase 2: The Semantic Depths (Synonyms & Antonyms)
**Concept:** An underground expansion that focuses on the relationship between words.

*   **New Biome - The Crystal Caverns:**
    *   Modify the `initGame()` grid generation logic in `index.html` to add a new tile type (e.g., ID `14` for crystals) deep underground (e.g., `r > 120`).
*   **New Mechanic - The Meaning Mirror:**
    *   A craftable station or a new tab in the Inventory (`#screen-inv`).
    *   When a user inputs a word from their Lexicon, it queries an API (or a local dictionary of antonyms/synonyms suited for grades 2-3) to yield its opposite or synonym.
*   **Environmental Puzzles:**
    *   Create special block types that act as barriers (e.g., "Wall of Fire").
    *   Update the `action()` or Spell Execution logic (`executeSpellByType` in `syntax-sorcery.js`) so that casting a spell with the antonym (e.g., "cold" on a "fire" block) destroys it.

## Phase 3: The Sky Islands (Greek & Latin Roots)
**Concept:** A high-altitude biome introducing advanced morphological concepts tailored for high-achieving students.

*   **New Biome - The Sky Islands:**
    *   Modify `initGame()` to generate floating islands at negative Y-coordinates (or very low Y-coordinates near the top of the map).
*   **New Word Parts - Ancient Roots:**
    *   Update the mining drop logic in `action()` to drop Greek and Latin roots (e.g., *tele*, *phone*, *photo*, *graph*, *meter*, *thermo*) when mining in the Sky Islands.
*   **New Mechanic - Tech Crafting:**
    *   Update `forgeWord()` logic. If a forged word matches a specific combination (e.g., `tele` + `port`), it triggers a special unlock instead of just giving fragments.
    *   *Examples:*
        *   `tele` + `port` = **Teleporter Pad** (Allows instant travel between placed pads).
        *   `thermo` + `meter` = **Thermometer** (A UI tool that points towards rare underground lava/ores).

**Code Context (`index.html`):**
```javascript
async function forgeWord() {
    // ...
    let finalWord = prefixStr + currentWord;
    // Intercept special words:
    if (finalWord === "teleport") {
        player.unlocks.teleporter = true;
        alert("You unlocked the Teleporter!");
        // ...
    }
}
```

## Phase 4: Risk Mitigation & Codebase Protections

Adding new biomes and mechanics to a tightly coupled 2D engine carries inherent risks. Here are the anticipated dangers and our mitigation strategies:

### 1. Save File Corruption
*   **Danger:** Expanding the `player` object (e.g., adding `unlocks.teleporter`) or `grid` arrays with new tile IDs might break compatibility with existing saves, leading to game crashes when loading an old save.
*   **Mitigation:**
    *   Implement **Graceful Degradation:** When `loadSaveSlot()` runs, use a deep merge function or explicit checks to ensure any missing v5 properties (like the new `unlocks` or tool properties) are safely initialized with default values.
    *   Ensure new tile IDs (e.g., ID 14 for crystals) have a fallback render path in `draw()` so they don't throw an undefined image error if loaded incorrectly.

### 2. Grid Array Index Out of Bounds (Sky Islands)
*   **Danger:** Wordcraft currently generates the map from row `0` down to `ROWS`. If the Sky Islands logic attempts to access negative Y-coordinates or goes above `0`, it will throw an `Uncaught TypeError` and crash the main `loop()`.
*   **Mitigation:**
    *   Instead of negative coordinates, increase the total `ROWS` height (e.g., adding 50 rows to the top) and shift the ground-level generation down.
    *   Add explicit bounds checking `(y >= 0 && y < ROWS)` anywhere the new Sky Island logic interacts with the `grid`.

### 3. API Rate Limiting / Async Overload (Meaning Mirror)
*   **Danger:** If the Meaning Mirror relies entirely on external APIs for synonyms/antonyms, spamming it could hit rate limits, freezing the UI while `await` blocks resolve.
*   **Mitigation:**
    *   Use an internal, hardcoded dictionary object for common Grade 2-3 words (e.g., `const DICTIONARY = { "hot": { ant: "cold", syn: "warm" } }`) as the primary data source.
    *   Only fall back to an external API if the word isn't in the internal list, and implement a debounce/loading state so the player can't spam the forge button.

### 4. Overcomplicating Mobile UI
*   **Danger:** Adding more tabs (Repair Station, Meaning Mirror) could clutter the mobile UI, which is already dense.
*   **Mitigation:**
    *   Integrate the Repair Station into the existing "Craft" tab rather than creating a new one.
    *   Ensure any new UI overlays are wrapped in media queries (`@media (max-width: 600px)`) similar to the existing Grimoire popup, ensuring touch targets remain large.

## Phase 5: Branch Protection & Version Control Strategy
To ensure codebase stability during this major expansion:

1.  **Branch Protection Rules:**
    *   The `main` (or `master`) branch will be protected. Direct commits will be disabled.
    *   All changes must be made via Pull Requests (PRs).
    *   PRs require at least one approving review before merging.
2.  **Development Workflow:**
    *   Create a `dev` branch as the active integration branch.
    *   Feature branches will be created for each major component:
        *   `feature/tool-rebalancing`
        *   `feature/semantic-depths`
        *   `feature/sky-islands`
    *   Once a feature is tested and verified, it is merged into `dev`.
3.  **Final Merge:**
    *   Once all features are integrated into `dev` and thoroughly playtested, a final PR will be opened to merge `dev` into `main`.