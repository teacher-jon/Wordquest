# Phase 1: The Guide Entity & Dialogue System

## Objective
Introduce a persistent, friendly entity (The Guide) that follows the player's avatar. The Guide acts as the primary vehicle for delivering tutorials, context, and immediate feedback without breaking the flow of the game.

## 1. Visual Representation & State Tracking

**Concept:**
The Guide will be an ethereal, floating companion (e.g., a glowing book or a small fairy sprite). It needs to be rendered on the canvas near the player.

**Implementation Details:**
*   Add a new object to track the Guide's state within the game's initialization state.
*   The Guide should smoothly interpolate its position towards a target offset relative to the player's coordinates.

**Code Integration Point (e.g., near `initGame()` or global variables):**
```javascript
const guideEntity = {
    active: true,
    x: 0,
    y: 0,
    targetOffsetX: -20, // Float slightly behind/above the player
    targetOffsetY: -30,
    spriteData: null, // Depending on how sprites are managed, this could be an image or drawing instruction
    currentDialogue: null // The active text string the guide is currently "saying"
};
```

## 2. Pathfinding & Movement Logic

**Concept:**
The Guide shouldn't just snap to the player; it should smoothly float and follow them, creating a feeling of a companion.

**Implementation Details:**
*   Update the main game `loop()` or `update()` function to calculate the Guide's position based on the player's position.
*   Use simple linear interpolation (Lerp) for smooth movement.
*   Add a slight hovering effect (sine wave) to the Guide's Y position.

**Code Integration Point (e.g., in the main `loop()` or `update()` function):**
```javascript
function updateGuide(deltaTime) {
    if (!guideEntity.active) return;

    // Calculate target position based on player position + offset
    const targetX = player.x + guideEntity.targetOffsetX;
    const targetY = player.y + guideEntity.targetOffsetY;

    // Lerp towards target
    const lerpFactor = 0.1; // Adjust for speed
    guideEntity.x += (targetX - guideEntity.x) * lerpFactor;
    guideEntity.y += (targetY - guideEntity.y) * lerpFactor;

    // Add hover effect
    guideEntity.y += Math.sin(Date.now() / 200) * 0.5;
}
```

## 3. Dialogue System

**Concept:**
The Guide needs to communicate with the player. Instead of intrusive, screen-blocking alerts, use floating dialogue boxes attached to the Guide's position or a dedicated non-intrusive UI element at the bottom of the screen.

**Implementation Details:**
*   **Option A (Floating Text):** Render text directly onto the canvas above the Guide's sprite.
*   **Option B (UI Overlay):** Create a DOM element overlay that updates its text based on `guideEntity.currentDialogue`.

**Code Integration Point (Rendering Option A - inside `draw()` function):**
```javascript
function drawGuide() {
    if (!guideEntity.active) return;

    // 1. Draw the Guide Sprite
    ctx.fillStyle = "rgba(100, 200, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(guideEntity.x - camera.x, guideEntity.y - camera.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw active dialogue bubble if it exists
    if (guideEntity.currentDialogue) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;

        // Simple bounding box logic (needs proper text measurement in production)
        const textWidth = ctx.measureText(guideEntity.currentDialogue).width;
        const boxX = guideEntity.x - camera.x - (textWidth / 2) - 10;
        const boxY = guideEntity.y - camera.y - 40;

        ctx.fillRect(boxX, boxY, textWidth + 20, 25);
        ctx.strokeRect(boxX, boxY, textWidth + 20, 25);

        ctx.fillStyle = "#000";
        ctx.font = "12px Verdana";
        ctx.fillText(guideEntity.currentDialogue, boxX + 10, boxY + 16);
    }
}
```

## Next Steps
Once the Guide entity can be rendered, moved, and can display arbitrary text strings, we move to **Phase 2**, which dictates *what* the Guide says and *when* it says it via the Tutorial Campaign engine.
