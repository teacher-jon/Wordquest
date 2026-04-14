# Phase 4: Spell Execution System - Complete Implementation Plan
## WordCraft v5 - Syntax Sorcery

**Status**: Ready for Implementation  
**Dependencies**: Phase 3 Complete (Syntax Engine with Pattern System)  
**Goal**: Map validated sentences to executable game actions with Focus costs

---

## Current State Analysis

### ✅ What's Already Working (Phase 3)
- **Lexicon System**: Words stored with POS metadata
- **Syntax Grimoire UI**: Drag & drop sentence assembly
- **Pattern System**: 4 sentence patterns with proper grammar
- **Validation Engine**: Checks POS correctness and generates sentences
- **Invoke Button**: Wired up but placeholder implementation

### 🎯 What Phase 4 Needs to Add
1. **Spell Dictionary**: Map sentence patterns to spell IDs
2. **Spell Execution Functions**: Actual game effects
3. **Focus Cost System**: Consume player.focus when casting
4. **Equipped Spell System**: Quick-cast with hotkey
5. **Visual Effects**: Particles and feedback
6. **HUD Display**: Show equipped spell

---

## Architecture Overview

```
Sentence Assembly (Phase 3)
    ↓
Validation (Phase 3)
    ↓
[NEW] Spell Mapping (Pattern + Words → Spell ID)
    ↓
[NEW] Focus Check (Can player afford it?)
    ↓
[NEW] Spell Execution (Game effect)
    ↓
[NEW] Visual Feedback (Particles, sounds, toast)
```

---

## Implementation Tasks

### Task 4.1: Create Spell Dictionary

**File**: [`js/syntax-sorcery.js`](../js/syntax-sorcery.js:647-661) - SpellSystesection

**Structure**:
```javascript
const SPELL_DICTIONARY = {
  // Generic pattern-based spells (any words matching pattern)
  generic: [
    {
      pattern: 1, // Pattern ID
      requirements: { noun: 'any', verb: 'any', adjective: 'any' },
      spellId: 'basic_projectile',
      priority: 1 // Lower = checked first
    },
    {
      pattern: 2,
      requirements: { verb: 'throw', noun: 'any', adjective: 'any' },
      spellId: 'enhanced_throw',
      priority: 2
    }
  ],
  
  // Specific word-based spells (exact word matches)
  specific: [
    {
      words: { adjective: 'hot', noun: 'ball', verb: 'fly' },
      pattern: 1,
      spellId: 'fireball',
      priority: 0 // Highest priority
    },
    {
      words: { adjective: 'sharp', noun: 'arrow', verb: 'fly' },
      pattern: 1,
      spellId: 'piercing_shot',
      priority: 0
    }
  ]
};
```

**Matching Logic**:
1. Check specific matches first (exact word combinations)
2. Then check generic patterns (any words in pattern)
3. Return first match or null

---

### Task 4.2: Define Initial Spell Catalog

**5 Core Spells** (expandable in Phase 6):

#### 1. Fireball (Projectile Spell)
- **Trigger**: Pattern 1 or 3 with "hot/fire" + "ball" + "fly/throw"
- **Effect**: Fire enhanced projectile that deals 2 damage
- **Focus Cost**: 15
- **Visual**: Red/orange particle trail
- **Code Hook**: Modify existing [`projectiles`](../index.html:668) array

#### 2. Healing Rain (Restoration Spell)
- **Trigger**: Pattern 1 with "gentle/soft" + "rain/water" + "fall/heal"
- **Effect**: Restore 1 HP (up to maxHp)
- **Focus Cost**: 20
- **Visual**: Blue particles falling around player
- **Code Hook**: `player.hp = Math.min(player.maxHp, player.hp + 1)`

#### 3. Earth Breaker (Mining Spell)
- **Trigger**: Pattern 2 with "break/smash" + "hard/solid" + "stone/rock"
- **Effect**: Remove tile block in front of player (like mining but instant)
- **Focus Cost**: 10
- **Visual**: Brown/gray explosion particles
- **Code Hook**: Modify [`grid`](../index.html:668) array

