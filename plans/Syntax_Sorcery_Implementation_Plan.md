# Syntax Sorcery Implementation Plan
## Branch Strategy & Phased Development

**Project:** WordCraft v5 - Syntax Sorcery Expansion  
**Goal:** Add grammar-based spell system without breaking existing morphology mechanics  
**Strategy:** Feature branches merged to `dev`, then to `main` after testing

---

## Branch Structure

```
main (production)
  └── dev (integration branch)
      ├── feature/lexicon-foundation
      ├── feature/lexicon-ui
      ├── feature/syntax-engine
      ├── feature/spell-system
      ├── feature/grammar-gates
      └── feature/polish-scaling
```

---

## Phase 1: Lexicon Foundation
**Branch:** `feature/lexicon-foundation`  
**Goal:** Capture and store forged words with Part of Speech metadata  
**Risk Level:** LOW - Additive only, no breaking changes

### Tasks

#### Task 1.1: Extend Player Data Structure
- Add `player.lexicon = []` array to store word objects
- Structure: `{ word: string, pos: string, strength: number, timestamp: number }`
- Update save/load serialization to include lexicon
- **Files to modify:**
  - [`index.html`](index.html:528-531) - Player initialization
  - [`index.html`](index.html:1429-1450) - Save/load functions

#### Task 1.2: Modify Word Forge Success Handler
- In [`forgeWord()`](index.html:1199-1336) function, after successful API validation
- Extract `partOfSpeech` from Dictionary API response
- Push `{ word: finalWord, pos: partOfSpeech, strength: 1, timestamp: Date.now() }` to `player.lexicon`
- Handle fallback logic for simple suffixes (s, ed, ing) with basic POS tagging
- **Files to modify:**
  - [`index.html`](index.html:1199-1336) - forgeWord function

#### Task 1.3: Add Visual Notification
- Create toast notification when word is added to Lexicon
- Display: "Added to Lexicon: [word] (noun)"
- Use existing [`showToast()`](index.html:740-744) function
- **Files to modify:**
  - [`index.html`](index.html:1199-1336) - forgeWord success block

#### Task 1.4: Testing Checklist
- [ ] Forge a simple word (e.g., "play") → Check lexicon array
- [ ] Forge word with suffix (e.g., "plays") → Verify POS tagging
- [ ] Save game → Load game → Verify lexicon persists
- [ ] Check that existing gameplay (mining, crafting) still works

**Merge Criteria:** All tests pass, no regression in existing features

---

## Phase 2: Lexicon UI
**Branch:** `feature/lexicon-ui`  
**Parent:** `dev` (after Phase 1 merged)  
**Goal:** Display captured words in a browsable inventory  
**Risk Level:** LOW - Pure UI addition

### Tasks

#### Task 2.1: Add Lexicon Tab to Inventory
- Add new tab "Lexicon" to [`#screen-inv`](index.html:285-385) alongside "Word Forge", "Salvage", "Craft"
- Update [`switchTab()`](index.html:1076-1080) function to handle 'lexicon' case
- **Files to modify:**
  - [`index.html`](index.html:287-291) - Add tab button
  - [`index.html`](index.html:1076-1080) - Tab switching logic

#### Task 2.2: Create Lexicon Display Zones
- Create `<div id="tab-lexicon">` with three sections:
  - Nouns section
  - Verbs section  
  - Adjectives section
- Use accordion or card-based layout
- **Files to modify:**
  - [`index.html`](index.html:301-379) - Add new tab content area

#### Task 2.3: Implement Render Function
- Create `renderLexiconUI()` function
- Iterate over `player.lexicon` array
- Group words by `pos` property
- Display as draggable chips (similar to existing word chips)
- Show word count per category
- **Files to modify:**
  - [`index.html`](index.html:1082-1095) - Add new render function

#### Task 2.4: Style Lexicon Chips
- Create CSS classes for POS-specific chips:
  - `.lex-noun` (green theme)
  - `.lex-verb` (red theme)
  - `.lex-adj` (blue theme)
  - `.lex-adv` (purple theme)
- Make chips draggable (prepare for Phase 3)
- **Files to modify:**
  - [`index.html`](index.html:7-191) - Add CSS styles

