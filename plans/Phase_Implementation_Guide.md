# Syntax Sorcery - Phase Implementation Guide
## Option 3: Hybrid Architecture

**Selected Strategy:** Expansion module in separate file  
**Core Game:** Remains in [`index.html`](../index.html)  
**Expansion Code:** New file `js/syntax-sorcery.js`

---

## Phase 0: Project Setup (Do This First)

### Branch Setup
```bash
# Create dev branch from main
git checkout -b dev

# Create feature branch for setup
git checkout -b feature/syntax-setup
```

### File Structure Creation
```
Wordquest/
├── index.html (existing - minimal changes)
├── js/
│   └── syntax-sorcery.js (NEW - all expansion code)
├── assets/ (existing)
└── docs/
    └── plans/ (existing)
```

### Task 0.1: Create Module File
**File:** `js/syntax-sorcery.js`

**Content Structure:**
```javascript
/**
 * SYNTAX SORCERY EXPANSION MODULE
 * WordCraft v5 - Grammar & Sentence Construction
 * 
 * This module extends WordCraft with:
 * - Lexicon system (word storage with POS)
 * - Syntax Grimoire (sentence assembly UI)
 * - Spell Engine (grammar-based abilities)
 * - Grammar Gates (environmental puzzles)
 */

const SyntaxSorcery = (function() {
  'use strict';
  
  // ============================================
  // MODULE STATE
  // ============================================
  
  const state = {
    initialized: false,
    currentSpell: { adj: null, noun: null, verb: null },
    equippedSpell: null
  };
  
  // ============================================
  // PHASE 1: LEXICON SYSTEM
  // ============================================
  
  const Lexicon = {
    init() {
      console.log('[Syntax Sorcery] Lexicon initialized');
    },
    
    addWord(word, pos, strength = 1) {
      // Implementation in Phase 1
    },
    
    getWords() {
      // Implementation in Phase 1
    },
    
    render() {
      // Implementation in Phase 2
    }
  };
  
  // ============================================
  // PHASE 3: SYNTAX ENGINE
  // ============================================
  
  const SyntaxEngine = {
    init() {
      console.log('[Syntax Sorcery] Syntax Engine initialized');
    },
    
    validateSentence(adj, noun, verb) {
      // Implementation in Phase 3
    },
    
    openGrimoire() {
      // Implementation in Phase 3
    }
  };
  
  // ============================================
  // PHASE 4: SPELL SYSTEM
  // ============================================
  
  const SpellSystem = {
    init() {
      console.log('[Syntax Sorcery] Spell System initialized');
    },
    
    mapSpell(sentence) {
      // Implementation in Phase 4
    },
    
    executeSpell(spellId) {
      // Implementation in Phase 4
    }
  };
  
  // ============================================
  // PHASE 5: GRAMMAR GATES
  // ============================================
  
  const GrammarGates = {
    init() {
      console.log('[Syntax Sorcery] Grammar Gates initialized');
    },
    
    interact(x, y) {
      // Implementation in Phase 5
    },
    
    checkRequirement(gate, sentence) {
      // Implementation in Phase 5
    }
  };
  
  // ============================================
  // PUBLIC API
  // ============================================
  
  return {
    init() {
      if (state.initialized) return;
      
      console.log('[Syntax Sorcery] Initializing expansion...');
      
      Lexicon.init();
      SyntaxEngine.init();
      SpellSystem.init();
      GrammarGates.init();
      
      state.initialized = true;
      console.log('[Syntax Sorcery] Expansion ready!');
    },
    
    // Expose subsystems
    lexicon: Lexicon,
    syntax: SyntaxEngine,
    spells: SpellSystem,
    gates: GrammarGates,
    
    // Utility
    isEnabled() {
      return state.initialized;
    }
  };
})();

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  window.SyntaxSorcery = SyntaxSorcery;
  console.log('[Syntax Sorcery] Module loaded');
}
```

### Task 0.2: Integrate Module into index.html
**File:** [`index.html`](../index.html)

**Add before closing `</body>` tag (around line 1478):**
```html
<!-- SYNTAX SORCERY EXPANSION MODULE -->
<script src="js/syntax-sorcery.js"></script>
<script>
    // Initialize expansion after game loads
    if (window.SyntaxSorcery) {
        SyntaxSorcery.init();
    }
</script>
</body>
```

### Task 0.3: Test Setup
**Verification Steps:**
1. Open game in browser
2. Open browser console (F12)
3. Check for messages:
   - `[Syntax Sorcery] Module loaded`
   - `[Syntax Sorcery] Initializing expansion...`
   - `[Syntax Sorcery] Lexicon initialized`
   - `[Syntax Sorcery] Expansion ready!`
