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
      // Ensure player has lexicon array (for backward compatibility with old saves)
      if (typeof window.player !== 'undefined') {
        if (!window.player.lexicon) {
          window.player.lexicon = [];
          console.log('[Lexicon] Initialized empty lexicon array for old save');
        }
      } else {
        console.warn('[Lexicon] Player object not found during init');
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
      console.log(`[Lexicon] Added: ${word} (${pos})`);
      
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
      const container = document.getElementById('lexicon-container');
      if (!container) {
        console.warn('[Lexicon] Container not found');
        return;
      }
      
      // Ensure lexicon exists
      if (!window.player || !window.player.lexicon) {
        console.warn('[Lexicon] Player lexicon not initialized');
        container.innerHTML = '<div class="lex-empty">Lexicon not ready. Please start a new game.</div>';
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
  };
  
  // ============================================
  // PHASE 3: SYNTAX ENGINE
  // ============================================
  
  const SyntaxEngine = {
    init() {
      console.log('[Syntax Sorcery] Syntax Engine initialized');
      this.setupDragAndDrop();
    },
    
    openGrimoire() {
      console.log('[Syntax Engine] Opening Grimoire');
      
      // Show the popup
      const popup = document.getElementById('screen-syntax');
      if (!popup) {
        console.error('[Syntax Engine] Grimoire popup not found');
        return;
      }
      
      popup.classList.add('active');
      
      // Render word picker
      this.renderWordPicker();
      
      // Reset slots
      this.clearAllSlots();
      
      // Update invoke button state
      this.updateInvokeButton();
    },
    
    closeGrimoire() {
      const popup = document.getElementById('screen-syntax');
      if (popup) {
        popup.classList.remove('active');
      }
      console.log('[Syntax Engine] Grimoire closed');
    },
    
    renderWordPicker() {
      const container = document.getElementById('grimoire-word-list');
      if (!container) {
        console.warn('[Syntax Engine] Word list container not found');
        return;
      }
      
      if (!window.player || !window.player.lexicon || window.player.lexicon.length === 0) {
        container.innerHTML = '<div style="color:#999; font-style:italic; padding:20px;">Your lexicon is empty. Forge words first!</div>';
        return;
      }
      
      const categories = Lexicon.getWordsByCategory();
      let html = '';
      
      // Render each category
      ['adjectives', 'nouns', 'verbs', 'adverbs'].forEach(category => {
        const words = categories[category];
        if (words.length > 0) {
          words.forEach(w => {
            const colorClass = w.pos === 'noun' ? 'lex-noun' :
                             w.pos === 'verb' ? 'lex-verb' :
                             w.pos === 'adjective' ? 'lex-adj' : 'lex-adv';
            html += `<div class="draggable-word ${colorClass}" draggable="true" data-word="${w.word}" data-pos="${w.pos}">${w.word}</div>`;
          });
        }
      });
      
      container.innerHTML = html;
      console.log(`[Syntax Engine] Rendered ${window.player.lexicon.length} words in picker`);
    },
    
    setupDragAndDrop() {
      console.log('[Syntax Engine] Setting up drag & drop');
      
      // Use event delegation for draggable words (they're dynamically created)
      document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('draggable-word')) {
          e.target.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('text/plain', JSON.stringify({
            word: e.target.dataset.word,
            pos: e.target.dataset.pos
          }));
        }
      });
      
      document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('draggable-word')) {
          e.target.classList.remove('dragging');
        }
      });
      
      // Setup drop zones
      const slots = document.querySelectorAll('.syntax-slot');
      slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          slot.classList.add('drag-over');
        });
        
        slot.addEventListener('dragleave', (e) => {
          slot.classList.remove('drag-over');
        });
        
        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          slot.classList.remove('drag-over');
          
          try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const slotPos = slot.dataset.pos;
            
            // Validate POS match
            if (data.pos === slotPos) {
              this.fillSlot(slot.id.replace('slot-', ''), data.word, data.pos);
            } else {
              if (typeof window.showToast === 'function') {
                window.showToast(`❌ Wrong type! Need ${slotPos}, got ${data.pos}`, 'warn');
              }
            }
          } catch (err) {
            console.error('[Syntax Engine] Drop error:', err);
          }
        });
      });
    },
    
    fillSlot(slotType, word, pos) {
      const slot = document.getElementById(`slot-${slotType}`);
      const wordDisplay = document.getElementById(`word-${slotType}`);
      
      if (!slot || !wordDisplay) return;
      
      // Update UI
      slot.classList.add('filled');
      wordDisplay.textContent = word;
      
      // Update state
      if (!state.currentSpell) {
        state.currentSpell = { adj: null, noun: null, verb: null };
      }
      state.currentSpell[slotType] = { word, pos };
      
      console.log(`[Syntax Engine] Filled ${slotType} slot with "${word}"`);
      
      // Update invoke button
      this.updateInvokeButton();
    },
    
    clearSlot(slotType) {
      const slot = document.getElementById(`slot-${slotType}`);
      const wordDisplay = document.getElementById(`word-${slotType}`);
      
      if (!slot || !wordDisplay) return;
      
      // Update UI
      slot.classList.remove('filled');
      wordDisplay.textContent = '';
      
      // Update state
      if (state.currentSpell) {
        state.currentSpell[slotType] = null;
      }
      
      console.log(`[Syntax Engine] Cleared ${slotType} slot`);
      
      // Update invoke button
      this.updateInvokeButton();
    },
    
    clearAllSlots() {
      ['adj', 'noun', 'verb'].forEach(type => this.clearSlot(type));
      state.currentSpell = { adj: null, noun: null, verb: null };
    },
    
    validateSentence() {
      if (!state.currentSpell) {
        return { valid: false, error: 'No spell assembled' };
      }
      
      const { adj, noun, verb } = state.currentSpell;
      
      // Check if all slots are filled
      if (!adj || !noun || !verb) {
        return { valid: false, error: 'All slots must be filled' };
      }
      
      // Check POS correctness (should already be enforced by drag/drop)
      if (adj.pos !== 'adjective') {
        return { valid: false, error: 'First slot must be an adjective' };
      }
      if (noun.pos !== 'noun') {
        return { valid: false, error: 'Second slot must be a noun' };
      }
      if (verb.pos !== 'verb') {
        return { valid: false, error: 'Third slot must be a verb' };
      }
      
      return { valid: true, sentence: `${adj.word} ${noun.word} ${verb.word}` };
    },
    
    updateInvokeButton() {
      const btn = document.getElementById('btn-invoke');
      if (!btn) return;
      
      const validation = this.validateSentence();
      btn.disabled = !validation.valid;
      
      if (validation.valid) {
        console.log(`[Syntax Engine] Valid spell: "${validation.sentence}"`);
      }
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
      return null;
    },
    
    executeSpell(spellId) {
      // Implementation in Phase 4
      console.log('[Spell System] Executing spell (Phase 4):', spellId);
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
      console.log('[Grammar Gates] Interaction (Phase 5):', x, y);
    },
    
    checkRequirement(gate, sentence) {
      // Implementation in Phase 5
      return false;
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