#### Task 2.5: Testing Checklist
- [ ] Open Inventory → Click Lexicon tab → See categorized words
- [ ] Forge 5 different words → Verify they appear in correct categories
- [ ] Check mobile responsiveness
- [ ] Verify tab switching doesn't break other tabs

**Merge Criteria:** UI displays correctly on desktop and mobile, no visual bugs

---

## Phase 3: Syntax Engine & UI
**Branch:** `feature/syntax-engine`  
**Parent:** `dev` (after Phase 2 merged)  
**Goal:** Build sentence assembly interface and validation logic  
**Risk Level:** MEDIUM - New complex UI interactions

### Tasks

#### Task 3.1: Create Syntax Grimoire UI Layer
- Add new popup `<div id="screen-syntax" class="popup">`
- Create sentence structure slots: `[Adjective] [Noun] [Verb]`
- Add "Invoke Spell" button (initially disabled)
- Add "Clear" button to reset slots
- **Files to modify:**
  - [`index.html`](index.html:229-386) - Add new popup overlay

#### Task 3.2: Implement Drag & Drop System
- Make lexicon chips draggable (HTML5 drag API or touch-friendly alternative)
- Make syntax slots droppable
- Visual feedback during drag (highlight valid drop zones)
- Store current sentence in `player.currentSpell = { adj: null, noun: null, verb: null }`
- **Files to modify:**
  - [`index.html`](index.html:390-1480) - Add drag/drop handlers

#### Task 3.3: Build Validation Engine
- Create `validateSentence(adj, noun, verb)` function
- Check if slots contain words with correct POS
- Return `{ valid: boolean, error: string }`
- Enable "Invoke Spell" button only when valid
- **Files to modify:**
  - [`index.html`](index.html:390-1480) - Add validation logic

#### Task 3.4: Add Syntax Grimoire Access
- Add button/hotkey to open Syntax Grimoire (e.g., "G" key)
- Add mobile control button for Syntax Grimoire
- Ensure it can be opened from inventory or during gameplay
- **Files to modify:**
  - [`index.html`](index.html:685-694) - Add keydown handler
  - [`index.html`](index.html:127-169) - Add mobile button

#### Task 3.5: Testing Checklist
- [ ] Open Syntax Grimoire → See empty slots
- [ ] Drag noun to noun slot → Success
- [ ] Drag noun to verb slot → Rejection/error
- [ ] Fill all slots correctly → "Invoke" button enables
- [ ] Clear slots → Button disables again
- [ ] Test on mobile with touch controls

**Merge Criteria:** Drag/drop works smoothly, validation is accurate, no UI glitches

---

## Phase 4: Spell Execution System
**Branch:** `feature/spell-system`  
**Parent:** `dev` (after Phase 3 merged)  
**Goal:** Map valid sentences to game actions  
**Risk Level:** MEDIUM - Integrates with existing game mechanics

### Tasks

#### Task 4.1: Create Spell Dictionary
- Define `SPELL_DICTIONARY` object mapping patterns to functions
- Support generic patterns: `{ pattern: "any_adj + noun:arrow + any_verb", spellId: "enhanced_arrow" }`
- Support specific words: `{ pattern: "quick + arrow + flies", spellId: "rapid_shot" }`
- Start with 3-5 basic spells
- **Files to modify:**
  - [`index.html`](index.html:390-1480) - Add spell dictionary constant

#### Task 4.2: Implement Spell Mapping Logic
- Create `mapSentenceToSpell(adj, noun, verb)` function
- Check specific matches first, then generic patterns
- Return spell object: `{ id: string, name: string, execute: function, focusCost: number }`
- **Files to modify:**
  - [`index.html`](index.html:390-1480) - Add mapping function

#### Task 4.3: Create Spell Execution Functions
- Implement at least 3 distinct spells:
  1. **Projectile Spell** (e.g., "hot ball throw") - Fire enhanced projectile
  2. **Healing Spell** (e.g., "gentle rain falls") - Restore HP
  3. **Mining Spell** (e.g., "sharp tool breaks") - Remove tile block