4. Verify game still works normally
5. Type in console: `SyntaxSorcery.isEnabled()` → should return `true`

### Task 0.4: Commit Setup
```bash
git add js/syntax-sorcery.js
git add index.html
git commit -m "feat: Add Syntax Sorcery expansion module structure"
git push origin feature/syntax-setup

# Merge to dev
git checkout dev
git merge feature/syntax-setup
git push origin dev
```

---

## Phase 1: Lexicon Foundation

### Branch Setup
```bash
git checkout dev
git checkout -b feature/lexicon-foundation
```

### Integration Points in index.html

#### Integration 1.1: Extend Player Object
**Location:** Line ~528 in [`index.html`](../index.html)

**Find:**
```javascript
let player={ 
    x:20, y:10, hp:3, maxHp:3, focus:100, maxFocus:100, fragments:0, 
    tool: "hand", toolHp: 0,
    resources:{dirt:0,sand:0,stone:0,wood:0,obsidian:0},
    roots:[], affixes:[], artifacts:[], 
    // ... rest of properties
};
```

**Add after line 531:**
```javascript
    // SYNTAX SORCERY: Lexicon storage
    lexicon: [],
```

#### Integration 1.2: Hook into forgeWord() Success
**Location:** Line ~1306 in [`index.html`](../index.html)

**Find the success block in forgeWord() after:**
```javascript
// === SUCCESS! ===
```

**Add before consumeItems():**
```javascript
            // SYNTAX SORCERY: Add to lexicon
            if (window.SyntaxSorcery) {
                SyntaxSorcery.lexicon.addWord(finalWord, partOfSpeech);
            }
```

#### Integration 1.3: Save/Load Support
**Location:** Line ~1433 in [`index.html`](../index.html)

**In doSave() function, the lexicon is already included in player object, no changes needed.**

**In loadSaveSlot() function (line ~1439), add after line 1448:**
```javascript
            // SYNTAX SORCERY: Ensure lexicon exists
            if (!player.lexicon) player.lexicon = [];
```

### Implementation in js/syntax-sorcery.js

**Replace Lexicon object with:**
```javascript
  const Lexicon = {
    init() {
      console.log('[Syntax Sorcery] Lexicon initialized');
      // Ensure player has lexicon array
      if (typeof window.player !== 'undefined' && !window.player.lexicon) {
        window.player.lexicon = [];
      }
    },
    
    addWord(word, pos, strength = 1) {
      if (!window.player || !window.player.lexicon) {
        console.error('[Lexicon] Player object not ready');
        return false;
      }
      
      // Check if word already exists
      const existing = window.player.lexicon.find(w => w.word === word);
      if (existing) {
        existing.strength += 1;
        console.log(`[Lexicon] Strengthened: ${word} (${pos}) - Strength: ${existing.strength}`);
        return false;
      }
      
      // Add new word
      const wordObj = {
        word: word,
        pos: pos,
        strength: strength,
        timestamp: Date.now()
      };
      
      window.player.lexicon.push(wordObj);
    le.log(`[Lexicon] Added: ${word} (${pos})`);
      
      // Show toast notification
      if (typeof window.showToast === 'function') {
        window.showToast(`📖 Added to Lexicon: ${word} (${pos})`, 'good');
      }
      
      return true;
    },
    
    getWords(posFilter = null) {
      if (!window.player || !window.player.lexicon) return [];
      
      if (posFilter) {
        return window.player.lexicon.filter(w => w.pos === posFilter);
      }
      
      return window.player.lexicon;
    },
    
    getWordsByCategory() {
      const words = this.getWords();
      return {
        nouns: words.filter(w => w.pos === 'noun'),
        verbs: words.filter(w => w.pos === 'verb'),
        adjectives: words.filter(w => w.pos === 'adjective'),
        adverbs: words.filter(w => w.pos === 'adverb'),
        other: words.filter(w => !['noun','verb','adjective','adverb'].includes(w.pos))
      };
    },
    
    render() {
      // Implementation in Phase 2
      console.log('[Lexicon] Render called (Phase 2)');
    }
  };
```

### Testing Phase 1
```bash
# Test checklist:
# [ ] Forge word "play" → Check console for "[Lexicon] Added: play (verb)"
# [ ] Check toast notification appears
# [ ] Forge "plays" → Should add to lexicon
# [ ] Open browser console: player.lexicon → Should show array with words
# [ ] Save game → Reload → Load game → Check lexicon persists
# [ ] Forge same word twice → Should strengthen, not duplicate
```