#### 4. Swift Step (Movement Spell)
- **Trigger**: Pattern 4 with "quick/fast" + any noun + "move/run" + "swiftly/quickly"
- **Effect**: Teleport 3 tiles in facing direction
- **Focus Cost**: 12
- **Visual**: Purple trail particles
- **Code Hook**: Update `player.x` or `player.y`

#### 5. Enemy Stun (Combat Spell)
- **Trigger**: Pattern 2 with "freeze/stop" + any adjective + "enemy/monster"
- **Effect**: Stun all enemies within 5 tile radius for 3 seconds
- **Focus Cost**: 18
- **Visual**: Yellow pulse effect
- **Code Hook**: Set `enemy.stun = 90` (3 seconds at 30fps)

---

### Task 4.3: Implement Spell Mapping Function

**File**: [`js/syntax-sorcery.js`](../js/syntax-sorcery.js:652-655)

```javascript
mapSpell(sentence, words, patternId) {
  // words = { adjective: 'hot', noun: 'ball', verb: 'fly' }
  // patternId = 1
  
  // 1. Check specific matches first
  for (const spell of SPELL_DICTIONARY.specific) {
    if (spell.pattern !== patternId) continue;
    
    let match = true;
    for (const [pos, word] of Object.entries(spell.words)) {
      if (words[pos]?.toLowerCase() !== word.toLowerCase()) {
        match = false;
        break;
      }
    }
    
    if (match) {
      return this.getSpellById(spell.spellId);
    }
  }
  
  // 2. Check generic patterns
  for (const spell of SPELL_DICTIONARY.generic) {
    if (spell.pattern !== patternId) continue;
    
    let match = true;
    for (const [pos, requirement] of Object.entries(spell.requirements)) {
      if (requirement === 'any') continue;
      if (words[pos]?.toLowerCase() !== requirement.toLowerCase()) {
        match = false;
        break;
      }
    }
    
    if (match) {
      return this.getSpellById(spell.spellId);
    }
  }
  
  // 3. No match found - return default spell
  return this.getSpellById('basic_projectile');
}
```

---

### Task 4.4: Create Spell Execution Functions

**File**: [`js/syntax-sorcery.js`](../js/syntax-sorcery.js:647-661)