- Each spell consumes Focus points
- Add visual effects (particles, sounds)
- **Files to modify:**
  - [`index.html`](index.html:390-1480) - Add spell functions

#### Task 4.4: Connect Invoke Button
- Wire "Invoke Spell" button to execute mapped spell
- Deduct Focus cost
- Show spell effect in game world
- Display feedback message
- Optionally consume or "charge" the words used
- **Files to modify:**
  - [`index.html`](index.html:390-1480) - Button onclick handler

#### Task 4.5: Add Active Spell System
- Allow player to "equip" a spell for quick use
- Add hotkey (e.g., "Q") to cast equipped spell
- Display equipped spell in HUD
- **Files to modify:**
  - [`index.html`](index.html:197-202) - Add HUD element
  - [`index.html`](index.html:685-694) - Add hotkey handler

#### Task 4.6: Testing Checklist
- [ ] Assemble valid sentence → Invoke → Spell executes
- [ ] Check Focus is consumed correctly
- [ ] Test each spell type (projectile, heal, mining)
- [ ] Verify spell effects are visible
- [ ] Test hotkey casting
- [ ] Ensure spells don't break existing combat/mining

**Merge Criteria:** All spells work as intended, Focus system integrates cleanly

---

## Phase 5: Grammar Gates
**Branch:** `feature/grammar-gates`  
**Parent:** `dev` (after Phase 4 merged)  
**Goal:** Add environmental puzzles requiring syntax  
**Risk Level:** LOW - Isolated feature addition

### Tasks

#### Task 5.1: Define Grammar Gate Tile Type
- Add new tile ID (e.g., `20`) for "Grammar Inscription"
- Create visual representation (glowing rune, magical barrier)
- Add to tile rendering logic
- **Files to modify:**
  - [`index.html`](index.html:948-1054) - Draw function
  - [`index.html`](index.html:542-585) - Grid initialization (for testing)

#### Task 5.2: Create Grammar Gate Data Structure
- Define gate requirements: `{ tileId: 20, requirement: { pos: "adverb", hint: "This door demands speed" } }`
- Store active gates in `player.grammarGates = []`
- **Files to modify:**
  - [`index.html`](index.html:528-531) - Player initialization

#### Task 5.3: Implement Interaction Logic
- Update [`interact()`](index.html:751-755) function
- When player presses Space near tile ID 20, open specialized Syntax UI
- Display hint: "This door demands: [Adverb] + [Verb]"
- Validate submitted sentence against requirement
- Remove tile block on success
- **Files to modify:**
  - [`index.html`](index.html:751-755) - Interact function
  - [`index.html`](index.html:797-933) - Action function

#### Task 5.4: Place Grammar Gates in World
- Add 2-3 Grammar Gates to existing map
- Place them blocking access to valuable resources or areas
- Vary requirements (noun-only, verb-only, full sentence)
- **Files to modify:**
  - [`index.html`](index.html:542-585) - Grid generation

#### Task 5.5: Testing Checklist
- [ ] Approach Grammar Gate → See interaction prompt
- [ ] Submit wrong POS → Rejection message
- [ ] Submit correct POS → Gate opens
- [ ] Verify gate removal persists in save/load
- [ ] Test multiple gate types

**Merge Criteria:** Gates work correctly, provide clear feedback, integrate with world

---

## Phase 6: Polish & Scaling
**Branch:** `feature/polish-scaling`  
**Parent:** `dev` (after Phase 5 merged)  
**Goal:** Refine UX, add content, optimize  
**Risk Level:** LOW - Improvements only

### Tasks

#### Task 6.1: Expand Spell Dictionary
- Add 10+ more spell patterns
- Support synonym detection (e.g., "quick" = "fast" = "rapid")
- Add combo spells (more complex patterns)
- **Files to modify:**
  - [`index.html`](index.html:390-1480) - Spell dictionary

#### Task 6.2: Mobile UI Optimization
- Ensure Syntax Grimoire works smoothly on mobile
- Optimize drag/drop for touch
- Add tutorial tooltips
- **Files to modify:**
  - [`index.html`](index.html:127-169) - Mobile controls
  - [`index.html`](index.html:697-739) - Touch handlers

