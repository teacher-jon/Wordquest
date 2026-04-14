# Phase 4: Magic Point Accumulation System - Implementation Plan

## Overview
Transform the restrictive word-matching spell system into a flexible magic point accumulation system where ANY word combination works, with spell power determined by grammatical properties and sentence patterns.

## Grammar Validation Confirmation

**Important**: The existing sentence pattern system already ensures complete, grammatically correct sentences:

- **Pattern 1 (Declarative)**: "The [adjective] [noun] [verb]s." → "The hot ball flies."
- **Pattern 2 (Imperative)**: "[Verb] the [adjective] [noun]!" → "Throw the hot ball!"
- **Pattern 3 (Exclamatory)**: "[Adjective] [noun] [verb]s!" → "Hot ball flies!"
- **Pattern 4 (Adverbial)**: "A/An [adjective] [noun] [verb]s [adverb]." → "A quick fox runs swiftly."

All patterns include:
- Proper verb conjugation (3rd person singular)
- Correct article selection (a/an based on vowel sounds)
- Appropriate punctuation (periods for statements, exclamation marks for commands/exclamations)
- Subject-verb agreement

The magic point system builds on this existing grammatical foundation without changing sentence structure.

---

## Current System Analysis

### Components to Replace
1. **SPELL_DICTIONARY** (lines 663-737 in [`js/syntax-sorcery.js`](js/syntax-sorcery.js:663))
   - Currently maps specific word combinations to predefined spells
   - Restrictive: only certain words work
   - Needs complete removal

2. **mapSpell() function** (line 1014 in [`js/syntax-sorcery.js`](js/syntax-sorcery.js:1014))
   - Currently checks dictionary for matches
   - Needs replacement with magic point calculation

3. **SPELLS object** (line 740 in [`js/syntax-sorcery.js`](js/syntax-sorcery.js:740))
   - Currently has fixed spell definitions
   - Needs restructuring into tier-based spell types

### Components to Keep
- Pattern system (PATTERNS object)
- Lexicon system
- Syntax Engine UI framework
- Spell execution infrastructure

---

## Implementation Steps

### Step 1: Add Magic Point Constants

**Location**: [`js/syntax-sorcery.js`](js/syntax-sorcery.js:660) (after PATTERNS, before SPELL_DICTIONARY)

```javascript
// ============================================
// MAGIC POINT SYSTEM
// ============================================

const WORD_MAGIC_VALUES = {
  noun: 3,        // Concrete, stable magic
  verb: 4,        // Action, powerful magic
  adjective: 2,   // Modifying, enhancing magic
  adverb: 2       // Modifying, enhancing magic
};

const PATTERN_MULTIPLIERS = {
  1: 1.0,   // Declarative: Balanced
  2: 1.2,   // Imperative: Command power
  3: 0.9,   // Exclamatory: Quick but weaker
  4: 1.3    // Adverbial: Complex, powerful
};

// Magic Point Tiers
const MAGIC_TIERS = {
  0: { min: 0, max: 5, name: 'Too Weak' },
  1: { min: 6, max: 9, name: 'Basic' },
  2: { min: 10, max: 12, name: 'Intermediate' },
  3: { min: 13, max: 15, name: 'Advanced' },
  4: { min: 16, max: 999, name: 'Master' }
};
```

### Step 2: Create Magic Point Calculator

**Location**: After magic point constants

```javascript
/**
 * Calculate magic points from word composition and pattern
 * @param {Object} words - { adjective: 'hot', noun: 'ball', verb: 'fly', adverb?: 'quickly' }
 * @param {number} patternId - Pattern ID (1-4)
 * @returns {number} Total magic points
 */
function calculateMagicPoints(words, patternId) {
  let basePoints = 0;
  
  // Sum word values based on POS
  for (const [pos, word] of Object.entries(words)) {
    if (word && WORD_MAGIC_VALUES[pos]) {
      basePoints += WORD_MAGIC_VALUES[pos];
    }
  }
  
  // Apply pattern multiplier
  const multiplier = PATTERN_MULTIPLIERS[patternId] || 1.0;
  const totalPoints = Math.floor(basePoints * multiplier);
  
  console.log(`[Magic Points] Base: ${basePoints}, Pattern ${patternId} (×${multiplier}), Total: ${totalPoints}`);
  
  return totalPoints;
}

/**
 * Determine spell tier from magic points
 * @param {number} magicPoints - Total magic points
 * @returns {number} Tier (0-4)
 */
function getTierFromMagicPoints(magicPoints) {
  for (const [tier, range] of Object.entries(MAGIC_TIERS)) {
    if (magicPoints >= range.min && magicPoints <= range.max) {
      return parseInt(tier);
    }
  }
  return 0; // Too weak
}
```