```javascript
const SPELLS = {
  basic_projectile: {
    id: 'basic_projectile',
    name: 'Magic Bolt',
    focusCost: 15,
    execute() {
      const player = window.player;
      const projectiles = window.projectiles;
      
      // Fire projectile in facing direction
      projectiles.push({
        x: player.x,
        y: player.y,
        vx: player.facingLeft ? -0.3 : 0.3,
        vy: 0,
        damage: 2,
        color: '#9b59b6' // Purple
      });
      
      // Visual feedback
      SpellSystem.createSpellParticles(player.x, player.y, '#9b59b6', 10);
      
      if (typeof window.sfx?.shoot === 'function') {
        window.sfx.shoot();
      }
      
      return { success: true, message: '⚡ Magic Bolt fired!' };
    }
  },
  
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    focusCost: 15,
    execute() {
      const player = window.player;
      const projectiles = window.projectiles;
      
      projectiles.push({
        x: player.x,
        y: player.y,
        vx: player.facingLeft ? -0.4 : 0.4,
        vy: 0,
        damage: 3,
        color: '#e74c3c' // Red
      });
      
      SpellSystem.createSpellParticles(player.x, player.y, '#e74c3c', 15);
      
      if (typeof window.sfx?.shoot === 'function') {
        window.sfx.shoot();
      }
      
      return { success: true, message: '🔥 Fireball launched!' };
    }
  },
  
  healing_rain: {
    id: 'healing_rain',
    name: 'Healing Rain',
    focusCost: 20,
    execute() {
      const player = window.player;
      
      if (player.hp >= player.maxHp) {
        return { success: false, message: '❌ Already at full health!' };
      }
      
      player.hp = Math.min(player.maxHp, player.hp + 1);
      
      // Create falling particles around player
      for (let i = 0; i < 20; i++) {
        const offsetX = (Math.random() - 0.5) * 3;
        const offsetY = Math.random() * -2;
        SpellSystem.createSpellParticles(
          player.x + offsetX,
          player.y + offsetY,
          '#3498db',
          1
        );
      }
      
      if (typeof window.sfx?.collect === 'function') {
        window.sfx.collect();
      }
      
      return { success: true, message: '💧 Healed 1 HP!' };
    }
  },
  
  earth_breaker: {
    id: 'earth_breaker',
    name: 'Earth Breaker',
    focusCost: 10,
    execute() {
      const player = window.player;
      const grid = window.grid;
      
      // Calculate target tile in front of player
      const targetX = player.facingLeft ? player.x - 1 : player.x + 1;
      const targetY = player.y;
      
      // Check bounds
      if (targetX < 0 || targetX >= window.COLS || targetY < 0 || targetY >= window.ROWS) {
        return { success: false, message: '❌ Nothing to break!' };
      }
      
      const tileType = grid[targetY][targetX];
      
      // Can only break certain tiles (not air, not special tiles)
      if (tileType === 0 || tileType === 6 || tileType === 11 || tileType === 13) {
        return { success: false, message: '❌ Cannot break this!' };
      }
      
      // Break the tile
      grid[targetY][targetX] = 0;
      
      // Create explosion particles
      SpellSystem.createSpellParticles(targetX, targetY, '#8d6e63', 20);
      
      if (typeof window.sfx?.mine === 'function') {
        window.sfx.mine();
      }
      
      return { success: true, message: '💥 Tile destroyed!' };
    }
  },
  
  swift_step: {
    id: 'swift_step',
    name: 'Swift Step',
    focusCost: 12,
    execute() {
      const player = window.player;
      const grid = window.grid;
      
      // Teleport 3 tiles in facing direction
      const distance = 3;
      const dx = player.facingLeft ? -distance : distance;
      const targetX = player.x + dx;
      const targetY = player.y;
      
      // Check bounds
      if (targetX < 0 || targetX >= window.COLS || targetY < 0 || targetY >= window.ROWS) {
        return { success: false, message: '❌ Cannot teleport there!' };
      }
      
      // Check if target is walkable
      const targetTile = grid[targetY][targetX];
      if (targetTile !== 0 && targetTile !== 13) {
        return { success: false, message: '❌ Path blocked!' };
      }
      
      // Create trail particles
      for (let i = 0; i <= distance; i++) {
        const x = player.x + (player.facingLeft ? -i : i);
        SpellSystem.createSpellParticles(x, player.y, '#9b59b6', 3);
      }
      
      // Teleport
      player.x = targetX;
      
      if (typeof window.sfx?.jump === 'function') {
        window.sfx.jump();
      }
      
      return { success: true, message: '⚡ Teleported!' };
    }
  },
  
  enemy_stun: {
    id: 'enemy_stun',
    name: 'Mass Stun',
    focusCost: 18,
    execute() {
      const player = window.player;
      const enemies = window.enemies;
      
      if (!enemies || enemies.length === 0) {
        return { success: false, message: '❌ No enemies nearby!' };
      }
      
      // Stun enemies within 5 tile radius
      const radius = 5;
      let stunnedCount = 0;
      
      enemies.forEach(enemy => {
        const distance = Math.sqrt(
          Math.pow(enemy.x - player.x, 2) + 
          Math.pow(enemy.y - player.y, 2)
        );
        
        if (distance <= radius) {
          enemy.stun = 90; // 3 seconds at 30fps
          stunnedCount++;
          SpellSystem.createSpellParticles(enemy.x, enemy.y, '#f1c40f', 5);
        }
      });
      
      if (stunnedCount === 0) {
        return { success: false, message: '❌ No enemies in range!' };
      }
      
      if (typeof window.sfx?.hit === 'function') {
        window.sfx.hit();
      }
      
      return { success: true, message: `⚡ Stunned ${stunnedCount} enemies!` };
    }
  }
};

// Helper to get spell by ID
getSpellById(spellId) {
  return SPELLS[spellId] || SPELLS.basic_projectile;
}
```