### Commit Phase 1
```bash
git add js/syntax-sorcery.js
git add index.html
git commit -m "feat(lexicon): Implement word storage with POS metadata"
git push origin feature/lexicon-foundation

# Merge to dev
git checkout dev
git merge feature/lexicon-foundation
git push origin dev
```

---

## Phase 2: Lexicon UI

### Branch Setup
```bash
git checkout dev
git checkout -b feature/lexicon-ui
```

### Integration Points in index.html

#### Integration 2.1: Add Lexicon Tab
**Location:** Line ~287 in [`index.html`](../index.html)

**Find:**
```html
<div class="forge-tabs">
    <div class="tab active" onclick="switchTab('word')">Word Forge</div>
    <div class="tab" onclick="switchTab('salvage')">Salvage</div>
    <div class="tab" onclick="switchTab('craft')">Craft</div>
</div>
```

**Replace with:**
```html
<div class="forge-tabs">
    <div class="tab active" onclick="switchTab('word')">Word Forge</div>
    <div class="tab" onclick="switchTab('salvage')">Salvage</div>
    <div class="tab" onclick="switchTab('craft')">Craft</div>
    <div class="tab" onclick="switchTab('lexicon')">📖 Lexicon</div>
</div>
```

#### Integration 2.2: Add Lexicon Tab Content
**Location:** After line ~378 in [`index.html`](../index.html) (after craft tab closes)

**Add:**
```html
                    <div id="tab-lexicon" style="display:none; flex-direction:column;">
                        <div style="text-align:center; margin-bottom:15px;">
                            <h3 style="margin:0; color:#5d4037;">📖 Your Lexicon</h3>
                            <p style="font-size:13px; margin:5px 0; color:#666;">Words you've forged, organized by grammar</p>
                        </div>
                        <div id="lexicon-container" style="flex:1; overflow-y:auto;">
                            <!-- Rendered by SyntaxSorcery.lexicon.render() -->
                        </div>
                    </div>
```

#### Integration 2.3: Update switchTab Function
**Location:** Line ~1076 in [`index.html`](../index.html)

**Find:**
```javascript
function switchTab(t) { 
    document.getElementById('tab-word').style.display=t==='word'?'flex':'none'; 
    document.getElementById('tab-craft').style.display=t==='craft'?'flex':'none'; 
    document.getElementById('tab-salvage').style.display=t==='salvage'?'flex':'none'; 
    if(t==='salvage') renderSalvage(); else renderInventory(); 
    document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active')); 
    event.target.classList.add('active'); 
}
```

**Replace with:**
```javascript
function switchTab(t) { 
    document.getElementById('tab-word').style.display=t==='word'?'flex':'none'; 
    document.getElementById('tab-craft').style.display=t==='craft'?'flex':'none'; 
    document.getElementById('tab-salvage').style.display=t==='salvage'?'flex':'none'; 
    
    // SYNTAX SORCERY: Lexicon tab
    const lexTab = document.getElementById('tab-lexicon');
    if (lexTab) {
        lexTab.style.display = t==='lexicon'?'flex':'none';
        if (t==='lexicon' && window.SyntaxSorcery) {
            SyntaxSorcery.lexicon.render();
        }
    }
    
    if(t==='salvage') renderSalvage(); 
    else if(t!=='lexicon') renderInventory(); 
    
    document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active')); 
    event.target.classList.add('active'); 
}
```

#### Integration 2.4: Add CSS Styles
**Location:** Line ~89 in [`index.html`](../index.html) (after existing chip styles)

**Add:**
```css
        /* SYNTAX SORCERY: Lexicon Styles */
        .lex-category { margin-bottom: 20px; background: rgba(255,255,255,0.6); padding: 15px; border-radius: 8px; }
        .lex-category-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; padding: 8px; border-radius: 4px; }
        .lex-noun-title { background: #c8e6c9; color: #1b5e20; }
        .lex-verb-title { background: #ffcdd2; color: #b71c1c; }
        .lex-adj-title { background: #bbdefb; color: #0d47a1; }
        .lex-adv-title { background: #e1bee7; color: #4a148c; }
        
        .lex-word-chip { 
            display: inline-block; margin: 5px; padding: 8px 16px; border-radius: 20px; 
            font-size: 14px; font-weight: bold; cursor: pointer; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s;
            border: 2px solid;
        }
        .lex-word-chip:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
        .lex-noun { background: #c8e6c9; border-color: #2e7d32; color: #1b5e20; }
        .lex-verb { background: #ffcdd2; border-color: #c62828; color: #b71c1c; }
        .lex-adj { background: #bbdefb; border-color: #1565c0; color: #0d47a1; }
        .lex-adv { background: #e1bee7; border-color: #7b1fa2; color: #4a148c; }
        
        .lex-empty { text-align: center; padding: 40px; color: #999; font-style: italic; }
```

