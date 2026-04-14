# Phase 4: Cleanup & Migration Plan
**Based on**: Phase 4 Audit Report  
**Goal**: Complete migration to Magic Point System  
**Status**: Ready for Implementation  
**Estimated Time**: 4 hours

---

## Overview

This plan addresses the hybrid spell system by completing the migration to the Magic Point System. The Invoke button already uses magic points; we need to update the Equip button and Q key handler to match, then remove ~400 lines of legacy dictionary code.

---

## Current State

### ✅ Working (Magic Point System)
- `invokeSpell()` function uses magic points
- Magic meter UI displays and updates
- Spell type selector (5 buttons)
- Tier calculation from magic points
- `executeSpellByType()` functions

### ⚠️ Needs Update (Dictionary System)
- `equipSpell()` function uses `mapSpell()`
- Q key handler expects dictionary-based spell IDs
- Player equipped spell structure uses old format

### ❌ To Remove (Legacy Code)
- `SPELLS` object (~267 lines)
- `mapSpell()` function (~47 lines)
- `getSpellById()` function (if unused)
- Any `SPELL_DICTIONARY` references

---

## Implementation Steps

### Step 1: Update `equipSpell()` Function

**File**: [`index.html`](../index.html:1990-2017)

**Current Code** (Lines 1990-2017):
```javascript
function equipSpell() {
    if (!window.SyntaxSorcery) {
        showToast('❌ Spell system not loaded!', 'warn');
        return;
    }
    
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

**New Code**:
```javascript
function equipSpell() {
    if (!window.SyntaxSorcery || !window.SyntaxSorcery.syntax) {
        showToast('❌ Spell system not loaded!', 'warn');
        return;
    }
    
    const validation = window.SyntaxSorcery.syntax.validateSentence();
    if (!validation.valid) {
        showToast('❌ Invalid spell!', 'warn');
        return;
    }
    
    const state = window.SyntaxSorcery.getState();
    
    // Check if spell type is selected
    if (!state.selectedSpellType) {
        showToast('❌ Select a spell type first!', 'warn');
        return;
    }
    
    // Calculate magic points and tier
    const magicPoints = state.magicPoints;
    const tier = window.SyntaxSorcery.getTierFromMagicPoints(magicPoints);
    
    if (tier === 0) {
        showToast('❌ Not enough magic power!', 'warn');
        return;
    }
    
    // Get spell configuration
    const spellType = window.SyntaxSorcery.SPELL_TYPES[state.selectedSpellType];
    const spellConfig = spellType.tiers[tier];
    
    // Store equipped spell with magic point data
    player.equippedSpell = {
        spellType: state.selectedSpellType,
        tier: tier,
        name: spellConfig.name,
        focusCost: spellConfig.focusCost,
        sentence: validation.sentence,
        words: { ...state.currentSpell },
        patternId: state.selectedPattern,
        magicPoints: magicPoints
    };
    
    // Update HUD
    const nameElement = document.getElementById('equipped-spell-name');
    if (nameElement) {
        nameElement.textContent = spellConfig.name;
    }
    
    const displayElement = document.getElementById('equipped-spell-display');
    if (displayElement) {
        displayElement.style.display = 'block';
    }
    
    showToast(`📌 Equipped: ${spellConfig.name} (${spellType.icon})`, 'good');
    window.SyntaxSorcery.syntax.closeGrimoire();
}
```

**Changes**:
- ✅ Uses `state.selectedSpellType` instead of `mapSpell()`
- ✅ Calculates tier from magic points
- ✅ Stores spell type and tier instead of spell ID
- ✅ Includes magic points for reference
- ✅ Adds null checks for DOM elements

---

### Step 2: Update Q Key Handler

**File**: [`index.html`](../index.html) - Search for Q key handler

**Current Code** (approximate):
```javascript
if (e.key === 'q' || e.key === 'Q') {
    if (player.equippedSpell) {
        const spell = window.SyntaxSorcery.spells.getSpellById(player.equippedSpell.spellId);
        
        if (player.focus < spell.focusCost) {
            showToast(`❌ Not enough Focus!`, 'warn');
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
        showToast('❌ No spell equipped!', 'warn');
    }
}
```

**New Code**:
```javascript
if (e.key === 'q' || e.key === 'Q') {
    if (player.equippedSpell) {
        // Get spell configuration from equipped data
        const spellType = window.SyntaxSorcery.SPELL_TYPES[player.equippedSpell.spellType];
        
        if (!spellType) {
            showToast('❌ Invalid equipped spell!', 'warn');
            return;
        }
        
        const spellConfig = spellType.tiers[player.equippedSpell.tier];
        
        if (!spellConfig) {
            showToast('❌ Invalid spell tier!', 'warn');
            return;
        }
        
        // Check Focus
        if (player.focus < spellConfig.focusCost) {
            showToast(`❌ Need ${spellConfig.focusCost} Focus!`, 'warn');
            return;
        }
        
        // Execute spell using magic point system
        const result = window.SyntaxSorcery.spells.executeSpellByType(
            player.equippedSpell.spellType,
            player.equippedSpell.tier,
            spellConfig
        );
        
        if (result.success) {
            player.focus -= spellConfig.focusCost;
            showToast(result.message, 'good');
        } else {
            showToast(result.message, 'warn');
        }
    } else {
        showToast('❌ No spell equipped! Open Grimoire (G) to equip one.', 'warn');
    }
}
```

**Changes**:
- ✅ Uses `player.equippedSpell.spellType` and `tier`
- ✅ Gets config from `SPELL_TYPES` instead of `SPELLS`
- ✅ Calls `executeSpellByType()` instead of `executeSpell()`
- ✅ Adds validation for spell type and tier
- ✅ More helpful error messages

---

### Step 3: Remove Legacy Code

**File**: [`js/syntax-sorcery.js`](../js/syntax-sorcery.js)

#### 3.1: Remove `SPELLS` Object

**Location**: Lines 926-1193 (approximately)

**Code to Remove**:
```javascript
// Legacy spell definitions (kept for backward compatibility)
const SPELLS = {
  basic_projectile: { ... },
  fireball: { ... },
  piercing_shot: { ... },
  healing_rain: { ... },
  earth_breaker: { ... },
  swift_step: { ... },
  enemy_stun: { ... }
};
```

**Action**: Delete entire `SPELLS` object

#### 3.2: Remove `mapSpell()` Function

**Location**: Lines 1200-1246 (approximately)

**Code to Remove**:
```javascript
mapSpell(sentence, words, patternId) {
  // 1. Check specific matches first
  for (const spell of SPELL_DICTIONARY.specific) {
    // ... matching logic
  }
  
  // 2. Check generic patterns
  for (const spell of SPELL_DICTIONARY.generic) {
    // ... matching logic
  }
  
  // 3. No match found - return default spell
  return this.getSpellById('basic_projectile');
}
```

**Action**: Delete entire `mapSpell()` function

#### 3.3: Remove `getSpellById()` Function

**Location**: Search for `getSpellById`

**Code to Remove**:
```javascript
getSpellById(spellId) {
  return SPELLS[spellId] || SPELLS.basic_projectile;
}
```

**Action**: Delete if only used by dictionary system

#### 3.4: Remove `executeSpell()` Function

**Location**: Search for `executeSpell(spellId)`

**Code to Remove**:
```javascript
executeSpell(spellId) {
  const spell = this.getSpellById(spellId);
  if (!spell || !spell.execute) {
    return { success: false, message: '❌ Spell not found!' };
  }
  return spell.execute();
}
```

**Action**: Delete if only used by dictionary system

#### 3.5: Search for SPELL_DICTIONARY References

**Action**: Search entire codebase for `SPELL_DICTIONARY` and remove any remaining references

---

### Step 4: Update Save/Load Compatibility

**File**: [`index.html`](../index.html) - Search for save/load functions

**Issue**: Old saved games may have equipped spells in dictionary format

**Solution**: Add migration logic in load function

```javascript
// In loadGame() or similar function
if (savedData.player.equippedSpell) {
    const equipped = savedData.player.equippedSpell;
    
    // Check if old format (has spellId)
    if (equipped.spellId && !equipped.spellType) {
        console.log('[Migration] Converting old equipped spell format');
        
        // Clear old equipped spell - player will need to re-equip
        player.equippedSpell = null;
        
        // Hide HUD
        const displayElement = document.getElementById('equipped-spell-display');
        if (displayElement) {
            displayElement.style.display = 'none';
        }
        
        showToast('⚠️ Equipped spell cleared due to system update. Please re-equip.', 'warn');
    } else {
        // New format - load normally
        player.equippedSpell = equipped;
        
        // Update HUD
        if (equipped.name) {
            const nameElement = document.getElementById('equipped-spell-name');
            if (nameElement) {
                nameElement.textContent = equipped.name;
            }
            
            const displayElement = document.getElementById('equipped-spell-display');
            if (displayElement) {
                displayElement.style.display = 'block';
            }
        }
    }
}
```

---

### Step 5: Update Module Exports

**File**: [`js/syntax-sorcery.js`](../js/syntax-sorcery.js) - End of file

**Current Exports** (approximate):
```javascript
window.SyntaxSorcery = {
  syntax: SyntaxEngine,
  spells: SpellSystem,
  lexicon: LexiconManager,
  getState: () => state,
  calculateMagicPoints,
  getTierFromMagicPoints,
  SPELL_TYPES,
  MAGIC_TIERS
};
```

**Verify**: Ensure these are exported and remove any legacy exports:
- ❌ Remove: `SPELLS` (if exported)
- ❌ Remove: `SPELL_DICTIONARY` (if exported)
- ✅ Keep: `SPELL_TYPES`
- ✅ Keep: `calculateMagicPoints`
- ✅ Keep: `getTierFromMagicPoints`
- ✅ Keep: `MAGIC_TIERS`

---

### Step 6: Update SpellSystem Methods

**File**: [`js/syntax-sorcery.js`](../js/syntax-sorcery.js)

**Keep These Methods**:
- ✅ `executeSpellByType(spellType, tier, config)`
- ✅ `executeProjectile(tier, config)`
- ✅ `executeHeal(tier, config)`
- ✅ `executeBreak(tier, config)`
- ✅ `executeDash(tier, config)`
- ✅ `executeControl(tier, config)`
- ✅ `createSpellParticles(x, y, color, count)`

**Remove These Methods**:
- ❌ `mapSpell(sentence, words, patternId)`
- ❌ `getSpellById(spellId)`
- ❌ `executeSpell(spellId)`

---

## Testing Checklist

### Pre-Migration Testing
- [ ] Document current behavior of Invoke button
- [ ] Document current behavior of Equip button
- [ ] Document current behavior of Q key
- [ ] Test save/load with equipped spell
- [ ] Note any bugs or issues

### Post-Migration Testing

#### Basic Functionality
- [ ] Open Grimoire (G key)
- [ ] Assemble sentence (e.g., "The hot ball flies")
- [ ] Verify magic meter updates (should show 9 points, Tier 1)
- [ ] Select spell type (🔥 Projectile)
- [ ] Verify spell preview shows correct info

#### Invoke Button
- [ ] Click Invoke with Tier 1 spell → Should cast Magic Bolt
- [ ] Click Invoke with Tier 2 spell → Should cast Enhanced Projectile
- [ ] Click Invoke with Tier 3 spell → Should cast Power Blast
- [ ] Click Invoke with Tier 4 spell → Should cast Meteor
- [ ] Verify Focus is deducted correctly
- [ ] Verify toast messages appear
- [ ] Verify Grimoire closes after cast

#### Equip Button
- [ ] Assemble sentence and select spell type
- [ ] Click Equip → Should equip spell
- [ ] Verify HUD shows spell name
- [ ] Verify HUD shows correct spell type icon
- [ ] Verify toast message appears
- [ ] Verify Grimoire closes after equip

#### Q Key Quick-Cast
- [ ] Equip a Tier 1 spell
- [ ] Press Q → Should cast spell
- [ ] Verify Focus is deducted
- [ ] Verify spell effect occurs
- [ ] Verify toast message appears
- [ ] Equip a Tier 4 spell
- [ ] Press Q → Should cast more powerful version
- [ ] Try Q with no equipped spell → Should show error

#### All Spell Types
- [ ] **Projectile**: Fires colored projectile, damages enemies
- [ ] **Heal**: Restores HP, blue particles
- [ ] **Break**: Destroys tiles, brown particles
- [ ] **Dash**: Teleports player, purple trail
- [ ] **Control**: Stuns enemies, blue particles

#### All Tiers
- [ ] Tier 1 (6-9 points): Basic spells, 10 Focus
- [ ] Tier 2 (10-12 points): Intermediate spells, 15 Focus
- [ ] Tier 3 (13-15 points): Advanced spells, 20 Focus
- [ ] Tier 4 (16+ points): Master spells, 25 Focus

#### Edge Cases
- [ ] Try to invoke without selecting spell type → Error message
- [ ] Try to invoke with 0 magic points → Error message
- [ ] Try to cast with insufficient Focus → Error message
- [ ] Try to heal at full HP → Rejection message
- [ ] Try to break unbreakable tile → Rejection message
- [ ] Try to dash out of bounds → Rejection message
- [ ] Try to control with no enemies → Rejection message

#### Save/Load
- [ ] Equip a spell
- [ ] Save game
- [ ] Reload page
- [ ] Load game
- [ ] Verify equipped spell persists
- [ ] Verify HUD shows correct spell
- [ ] Press Q → Should cast equipped spell
- [ ] Load old save (if available) → Should migrate gracefully

#### Integration
- [ ] Cast spell during combat
- [ ] Cast spell while moving
- [ ] Cast multiple spells in succession
- [ ] Verify mining still works
- [ ] Verify crafting still works
- [ ] Verify word forging still works
- [ ] Verify Focus regeneration works

---

## Rollback Plan

If issues are discovered:

1. **Immediate Rollback**:
   - Revert changes to `equipSpell()` function
   - Revert changes to Q key handler
   - Restore `SPELLS` object
   - Restore `mapSpell()` function

2. **Partial Rollback**:
   - Keep magic point system for Invoke button
   - Revert Equip button to dictionary system
   - Document as "intentional hybrid" temporarily

3. **Debug and Retry**:
   - Identify specific issue
   - Fix and test in isolation
   - Re-attempt migration

---

## Documentation Updates

### Files to Update

1. **[`Phase_4_Implementation_Complete.md`](Phase_4_Implementation_Complete.md)**
   - Update to reflect magic point system
   - Remove references to dictionary system
   - Update code examples
   - Update testing checklist

2. **[`docs/Syntax_Sorcery_Architecture.md`](../docs/Syntax_Sorcery_Architecture.md)**
   - Add magic point system section
   - Remove dictionary system section
   - Update architecture diagrams

3. **Create New File**: `Phase_4_Migration_Complete.md`
   - Document what was changed
   - Include before/after comparisons
   - Note any breaking changes
   - Provide migration guide for users

### Files to Archive

Rename with `SUPERSEDED_` prefix:
- `SUPERSEDED_Phase_4_Spell_System_Plan.md`
- `SUPERSEDED_Phase_4_Implementation_Complete.md` (old version)

Keep for reference:
- `Phase_4_Revised_Magic_Point_System.md` (design rationale)
- `Phase_4_Magic_Point_Implementation_Plan.md` (implementation guide)
- `Phase_4_Audit_Report.md` (audit findings)
- `Phase_4_Audit_Summary.md` (executive summary)

---

## Success Criteria

Migration is complete when:

- ✅ `equipSpell()` uses magic point system
- ✅ Q key handler uses magic point system
- ✅ All legacy code removed (~400 lines)
- ✅ All tests passing
- ✅ Save/load works with new format
- ✅ Old saves migrate gracefully
- ✅ Documentation updated
- ✅ No console errors
- ✅ Consistent UX between Invoke and Equip

---

## Timeline

### Phase 1: Code Changes (2 hours)
- Update `equipSpell()` function (30 min)
- Update Q key handler (30 min)
- Remove legacy code (30 min)
- Add save/load migration (30 min)

### Phase 2: Testing (1 hour)
- Run through testing checklist (45 min)
- Fix any bugs found (15 min)

### Phase 3: Documentation (1 hour)
- Update existing docs (30 min)
- Create migration complete doc (20 min)
- Archive old docs (10 min)

**Total**: 4 hours

---

## Risk Assessment

### Low Risk Items
- ✅ Magic point system already working for Invoke
- ✅ UI already supports magic point system
- ✅ No changes to game mechanics
- ✅ Easy to rollback if needed

### Medium Risk Items
- ⚠️ Save/load compatibility (mitigated by migration logic)
- ⚠️ Q key handler changes (test thoroughly)
- ⚠️ Removing ~400 lines of code (keep backup)

### High Risk Items
- ❌ None identified

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Get approval** to proceed
3. **Create backup** of current code
4. **Implement Step 1** (equipSpell function)
5. **Test Step 1** before proceeding
6. **Implement Steps 2-6** sequentially
7. **Run full testing checklist**
8. **Update documentation**
9. **Commit changes** with detailed message

---

## Questions Before Starting

- [ ] Is there a preferred branch for this work?
- [ ] Should we create a feature flag for gradual rollout?
- [ ] Are there any known saved games that need special handling?
- [ ] Should we add telemetry to track spell usage?
- [ ] Any concerns about the 4-hour timeline?

---

**Plan Status**: Ready for Implementation  
**Approval Needed**: Yes  
**Estimated Completion**: 4 hours after approval