---

### Task 4.5: Wire Up Invoke Button

**File**: [`index.html`](../index.html:1718-1724) - invokeSpell function

```javascript
function invokeSpell() {
  if (!window.SyntaxSorcery || !window.SyntaxSorcery.spells) {
    showToast('❌ Spell system not loaded!', 'warn');
    return;
  }
  
  // Get validated sentence from Syntax Engine
  const validation = window.SyntaxSorcery.syntax.validateSentence();
  
  if (!validation.valid) {
    showToast('❌ Invalid spell: ' + validation.error, 'warn');
    return;
  }
  
  // Get current spell state
  const currentSpell = window.SyntaxSorcery.syntax.getCurrentSpell();
  const patternId = window.SyntaxSorcery.syntax.getSelectedPattern();
  
  // Map to spell
  const spell = window.SyntaxSorcery.spells.mapSpell(
    validation.sentence,
    currentSpell,
    patternId
  );
  
  // Check Focus cost
  if (player.focus < spell.focusCost) {
    showToast(`❌ Not enough Focus! Need ${spell.focusCost}, have ${player.focus}`, 'warn');
    return;
  }
  
  // Execute spell
  const result = window.SyntaxSorcery.spells.executeSpell(spell.id);
  
  if (result.success) {
    // Deduct Focus
    player.focus -= spell.focusCost;
    
    // Show feedback
    showToast(result.message, 'good');
    
    // Close grimoire
    window.SyntaxSorcery.syntax.closeGrimoire();
  } else {
    showToast(result.message, 'warn');
  }
}
```

---

### Task 4.6: Add Equipped Spell System

**Data Structure** (add to player object):
```javascript
// In index.html player initialization
player = {
  // ... existing properties ...
  equippedSpell: null, // { spellId, sentence, words, patternId }
  lexicon: [] // Already exists from Phase 1
}
```

**UI Changes**:

1. **Add "Equip" Button to Grimoire** ([`index.html`](../index.html:521-526)):
```html
<div class="grimoire-footer">
    <button class="invoke-btn" id="btn-invoke" onclick="invokeSpell()" disabled>
        ⚡ Invoke Spell
    </button>
    <button class="equip-btn" id="btn-equip" onclick="equipSpell()" disabled>
        📌 Equip Spell
    </button>
    <button class="close-btn" onclick="closeGrimoire()">Close</button>
</div>
```

2. **Add HUD Display** ([`index.html`](../index.html:197-202)):
```html
<div id="equipped-spell-display" style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.7); color:#fff; padding:8px 12px; border-radius:6px; font-size:14px; display:none;">
    <div style="font-weight:bold; margin-bottom:4px;">⚡ Equipped Spell</div>
    <div id="equipped-spell-name">None</div>
    <div style="font-size:12px; color:#aaa; margin-top:4px;">Press Q to cast</div>
</div>
```

3. **Equip Function** ([`index.html`](../index.html:1724)):
```javascript
function equipSpell() {
  if (!window.SyntaxSorcery) return;
  
  const validation = window.SyntaxSorcery.syntax.validateSentence();
  if (!validation.valid) {
    showToast('❌ Invalid spell!', 'warn');
    return;
  }
  
  const currentSpell = window.SyntaxSorcery.syntax.getCurrentSpell();
  const patternId = window.SyntaxSorcery.syntax.getSelectedPattern();
  const spell = window.SyntaxSorcery.spells.mapSpell(validation.sentence, currentSpell, patternId);
  
  player.equippedSpell = {
    spellId: spell.id,
    sentence: validation.sentence,
    words: { ...currentSpell },
    patternId: patternId
  };
  
  // Update HUD
  document.getElementById('equipped-spell-name').textContent = spell.name;
  document.getElementById('equipped-spell-display').style.display = 'block';
  
  showToast(`📌 Equipped: ${spell.name}`, 'good');
  window.SyntaxSorcery.syntax.closeGrimoire();
}
```