### Step 3: Define Spell Type System

**Location**: Replace SPELL_DICTIONARY

```javascript
// ============================================
// SPELL TYPE SYSTEM
// ============================================

const SPELL_TYPES = {
  projectile: {
    name: 'Projectile',
    icon: '🔥',
    description: 'Fire magical projectiles',
    tiers: {
      1: { 
        name: 'Magic Bolt', 
        damage: 1, 
        speed: 0.3, 
        color: '#9b59b6', 
        focusCost: 10 
      },
      2: { 
        name: 'Enhanced Projectile', 
        damage: 2, 
        speed: 0.4, 
        color: '#e74c3c', 
        focusCost: 15 
      },
      3: { 
        name: 'Power Blast', 
        damage: 3, 
        speed: 0.5, 
        color: '#f39c12', 
        focusCost: 20 
      },
      4: { 
        name: 'Meteor', 
        damage: 5, 
        speed: 0.6, 
        color: '#c0392b', 
        focusCost: 25 
      }
    }
  },
  
  heal: {
    name: 'Heal',
    icon: '💚',
    description: 'Restore health',
    tiers: {
      1: { name: 'Minor Heal', amount: 1, focusCost: 10 },
      2: { name: 'Moderate Heal', amount: 2, focusCost: 15 },
      3: { name: 'Greater Heal', amount: 3, focusCost: 20 },
      4: { name: 'Full Heal', amount: 999, focusCost: 25 }
    }
  },
  
  break: {
    name: 'Break',
    icon: '⛏️',
    description: 'Destroy terrain',
    tiers: {
      1: { name: 'Spark', radius: 0, focusCost: 10 },
      2: { name: 'Tile Break', radius: 0, focusCost: 15 },
      3: { name: 'Area Break', radius: 1, focusCost: 20 },
      4: { name: 'Excavate', radius: 2, focusCost: 25 }
    }
  },
  
  dash: {
    name: 'Dash',
    icon: '⚡',
    description: 'Teleport quickly',
    tiers: {
      1: { name: 'Hop', distance: 1, focusCost: 10 },
      2: { name: 'Short Dash', distance: 2, focusCost: 15 },
      3: { name: 'Long Dash', distance: 4, focusCost: 20 },
      4: { name: 'Blink', distance: 6, focusCost: 25 }
    }
  },
  
  control: {
    name: 'Control',
    icon: '🧊',
    description: 'Affect enemies',
    tiers: {
      1: { name: 'Distract', duration: 30, radius: 3, focusCost: 10 },
      2: { name: 'Slow', duration: 60, radius: 4, focusCost: 15 },
      3: { name: 'Stun', duration: 90, radius: 5, focusCost: 20 },
      4: { name: 'Freeze', duration: 120, radius: 6, focusCost: 25 }
    }
  }
};
```

### Step 4: Update State Management

**Location**: Module state object (line 19 in [`js/syntax-sorcery.js`](js/syntax-sorcery.js:19))

```javascript
const state = {
  initialized: false,
  currentSpell: { adj: null, noun: null, verb: null },
  selectedPattern: 1,
  magicPoints: 0,           // NEW
  selectedSpellType: null,  // NEW: 'projectile', 'heal', etc.
  equippedSpell: null
};
```

### Step 5: Add UI Update Functions

**Location**: In SyntaxEngine object