### Implementation in js/syntax-sorcery.js

**Replace Lexicon.render() with:**
```javascript
    render() {
      const container = document.getElementById('lexicon-container');
      if (!container) {
        console.warn('[Lexicon] Container not found');
        return;
      }
      
      const categories = this.getWordsByCategory();
      const totalWords = window.player.lexicon.length;
      
      if (totalWords === 0) {
        container.innerHTML = '<div class="lex-empty">Your lexicon is empty.<br>Forge words to fill it!</div>';
        return;
      }
      
      let html = '';
      
      // Nouns
      if (categories.nouns.length > 0) {
        html += '<div class="lex-category">';
        html += `<div class="lex-category-title lex-noun-title">📦 Nouns (${categories.nouns.length})</div>`;
        categories.nouns.forEach(w => {
          html += `<div class="lex-word-chip lex-noun" title="Strength: ${w.strength}">${w.word}</div>`;
        });
        html += '</div>';
      }
      
      // Verbs
      if (categories.verbs.length > 0) {
        html += '<div class="lex-category">';
        html += `<div class="lex-category-title lex-verb-title">⚡ Verbs (${categories.verbs.length})</div>`;
        categories.verbs.forEach(w => {
          html += `<div class="lex-word-chip lex-verb" title="Strength: ${w.strength}">${w.word}</div>`;
        });
        html += '</div>';
      }
      
      // Adjectives
      if (categories.adjectives.length > 0) {
        html += '<div class="lex-category">';
        html += `<div class="lex-category-title lex-adj-title">✨ Adjectives (${categories.adjectives.length})</div>`;
        categories.adjectives.forEach(w => {
          html += `<div class="lex-word-chip lex-adj" title="Strength: ${w.strength}">${w.word}</div>`;
        });
        html += '</div>';
      }
      
      // Adverbs
      if (categories.adverbs.length > 0) {
        html += '<div class="lex-category">';
        html += `<div class="lex-category-title lex-adv-title">🌟 Adverbs (${categories.adverbs.length})</div>`;
        categories.adverbs.forEach(w => {
          html += `<div class="lex-word-chip lex-adv" title="Strength: ${w.strength}">${w.word}</div>`;
        });
        html += '</div>';
      }
      
      // Other
      if (categories.other.length > 0) {
        html += '<div class="lex-category">';
        html += `<div class="lex-category-title" style="background:#e0e0e0;">📝 Other (${categories.other.length})</div>`;
        categories.other.forEach(w => {
          html += `<div class="lex-word-chip" style="background:#f5f5f5; border-color:#999; color:#333;" title="Strength: ${w.strength}">${w.word} (${w.pos})</div>`;
        });
        html += '</div>';
      }
      
      container.innerHTML = html;
      console.log(`[Lexicon] Rendered ${totalWords} words`);
    }
```

### Testing Phase 2
```bash
# Test checklist:
# [ ] Open Inventory → See "📖 Lexicon" tab
# [ ] Click Lexicon tab → See categorized words
# [ ] Forge 3 nouns, 2 verbs, 2 adjectives
# [ ] Check they appear in correct categories
# [ ] Hover over word → See strength tooltip
# [ ] Test on mobile → Verify responsive layout
# [ ] Switch between tabs → No visual glitches
```

### Commit Phase 2
```bash
git add js/syntax-sorcery.js
git add index.html
git commit -m "feat(lexicon): Add UI for browsing categorized words"
git push origin feature/lexicon-ui

# Merge to dev
git checkout dev
git merge feature/lexicon-ui
git push origin dev
```

---

## Phases 3-6: Continuation

The remaining phases follow the same pattern:
1. Create feature branch from `dev`
2. Add integration points to [`index.html`](../index.html)
3. Implement functionality in `js/syntax-sorcery.js`
4. Test thoroughly
5. Commit and merge to `dev`

Detailed implementation for Phases 3-6 will be provided as you complete each phase.

---

## Quick Reference: Integration Pattern

### In index.html (minimal changes)
```javascript
// Hook into existing functions
if (window.SyntaxSorcery) {
    SyntaxSorcery.subsystem.method();
}
```

### In js/syntax-sorcery.js (all expansion code)
```javascript
const SyntaxSorcery = (function() {
    // All new functionality here
    // Access game state via window.player
    // Call game functions via window.functionName()
})();
```

This keeps your original code clean while allowing the expansion to integrate seamlessly.
