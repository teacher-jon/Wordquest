# Phase 3: Early-Game Combat Protection

## Objective
Prevent the frustration of early-game deaths by having the Guide act as a temporary protector. The guide will shield the player from damage and defeat the first few monsters while providing instruction on how to engage in combat using the "Syntax Sorcery" system.

## 1. The Protective Aura Mechanic

**Concept:**
While the tutorial is active (specifically, before the player completes the initial set of combat-related quests), the player takes significantly reduced or zero damage. The Guide intercepts incoming attacks.

**Implementation Details:**
Modify the damage calculation logic to check the player's tutorial state.

**Code Integration Point (e.g., inside `takeDamage()` or the monster update loop in `index.html`):**
```javascript
function playerTakeDamage(amount) {
    // Check if player is still in the protective phase of the tutorial
    const combatQuestIndex = TUTORIAL_CAMPAIGN.findIndex(q => q.id === "first_combat");

    if (player.currentQuestIndex <= combatQuestIndex) {
        // The Guide protects the player!
        guideEntity.currentDialogue = "I'll protect you! But you need to learn to defend yourself.";
        showToast("The Guide deflected the attack!", "info");

        // Optional: Trigger a visual shield effect around the player here
        return; // No damage taken
    }

    // Normal damage logic...
    player.hp -= amount;
    if (player.hp <= 0) {
        die();
    }
}
```

## 2. Guided Combat Tutorial

**Concept:**
The player needs a controlled encounter to learn how to cast words as spells. We will spawn a specific, weak "Tutorial Slime" that doesn't move fast, and instruct the player on how to defeat it.

**Implementation Details:**
Add a new quest to the `TUTORIAL_CAMPAIGN` specifically for combat.

**Code Integration Point (extending `TUTORIAL_CAMPAIGN` array from Phase 2):**
```javascript
    {
        id: "first_combat",
        title: "Defend Yourself",
        dialogue_start: "A monster! Open Inventory, click 'Spellbook', and cast a word at it!",
        setup: function() {
            // Spawn a specific tutorial monster nearby
            spawnMonsterAt(player.x + 5, player.y + 5, "tutorial_slime");
        },
        checkCompletion: function(playerState) {
            // Track if the player has defeated an enemy
            return playerState.stats.monstersDefeated > 0;
        },
        onComplete: function() {
            showToast("Monster Defeated!", "good");
            guideEntity.currentDialogue = "Great job! My protection is fading, you're on your own now!";
        }
    }
```

## 3. Visualizing Guide Intervention (Optional Polish)

**Concept:**
When the guide protects the player, or when the player is struggling to understand combat, the Guide should visually react.

**Implementation Details:**
*   Add a visual "beam" or "shield" drawing routine to the `drawGuide()` function when protection is triggered.
*   If the player spends too long on the "first_combat" quest without casting a spell, update `guideEntity.currentDialogue` with a more explicit hint (e.g., "Hint: Use words like FIRE or HIT!").

## Next Steps
Once the player can survive their first encounter and understands the basics of gathering and combat, they are ready to learn about the deeper mechanics of the world. **Phase 4** covers scaffolding the Repair Station and Meaning Mirror.