```javascript
updateMagicMeter() {
  const words = state.currentSpell;
  const patternId = state.selectedPattern;
  
  // Calculate magic points
  const magicPoints = calculateMagicPoints(words, patternId);
  state.magicPoints = magicPoints;
  
  // Update meter fill
  const fillElement = document.getElementById('magic-meter-fill');
  if (fillElement) {
    const percentage = Math.min(100, (magicPoints / 20) * 100);
    fillElement.style.width = percentage + '%';
  }
  
  // Update points display
  const pointsElement = document.getElementById('magic-points');
  if (pointsElement) {
    pointsElement.textContent = magicPoints;
  }
  
  // Update tier display
  const tier = getTierFromMagicPoints(magicPoints);
  const tierElement = document.getElementById('magic-tier');
  if (tierElement) {
    const tierInfo = MAGIC_TIERS[tier];
    tierElement.textContent = `Tier ${tier}: ${tierInfo.name}`;
    
    // Color coding
    if (tier === 0) tierElement.style.color = '#95a5a6';
    else if (tier === 1) tierElement.style.color = '#3498db';
    else if (tier === 2) tierElement.style.color = '#9b59b6';
    else if (tier === 3) tierElement.style.color = '#e67e22';
    else if (tier === 4) tierElement.style.color = '#c0392b';
  }
  
  // Update spell preview if type is selected
  if (state.selectedSpellType) {
    this.updateSpellPreview();
  }
},

updateSpellPreview() {
  const previewElement = document.getElementById('spell-preview');
  if (!previewElement) return;
  
  const tier = getTierFromMagicPoints(state.magicPoints);
  
  if (tier === 0) {
    previewElement.innerHTML = '<span style="color:#95a5a6;">⚠️ Not enough magic power!</span>';
    return;
  }
  
  if (!state.selectedSpellType) {
    previewElement.innerHTML = 'Select a spell type to see details';
    return;
  }
  
  const spellType = SPELL_TYPES[state.selectedSpellType];
  const spellConfig = spellType.tiers[tier];
  
  let html = `
    <div style="text-align:left; padding:10px; background:rgba(255,255,255,0.9); border-radius:8px;">
      <div style="font-weight:bold; font-size:16px; color:#7b1fa2; margin-bottom:8px;">
        ${spellType.icon} ${spellConfig.name}
      </div>
      <div style="font-size:13px; color:#666; margin-bottom:8px;">
        ${spellType.description}
      </div>
      <div style="font-size:12px; color:#e67e22; font-weight:bold;">
        Focus Cost: ${spellConfig.focusCost}
      </div>
    </div>
  `;
  
  previewElement.innerHTML = html;
}
```

### Step 6: Add Spell Type Selection

**Location**: New function in SyntaxEngine

```javascript
selectSpellType(type) {
  state.selectedSpellType = type;
  
  // Update button states
  document.querySelectorAll('.spell-type-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const selectedBtn = document.querySelector(`[data-type="${type}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('active');
  }
  
  // Update preview
  this.updateSpellPreview();
  
  // Update invoke button
  this.updateInvokeButton();
  
  console.log(`[Syntax Engine] Selected spell type: ${type}`);
}
```

### Step 7: Update HTML Structure

**Location**: [`index.html`](index.html:522) - Inside grimoire-body div

Add after sentence-assembly div:

```html
<!-- Magic Meter -->
<div class="magic-meter-container">
  <div class="magic-meter-label">Magic Power</div>
  <div class="magic-meter-bar">
    <div class="magic-meter-fill" id="magic-meter-fill"></div>
  </div>
  <div class="magic-meter-text">
    <span id="magic-points">0</span> / 20
    <span id="magic-tier" style="margin-left:10px; font-weight:bold;">Tier 0</span>
  </div>
</div>

