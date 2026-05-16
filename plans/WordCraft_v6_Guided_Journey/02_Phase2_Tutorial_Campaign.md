# Phase 2: The Tutorial Campaign & Quest Engine

## Objective
Establish a structured progression path (the "Campaign") to hand-hold the student through their first journey. This involves creating a quest engine that tracks objectives (e.g., gathering specific items) and triggers the Guide's dialogue appropriately.

## 1. Quest Data Structure

**Concept:**
A quest is a discrete goal or set of goals. The system needs to define the quest, its conditions for completion, and the dialogue associated with its different states.

**Implementation Details:**
Create a configuration array/object defining the linear sequence of tutorial quests.

**Code Integration Point (e.g., new file `js/questSystem.js` or top-level variable):**
```javascript
const TUTORIAL_CAMPAIGN = [
    {
        id: "intro_movement",
        title: "Taking First Steps",
        dialogue_start: "Welcome to WordCraft! Use WASD or the arrows to move around.",
        checkCompletion: function(playerState) {
            // e.g., Track if player has moved 10 units from spawn
            return playerState.totalDistanceMoved > 10;
        },
        onComplete: function() {
            showToast("Movement Mastered!", "good");
        }
    },
    {
        id: "gather_wood",
        title: "Gathering Resources",
        dialogue_start: "See those trees? Click them to gather Wood. We need 5 pieces.",
        checkCompletion: function(playerState) {
            return playerState.resources.wood >= 5;
        },
        onComplete: function() {
            showToast("Wood Gathered!", "good");
        }
    },
    {
        id: "first_word",
        title: "Syntax Sorcery",
        dialogue_start: "Press 'I' to open Inventory. Drag letters to forge a word!",
        checkCompletion: function(playerState) {
             // Checking if the player has successfully forged any word
            return playerState.stats.wordsForged > 0;
        },
        onComplete: function() {
            showToast("First Word Forged!", "good");
        }
    }
];
```

## 2. The Quest Engine & State Management

**Concept:**
The game needs a central loop that monitors the active quest and checks if its conditions have been met. It also needs to save the player's progress in the campaign.

**Implementation Details:**
*   Update the `player` object to track `currentQuestIndex`.
*   Create a function that runs periodically (or based on relevant events) to evaluate the current quest's `checkCompletion` logic.

**Code Integration Point (`index.html` integration):**
```javascript
// Extending the player object (ensure backwards compatibility in loadSaveSlot)
/*
    player.currentQuestIndex = 0;
*/

function updateQuests() {
    if (player.currentQuestIndex >= TUTORIAL_CAMPAIGN.length) {
        // Campaign finished
        guideEntity.currentDialogue = "You're ready to explore! Watch out for monsters.";
        return;
    }

    const activeQuest = TUTORIAL_CAMPAIGN[player.currentQuestIndex];

    // Set guide dialogue to the quest's instruction
    guideEntity.currentDialogue = activeQuest.dialogue_start;

    // Check if the objective is met
    if (activeQuest.checkCompletion(player)) {
        activeQuest.onComplete();
        player.currentQuestIndex++;

        // Save progress immediately so they don't have to repeat tutorial steps
        saveGame(currentSlot);
    }
}
```

## 3. User Interface (UI) Integration

**Concept:**
While the Guide provides context, players also need a persistent UI element to remind them of their current objective if they close the game or get distracted.

**Implementation Details:**
Add a small "Current Objective" HUD element to the main game screen (`#game-container`).

**Code Integration Point (`index.html` UI overlay):**
```html
<!-- Add to #overlay-layer or #game-container -->
<div id="quest-tracker" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; border: 2px solid #e67e22; z-index: 20;">
    <h4 style="margin: 0; color: #f1c40f;">Current Objective:</h4>
    <p id="quest-title" style="margin: 5px 0 0 0;">Loading...</p>
</div>
```

**Updating the UI via JS:**
```javascript
function renderQuestUI() {
    const titleElement = document.getElementById('quest-title');
    if (player.currentQuestIndex < TUTORIAL_CAMPAIGN.length) {
        titleElement.innerText = TUTORIAL_CAMPAIGN[player.currentQuestIndex].title;
    } else {
        titleElement.innerText = "Explore the world!";
    }
}
// Call renderQuestUI() inside updateQuests() or when state changes.
```

## Next Steps
With the quest engine in place to guide the player through basic resource gathering and crafting, we must address early-game survival. **Phase 3** details how the Guide will protect the player from premature death while teaching combat mechanics.