4. **Quick Cast Hotkey** ([`index.html`](../index.html:831-870)):
```javascript
// In keydown handler
if (e.key === 'q' || e.key === 'Q') {
  if (player.equippedSpell) {
    const spell = window.SyntaxSorcery.spells.getSpellById(player.equippedSpell.spellId);
    
    if (player.focus < spell.focusCost) {
      showToast(`❌ Not enough Focus! Need ${spell.focusCost}`, 'warn');
      return;
    }
    
    const result = window.SyntaxSorcery.spells.executeSpell(spell.id);
    
    if (result.success) {
      player.focus -= spell.focusCost;
      showToast(result.message, 'good');
    } else {
      showToast(result.message, 'warn');
    }
  } else {
    showToast('❌ No spell equipped! Open Grimoire (G) to equip one.', 'warn');
  }
}
```

---

### Task 4.7: Visual Effects System

**File**: [`js/syntax-sorcery.js`](../js/syntax-sorcery.js:647-661)

```javascript
createSpellParticles(x, y, color, count) {
  if (!window.particles) return;
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 0.1 + Math.random() * 0.1;
    
    window.particles.push({
      x: x + Math.cos(angle) * 0.5,
      y: y + Math.sin(angle) * 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      char: '✨',
      color: color,
      life: 30
    });
  }
}
```

**Enhance Projectile Rendering** ([`index.html`](../index.html:1196)):
```javascript
// In draw() function, replace projectile rendering
projectiles.forEach(p => {
  ctx.fillStyle = p.color || 'yellow';
  ctx.fillRect(p.x * TILE_SIZE, p.y * TILE_SIZE, 8, 8);
  
  // Add glow effect
  ctx.shadowBlur = 10;
  ctx.shadowColor = p.color || 'yellow';
  ctx.fillRect(p.x * TILE_SIZE, p.y * TILE_SIZE, 8, 8);
  ctx.shadowBlur = 0;
});
```

---

### Task 4.8: Update Particle System for Velocity

**File**: [`index.html`](../index.html:806) - Particle update loop

```javascript
// Enhance particle system to support velocity
for(let i=particles.length-1; i>=0; i--) {
  let p = particles[i];
  p.life--;
  
  // Apply velocity if present
  if (p.vx !== undefined) p.x += p.vx;
  if (p.vy !== undefined) p.y += p.vy;
  else p.y -= 0.05; // Default upward drift
  
  if (p.life <= 0) particles.splice(i, 1);
}
```

---

## Testing Checklist

### Basic Spell Execution
- [ ] Open Grimoire (G key)
- [ ] Assemble valid sentence (e.g., "hot ball fly")
- [ ] Click "Invoke Spell"
- [ ] Verify Focus is deducted
- [ ] Verify spell effect occurs (projectile fires)
- [ ] Verify toast notification appears
- [ ] Verify Grimoire closes

### Focus Cost System
- [ ] Set player.focus to 10
- [ ] Try to cast 15-cost spell
- [ ] Verify rejection message
- [ ] Restore focus to 50
- [ ] Cast spell successfully

### Each Spell Type
- [ ] **Fireball**: Fires red projectile, deals damage to enemy
- [ ] **Healing Rain**: Restores 1 HP, blue particles
- [ ] **Earth Breaker**: Removes tile in front, brown particles
- [ ] **Swift Step**: Teleports 3 tiles, purple trail
- [ ] **Enemy Stun**: Freezes nearby enemies, yellow pulse

### Equipped Spell System
- [ ] Assemble spell in Grimoire
- [ ] Click "Equip Spell"
- [ ] Verify HUD shows equipped spell
- [ ] Press Q to quick-cast
- [ ] Verify spell executes without opening Grimoire
- [ ] Verify Focus is deducted

### Edge Cases
- [ ] Try to cast with 0 Focus
- [ ] Try to heal at full HP
- [ ] Try to break unbreakable tile
- [ ] Try to teleport out of bounds
- [ ] Try to stun when no enemies present
- [ ] Save game with equipped spell → Load → Verify persistence