<!-- Spell Type Selector -->
<div class="spell-type-selector">
  <div class="spell-type-label">Choose Spell Type:</div>
  <div class="spell-type-buttons">
    <button class="spell-type-btn" data-type="projectile" onclick="window.SyntaxSorcery.syntax.selectSpellType('projectile')">
      🔥 Projectile
    </button>
    <button class="spell-type-btn" data-type="heal" onclick="window.SyntaxSorcery.syntax.selectSpellType('heal')">
      💚 Heal
    </button>
    <button class="spell-type-btn" data-type="break" onclick="window.SyntaxSorcery.syntax.selectSpellType('break')">
      ⛏️ Break
    </button>
    <button class="spell-type-btn" data-type="dash" onclick="window.SyntaxSorcery.syntax.selectSpellType('dash')">
      ⚡ Dash
    </button>
    <button class="spell-type-btn" data-type="control" onclick="window.SyntaxSorcery.syntax.selectSpellType('control')">
      🧊 Control
    </button>
  </div>
</div>

<!-- Spell Preview -->
<div class="spell-preview" id="spell-preview">
  Select a spell type to see details
</div>
```

### Step 8: Add CSS Styling

**Location**: [`index.html`](index.html:7) - Inside `<style>` tag

```css
/* Magic Meter */
.magic-meter-container {
  background: rgba(255,255,255,0.95);
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #9c27b0;
}

.magic-meter-label {
  font-weight: bold;
  font-size: 14px;
  color: #7b1fa2;
  margin-bottom: 8px;
  text-align: center;
}

.magic-meter-bar {
  width: 100%;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #9c27b0;
}

.magic-meter-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.magic-meter-text {
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #4a148c;
}

/* Spell Type Selector */
.spell-type-selector {
  background: rgba(255,255,255,0.95);
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #9c27b0;
}

.spell-type-label {
  font-weight: bold;
  font-size: 14px;
  color: #7b1fa2;
  margin-bottom: 10px;
  text-align: center;
}

.spell-type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.spell-type-btn {
  background: white;
  border: 2px solid #9c27b0;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a148c;
}

.spell-type-btn:hover {
  background: #f3e5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.spell-type-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #6a1b9a;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Spell Preview */
.spell-preview {
  background: rgba(255,255,255,0.9);
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #9c27b0;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  font-style: italic;
}
```

### Step 9: Rewrite Spell Execution

**Location**: Replace SpellSystem.executeSpell() function

```javascript
executeSpellByType(spellType, tier, config) {
  const player = window.player;
  
  switch(spellType) {
    case 'projectile':
      return this.executeProjectile(tier, config);
    
    case 'heal':
      return this.executeHeal(tier, config);
    
    case 'break':
      return this.executeBreak(tier, config);
    
    case 'dash':
      return this.executeDash(tier, config);
    
    case 'control':
      return this.executeControl(tier, config);
    
    default:
      return { success: false, message: '❌ Unknown spell type!' };
  }
},

executeProjectile(tier, config) {
  const player = window.player;
  const projectiles = window.projectiles;
  
  if (!player || !projectiles) {
    return { success: false, message: '❌ Game not ready!' };
  }
  
  projectiles.push({
    x: player.x,
    y: player.y,
    vx: player.facingLeft ? -config.speed : config.speed,
    vy: 0,
    damage: config.damage,
    color: config.color
  });
  
  this.createSpellParticles(player.x, player.y, config.color, 10 + (tier * 5));
  
  if (typeof window.sfx?.shoot === 'function') {
    window.sfx.shoot();
  }
  
  return { success: true, message: `🔥 ${config.name} fired!` };
},

executeHeal(tier, config) {
  const player = window.player;
  
  if (!player) {
    return { success: false, message: '❌ Game not ready!' };
  }
  
  if (player.hp >= player.maxHp) {
    return { success: false, message: '❌ Already at full health!' };
  }
  
  const healAmount = config.amount === 999 ? player.maxHp : config.amount;
  player.hp = Math.min(player.maxHp, player.hp + healAmount);
  
  // Create healing particles
  for (let i = 0; i < 15 + (tier * 5); i++) {
    const offsetX = (Math.random() - 0.5) * 3;
    const offsetY = Math.random() * -2;
    this.createSpellParticles(
      player.x + offsetX,
      player.y + offsetY,
      '#2ecc71',
      1
    );
  }
  
  if (typeof window.sfx?.collect === 'function') {
    window.sfx.collect();
  }
  
  return { success: true, message: `💚 ${config.name}: +${healAmount} HP!` };
},

executeBreak(tier, config) {
  const player = window.player;
  const grid = window.grid;
  const COLS = window.COLS;
  const ROWS = window.ROWS;
  
  if (!player || !grid) {
    return { success: false, message: '❌ Game not ready!' };
  }
  
  const targetX = player.facingLeft ? player.x - 1 : player.x + 1;
  const targetY = player.y;
  const radius = config.radius;
  
  let brokenCount = 0;
  
  // Break tiles in radius
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = targetX + dx;
      const y = targetY + dy;
      
      if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
        const tileType = grid[y][x];
        
        // Can break solid tiles (not air, not special)
        if (tileType > 0 && tileType !== 6 && tileType !== 11 && tileType !== 13) {
          grid[y][x] = 0;
          this.createSpellParticles(x, y, '#8d6e63', 5);
          brokenCount++;
        }
      }
    }
  }
  
  if (brokenCount === 0) {
    return { success: false, message: '❌ Nothing to break!' };
  }
  
  if (typeof window.sfx?.mine === 'function') {
    window.sfx.mine();
  }
  
  return { success: true, message: `⛏️ ${config.name}: ${brokenCount} tiles destroyed!` };
},

