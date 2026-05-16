# WordCraft v6: The Guided Journey

## Master Implementation Plan

**Problem Statement:**
While WordCraft v5 successfully introduced deep mechanics (Semantic Depths, Sky Islands, Repair Stations), the game has become increasingly "sandbox-heavy." Students are struggling with the learning curve, finding themselves lost on what to do first, and ultimately not unlocking the full academic value of the game due to a lack of directed onboarding.

**Objective:**
Implement a comprehensive, phased tutorial and campaign system. This system will introduce a "Guide" entity that follows the player, teaches them the basic mechanics, protects them from early threats, and issues structured quests that walk them through gathering, crafting, repairing, and linguistic puzzles.

---

## Architecture Overview & Phase Breakdown

The implementation of this system is broken down into four distinct phases. Each phase is detailed in a separate document linked below. These documents contain the necessary context, code snippets, and structural plans required for seamless integration into the existing `index.html` engine.

### [Phase 1: The Guide Entity & Dialogue System](./01_Phase1_The_Guide_Entity.md)
*   **Focus:** Creating the companion character that follows the player.
*   **Key Systems:** Companion pathfinding/following logic, Dialogue UI overlays, and state tracking.

### [Phase 2: The Tutorial Campaign & Quest Engine](./02_Phase2_Tutorial_Campaign.md)
*   **Focus:** Implementing a structured quest system.
*   **Key Systems:** Quest data structure, objective tracking (e.g., "mine 5 wood", "spell a word"), and UI for displaying current objectives.

### [Phase 3: Early-Game Combat Protection](./03_Phase3_Combat_Protection.md)
*   **Focus:** Scaling difficulty and teaching combat mechanics safely.
*   **Key Systems:** The Guide's protective aura/intervention mechanics, and guided combat tutorials introducing "Syntax Sorcery".

### [Phase 4: Advanced Mechanics Scaffolding](./04_Phase4_Advanced_Mechanics.md)
*   **Focus:** Walking players through mid-game systems introduced in v5.
*   **Key Systems:** Guided walkthroughs for the Repair Station, Meaning Mirror, and basic crafting concepts.

---

## Coding Guidelines for Integration

When implementing these phases into `index.html` and the `js/` directory:
1.  **State Management:** Store all quest progress and guide states inside the `player` object to ensure it is captured when `saveGame()` and `loadSaveSlot()` are called.
2.  **Non-Blocking UI:** Dialogue and quest updates should not completely block gameplay unless specifically intended (e.g., a critical pop-up). Use floating UI or dedicated screen space.
3.  **Graceful Degradation:** Ensure old save files (v5 and below) are initialized with `player.questState = 0` so returning players can either bypass the tutorial or start it safely.