#### Task 6.3: Add Tutorial/Help System
- Create in-game tutorial for Syntax Sorcery
- Add NPC that explains grammar mechanics
- Add help overlay showing available spells
- **Files to modify:**
  - [`index.html`](index.html:511-524) - Add tutorial NPC

#### Task 6.4: Performance Testing
- Test with 50+ words in lexicon
- Optimize rendering if needed
- Check save file size
- **Files to modify:**
  - Various optimization tweaks as needed

#### Task 6.5: End-to-End Testing
- [ ] Complete full gameplay loop: Forge → Lexicon → Assemble → Cast → Gate
- [ ] Test all spells in various scenarios
- [ ] Verify save/load with full lexicon
- [ ] Mobile testing on real devices
- [ ] Check for memory leaks (long play sessions)

**Merge Criteria:** Smooth UX, no performance issues, comprehensive testing complete

---

## Integration & Deployment Strategy

### Merge Order
1. `feature/lexicon-foundation` → `dev`
2. `feature/lexicon-ui` → `dev`
3. `feature/syntax-engine` → `dev`
4. `feature/spell-system` → `dev`
5. `feature/grammar-gates` → `dev`
6. `feature/polish-scaling` → `dev`
7. `dev` → `main` (after full QA)

### Testing Gates
Each phase must pass:
- ✅ Unit tests (manual verification)
- ✅ Integration tests (works with existing features)
- ✅ Regression tests (doesn't break original game)
- ✅ Mobile compatibility check

### Rollback Plan
- Each feature branch is independent
- If a phase fails, revert that branch only
- `dev` branch always maintains working state
- `main` branch only receives fully tested code

---

## Risk Mitigation

### High-Risk Areas
1. **Drag & Drop on Mobile** - Fallback to click-based selection
2. **Save File Compatibility** - Version migration logic
3. **Performance with Large Lexicon** - Pagination or filtering

### Safeguards
- Never modify existing `player` properties directly (only add new ones)
- All new features behind feature flags initially
- Extensive logging for debugging
- Beta testing phase before main merge

---

## Data Structure Changes Summary

### Phase 1: Player Object Extension
```javascript
player = {
  // ... existing properties ...
  lexicon: [
    { word: "running", pos: "verb", strength: 1, timestamp: 1234567890 },
    { word: "quick", pos: "adjective", strength: 1, timestamp: 1234567891 }
  ]
}
```

### Phase 3: Current Spell State
```javascript
player = {
  // ... existing properties ...
  currentSpell: {
    adj: { word: "quick", pos: "adjective" },
    noun: { word: "arrow", pos: "noun" },
    verb: { word: "flies", pos: "verb" }
  },
  equippedSpell: "rapid_shot"
}
```

### Phase 5: Grammar Gates
```javascript
player = {
  // ... existing properties ...
  grammarGates: [
    { x: 30, y: 15, requirement: { pos: "adverb", hint: "Speed is key" }, solved: false }
  ]
}
```

---

## Estimated Complexity

| Phase | Tasks | Complexity | Lines of Code | Testing Time |
|-------|-------|------------|---------------|--------------|
| 1 | 4 | Low | ~50 | 1 hour |
| 2 | 5 | Low | ~150 | 2 hours |
| 3 | 5 | Medium | ~300 | 4 hours |
| 4 | 6 | Medium | ~400 | 4 hours |
| 5 | 5 | Low | ~200 | 2 hours |
| 6 | 5 | Low | ~150 | 3 hours |
| **Total** | **30** | **Mixed** | **~1250** | **16 hours** |

---

## Success Criteria

### Phase Completion
- ✅ All tasks completed
- ✅ All tests passing
- ✅ Code reviewed
- ✅ Merged to `dev`

### Project Completion
- ✅ All 6 phases merged
- ✅ Full integration testing passed
- ✅ No regression in original features
- ✅ Mobile compatibility verified
- ✅ Documentation updated
- ✅ Merged to `main`

---

## Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Set up branches** - Create feature branches from `dev`
3. **Begin Phase 1** - Start with lexicon foundation
4. **Iterate** - Complete phases sequentially with testing between each

**Ready to proceed?** Let me know if you'd like to adjust any phase or if you're ready to start implementation!
