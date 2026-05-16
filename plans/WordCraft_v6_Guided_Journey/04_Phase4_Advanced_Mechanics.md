# Phase 4: Advanced Mechanics Scaffolding

## Objective
Introduce the mid-to-late game mechanics introduced in v5 (Repair Station, Meaning Mirror, Native Crafting) in a structured manner via specific side quests or follow-up campaign steps. This prevents players from ignoring these crucial systems simply because they don't understand them.

## 1. Native Crafting & Repair Station Tutorial

**Concept:**
Players often get frustrated when tools break. The Guide should intervene right before a tool breaks or immediately after they craft their first tool, to explain the Repair system.

**Implementation Details:**
Add a quest that tracks tool durability or triggers after the first tool is crafted.

**Code Integration Point (Adding to `TUTORIAL_CAMPAIGN`):**
```javascript
    {
        id: "repair_station",
        title: "Maintain Your Gear",
        dialogue_start: "Tools break! Go to the Crafting Tab and use the Repair Station to fix your tool.",
        checkCompletion: function(playerState) {
            // Add a flag in the craft('repair_...') logic that sets this to true
            return playerState.hasRepairedTool === true;
        },
        onComplete: function() {
            showToast("Tool Repaired!", "good");
            guideEntity.currentDialogue = "Excellent! Repairing is cheaper than crafting a new one.";
        }
    }
```

*Note on Implementation:* Ensure you modify the `craft()` function in `index.html` to set `player.hasRepairedTool = true;` when any repair option is selected.

## 2. Meaning Mirror (Semantic Scaffolding)

**Concept:**
The Meaning Mirror requires the player to understand synonyms and antonyms. A guided quest will force them to interact with it successfully at least once.

**Implementation Details:**
Instruct the player to use the Meaning Mirror.

**Code Integration Point (Adding to `TUTORIAL_CAMPAIGN`):**
```javascript
    {
        id: "meaning_mirror",
        title: "Semantic Reflections",
        dialogue_start: "Find the Meaning Mirror in your inventory. Enter a word to see its opposite!",
        checkCompletion: function(playerState) {
             // Add a flag in the Meaning Mirror API/logic
            return playerState.hasUsedMeaningMirror === true;
        },
        onComplete: function() {
            showToast("Meaning Mirror Used!", "good");
            guideEntity.currentDialogue = "Knowing synonyms and antonyms will help you solve puzzles later!";
        }
    }
```

## 3. Side Quests & The Quest Board

**Concept:**
Once the linear tutorial campaign is finished, the Guide's role shifts. Instead of giving orders, the Guide acts as a prompt for "Side Quests" that encourage exploration (e.g., "Find the Sky Islands" or "Explore the Semantic Depths").

**Implementation Details:**
*   Create a `SIDE_QUESTS` array similar to `TUTORIAL_CAMPAIGN`.
*   Add a UI button (e.g., clicking on the Guide) to open a "Quest Board" showing available side quests.

**Code Integration Point (Conceptual):**
```javascript
const SIDE_QUESTS = [
    {
        id: "sky_islands",
        title: "Reach the Sky Islands",
        description: "Climb high enough to find Greek & Latin roots.",
        checkCompletion: function(player) { return player.y < -50; } // Assuming negative Y is up
    }
];

function interactWithGuide() {
    if (player.currentQuestIndex >= TUTORIAL_CAMPAIGN.length) {
        // Open Side Quest UI
        openQuestBoard();
    }
}
```

## Summary & Integration
By completing these four phases, the engine will transform from a pure sandbox into a guided educational experience. The student is introduced to movement, gathering, crafting, combat, and advanced academic mechanics step-by-step, ensuring maximum engagement and learning value.