executeDash(tier, config) {
  const player = window.player;
  const grid = window.grid;
  const COLS = window.COLS;
  const ROWS = window.ROWS;
  
  if (!player || !grid) {
    return { success: false, message: '❌ Game not ready!' };
  }
  
  const distance = config.distance;
  const dx = player.facingLeft ? -distance : distance;
  const targetX = player.x + dx;
  const targetY = player.y;
  
  if (targetX < 0 || targetX >= COLS || targetY < 0 || targetY >= ROWS) {
    return { success: false, message: '❌ Cannot teleport there!' };
  }
  
  const targetTile = grid[targetY][targetX];
  if (targetTile !== 0 && targetTile !== 13) {
    return { success: false, message: '❌ Path blocked!' };
  }
  
  // Create trail particles
  for (let i = 0; i <= distance; i++) {
    const x = player.x + (player.facingLeft ? -i : i);
    this.createSpellParticles(x, player.y, '#9b59b6', 3);
  }
  
  player.x = targetX;
  
  if (typeof window.sfx?.jump === 'function') {
    window.sfx.jump();
  }
  
  return { success: true, message: `⚡ ${config.name}: Teleported ${distance} tiles!` };
},

executeControl(tier, config) {
  const player = window.player;
  const enemies = window.enemies;
  
  if (!player || !enemies) {
    return { success: false, message: '❌ Game not ready!' };
  }
  
  let affectedCount = 0;
  const radius = config.radius;
  
  enemies.forEach(enemy => {
    const distance = Math.sqrt(
      Math.pow(enemy.x - player.x, 2) + 
      Math.pow(enemy.y - player.y, 2)
    );
    
    if (distance <= radius) {
      enemy.stun = config.duration;
      this.createSpellParticles(enemy.x, enemy.y, '#3498db', 5);
      affectedCount++;
    }
  });
  
  if (affectedCount === 0) {
    return { success: false, message: '❌ No enemies in range!' };
  }
  
  if (typeof window.sfx?.hit === 'function') {
    window.sfx.hit();
  }
  
  return { success: true, message: `🧊 ${config.name}: ${affectedCount} enemies affected!` };
}
```

### Step 10: Update Invoke Logic

**Location**: Replace invokeSpell() in [`index.html`](index.html:1793)

```javascript
function invokeSpell() {
  if (!window.SyntaxSorcery || !window.SyntaxSorcery.syntax) {
    showToast('❌ Spell system not loaded!', 'warn');
    return;
  }
  
  const validation = window.SyntaxSorcery.syntax.validateSentence();
  if (!validation.valid) {
    showToast('❌ Invalid spell: ' + validation.error, 'warn');
    return;
  }
  
  const state = window.SyntaxSorcery.getState();
  
  // Check if spell type is selected
  if (!state.selectedSpellType) {
    showToast('❌ Select a spell type first!', 'warn');
    return;
  }
  
  // Calculate magic points
  const magicPoints = state.magicPoints;
  const tier = getTierFromMagicPoints(magicPoints);
  
  if (tier === 0) {
    showToast('❌ Not enough magic power!', 'warn');
    return;
  }
  
  // Get spell configuration
  const spellType = SPELL_TYPES[state.selectedSpellType];
  const spellConfig = spellType.tiers[tier];
  
  // Check Focus
  if (player.focus < spellConfig.focusCost) {
    showToast(`❌ Need ${spellConfig.focusCost} Focus!`, 'warn');
    return;
  }
  
  // Execute spell
  const result = window.SyntaxSorcery.spells.executeSpellByType(
    state.selectedSpellType,
    tier,
    spellConfig
  );
  
  if (result.success) {
    player.focus -= spellConfig.focusCost;
    showToast(result.message, 'good');
    window.SyntaxSorcery.syntax.closeGrimoire();
  } else {
    showToast(result.message, 'warn');
  }
}
```

### Step 11: Update fillSlot() to Trigger Magic Meter

**Location**: In SyntaxEngine.fillSlot()

Add at the end of the function:

```javascript
// Update magic meter whenever a slot is filled
this.updateMagicMeter();
```

### Step 12: Update clearSlot() to Trigger Magic Meter

**Location**: In SyntaxEngine.clearSlot()

Add at the end of the function:

```javascript
// Update magic meter whenever a slot is cleared
this.updateMagicMeter();
```

---

## Testing Plan

### Test Cases

1. **Basic Spell (Tier 1)**
   - Pattern 1: "The hot ball flies" → 9 points → Tier 1
   - Select Projectile → Should show "Magic Bolt"
   - Invoke → Should fire purple projectile

2. **Intermediate Spell (Tier 2)**
   - Pattern 2: "Throw the hot ball" → 10 points → Tier 2
   - Select Heal → Should show "Moderate Heal"
   - Invoke → Should heal 2 HP

3. **Advanced Spell (Tier 3)**
   - Pattern 4: "A quick fox runs swiftly" → 14 points → Tier 3
   - Select Dash → Should show "Long Dash"
   - Invoke → Should teleport 4 tiles

4. **Master Spell (Tier 4)**
   - Pattern 4 with strong words → 16+ points → Tier 4
   - Select Break → Should show "Excavate"
   - Invoke → Should destroy 5x5 area

5. **Too Weak**
   - Pattern 3 with weak words → <6 points → Tier 0
   - Should show "Not enough magic power"
   - Invoke button should be disabled

### Balance Verification

- Verify Focus costs scale appropriately
- Test that all spell types work at all tiers
- Ensure magic meter updates in real-time
- Confirm spell preview shows correct information

---

## Migration Notes

### Breaking Changes
- Old saved spells using SPELL_DICTIONARY will no longer work
- Players will need to re-equip spells using new system

### Backward Compatibility
- Lexicon data remains compatible
- Player stats and resources unaffected
- Only spell system changes

---

## Documentation Updates

### Files to Update
1. [`docs/Syntax_Sorcery_Architecture.md`](docs/Syntax_Sorcery_Architecture.md) - Add magic point system section
2. [`plans/Phase_4_Implementation_Complete.md`](plans/Phase_4_Implementation_Complete.md) - Mark as superseded
3. Create new gameplay guide explaining magic points

### Inline Comments
- Add JSDoc comments to all new functions
- Document magic point calculations
- Explain tier thresholds

---

## Success Criteria

✅ ANY word combination creates a valid spell
✅ Magic points calculated correctly from POS and pattern
✅ All 5 spell types work at all 4 tiers
✅ Magic meter updates in real-time
✅ Spell preview shows accurate information
✅ Focus costs scale with tier
✅ No restrictive word matching
✅ Educational: teaches sentence complexity matters

---

## Next Steps After Implementation

1. Balance testing with real gameplay
2. Add visual effects for different tiers
3. Consider adding spell combos
4. Implement spell cooldowns
5. Add achievement system for discovering powerful spells