### Integration Tests
- [ ] Cast spell during combat
- [ ] Cast spell while moving
- [ ] Cast multiple spells in succession
- [ ] Verify existing game features still work (mining, crafting, etc.)

---

## File Modification Summary

### Files to Modify

1. **[`js/syntax-sorcery.js`](../js/syntax-sorcery.js)**
   - Add SPELL_DICTIONARY constant (~50 lines)
   - Add SPELLS object with 6 spell definitions (~200 lines)
   - Implement mapSpell() function (~40 lines)
   - Implement executeSpell() function (~10 lines)
   - Implement getSpellById() function (~5 lines)
   - Implement createSpellParticles() function (~20 lines)
   - Add getCurrentSpell() and getSelectedPattern() helpers (~10 lines)
   - **Total**: ~335 lines

2. **[`index.html`](../index.html)**
   - Add equippedSpell to player object (~1 line)
   - Rewrite invokeSpell() function (~30 lines)
   - Add equipSpell() function (~25 lines)
   - Add Q key handler for quick-cast (~20 lines)
   - Add equipped spell HUD element (~10 lines)
   - Update particle system for velocity (~5 lines)
   - Enhance projectile rendering (~10 lines)
   - **Total**: ~100 lines

### Total Code Impact
- **New Code**: ~435 lines
- **Modified Code**: ~20 lines
- **Breaking Changes**: 0
- **Risk Level**: MEDIUM (integrates with combat/movement systems)

---

## Success Criteria

### Phase 4 Complete When:
- ✅ All 6 spells implemented and working
- ✅ Focus cost system integrated
- ✅ Invoke button executes spells
- ✅ Equipped spell system with Q hotkey
- ✅ Visual effects for all spells
- ✅ HUD displays equipped spell
- ✅ All tests passing
- ✅ No regression in existing features
- ✅ Save/load preserves equipped spell

---

## Integration Points

### Existing Systems Used
1. **Focus System**: [`player.focus`](../index.html:671) - Already exists
2. **Projectiles**: [`projectiles`](../index.html:668) array - Already exists
3. **Particles**: [`particles`](../index.html:668) array - Already exists
4. **Enemies**: [`enemies`](../index.html:668) array - Already exists
5. **Grid**: [`grid`](../index.html:668) array - Already exists
6. **Sound Effects**: [`sfx`](../index.html:560) object - Already exists

### New Systems Added
1. **Spell Dictionary**: Maps patterns to spells
2. **Spell Execution**: Runs game effects
3. **Equipped Spell**: Quick-cast system
4. **Spell Particles**: Enhanced visual feedback

---

## Risk Mitigation

### Potential Issues
1. **Projectile Collision**: Spell projectiles might not hit enemies
   - **Solution**: Use existing projectile system, just add color property
   
2. **Focus Drain Too Fast**: Players run out of Focus quickly
   - **Solution**: Costs are balanced (10-20), existing Focus regen works
   
3. **Teleport Bugs**: Swift Step might teleport into walls
   - **Solution**: Check target tile before teleporting
   
4. **Save Compatibility**: Old saves don't have equippedSpell
   - **Solution**: Add null check in load function

### Safeguards
- All spell effects check bounds before modifying game state
- Focus check happens before execution
- Fallback to basic_projectile if no spell match
- Equipped spell is optional (game works without it)

---

## Next Steps After Phase 4

1. **Test thoroughly** - All spells in various scenarios
2. **Update Progress Report** - Document Phase 4 completion
3. **Merge to dev branch** - Phase 4 complete
4. **Begin Phase 5** - Grammar Gates implementation

---

## Notes

- Spell system is **additive only** - doesn't break existing features
- Focus costs are balanced with existing Focus economy
- Visual effects use existing particle system
- All spells respect game boundaries and rules
- Equipped spell persists across save/load
- System is extensible - easy to add more spells in Phase 6

---

**Phase 4 Ready for Implementation!** 🚀
