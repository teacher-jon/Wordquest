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
    selectedPattern: 1,
    magicPoints: 0,           // NEW: Current magic points
    selectedSpellType: null,  // NEW: 'projectile', 'heal', 'break', 'dash', 'control'
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
  // GRAMMAR HELPERS (Phase 3.5)
  // ============================================
  
  const GrammarHelpers = {
    conjugateVerb(verb, person = '3rd') {
      if (person !== '3rd') return verb;
      
      const verbLower = verb.toLowerCase();
      
      // Irregular verbs
      const irregulars = {
        'go': 'goes', 'do': 'does', 'have': 'has', 'be': 'is',
        'say': 'says', 'get': 'gets', 'make': 'makes', 'know': 'knows',
        'think': 'thinks', 'take': 'takes', 'see': 'sees', 'come': 'comes',
        'want': 'wants', 'use': 'uses', 'find': 'finds', 'give': 'gives',
        'tell': 'tells', 'work': 'works', 'call': 'calls', 'try': 'tries',
        'ask': 'asks', 'need': 'needs', 'feel': 'feels', 'become': 'becomes',
        'leave': 'leaves', 'put': 'puts'
      };
      
      if (irregulars[verbLower]) {
        return verb === verbLower ? irregulars[verbLower] : this.capitalize(irregulars[verbLower]);
      }
      
      // Regular conjugation rules
      if (verbLower.match(/(s|x|z|ch|sh)$/)) {
        return verb + 'es'; // pass → passes, fix → fixes, catch → catches
      }
      if (verbLower.endsWith('y') && verbLower.length > 1 && !'aeiou'.includes(verbLower[verbLower.length-2])) {
        return verb.slice(0, -1) + 'ies'; // fly → flies, cry → cries
      }
      if (verbLower.endsWith('o') && verbLower.length > 1) {
        return verb + 'es'; // go → goes (handled above), echo → echoes
      }
      
      return verb + 's'; // run → runs, jump → jumps, throw → throws
    },
    
    getArticle(nextWord) {
      if (!nextWord) return 'A';
      
      const word = nextWord.toLowerCase();
      const firstLetter = word[0];
      
      // Special cases: words that sound like they start with vowels but don't
      const anWords = ['hour', 'honest', 'honor', 'heir'];
      const aWords = ['university', 'unicorn', 'european', 'one', 'uniform'];
      
      if (anWords.some(w => word.startsWith(w))) return 'An';
      if (aWords.some(w => word.startsWith(w))) return 'A';
      
      // Standard vowel check
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      return vowels.includes(firstLetter) ? 'An' : 'A';
    },
    
    capitalize(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };
  
  // ============================================
  // SENTENCE PATTERNS (Phase 3.5)
  // ============================================
  
  const PATTERNS = {
    1: {
      name: "Declarative",
      slots: ['adjective', 'noun', 'verb'],
      labels: ['Adjective', 'Noun', 'Verb'],
      template: (words) => {
        const adj = words.adjective;
        const noun = words.noun;
        const verb = GrammarHelpers.conjugateVerb(words.verb);
        return `The ${adj} ${noun} ${verb}.`;
      },
      example: "The hot ball flies."
    },
    2: {
      name: "Imperative",
      slots: ['verb', 'adjective', 'noun'],
      labels: ['Verb', 'Adjective', 'Noun'],
      template: (words) => {
        const verb = GrammarHelpers.capitalize(words.verb);
        const adj = words.adjective;
        const noun = words.noun;
        return `${verb} the ${adj} ${noun}!`;
      },
      example: "Throw the hot ball!"
    },
    3: {
      name: "Exclamatory",
      slots: ['adjective', 'noun', 'verb'],
      labels: ['Adjective', 'Noun', 'Verb'],
      template: (words) => {
        const adj = GrammarHelpers.capitalize(words.adjective);
        const noun = words.noun;
        const verb = GrammarHelpers.conjugateVerb(words.verb);
        return `${adj} ${noun} ${verb}!`;
      },
      example: "Hot ball flies!"
    },
    4: {
      name: "Adverbial",
      slots: ['adjective', 'noun', 'verb', 'adverb'],
      labels: ['Adjective', 'Noun', 'Verb', 'Adverb'],
      template: (words) => {
        const article = GrammarHelpers.getArticle(words.adjective);
        const adj = words.adjective;
        const noun = words.noun;
        const verb = GrammarHelpers.conjugateVerb(words.verb);
        const adv = words.adverb;
        return `${article} ${adj} ${noun} ${verb} ${adv}.`;
      },
      example: "A quick fox runs swiftly."
    }
  };
  
  // ============================================
  // PHASE 3: SYNTAX ENGINE
  // ============================================
  
  const SyntaxEngine = {
    init() {
      console.log('[Syntax Sorcery] Syntax Engine initialized');
      // Set default pattern
      if (!state.selectedPattern) {
        state.selectedPattern = 1;
      }
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
      
      // Render pattern selector
      this.renderPatternSelector();
      
      // Render slots for current pattern
      this.renderSlots();
      
      // Render word picker
      this.renderWordPicker();
      
      // Reset slots
      this.clearAllSlots();
      
      // Update invoke button state
      this.updateInvokeButton();
    },
    
    changePattern(patternId) {
      state.selectedPattern = parseInt(patternId);
      console.log('[Syntax Engine] Changed to pattern:', patternId);
      
      // Clear current spell
      this.clearAllSlots();
      
      // Re-render slots
      this.renderSlots();
      
      // Update word picker (in case pattern needs different POS)
      this.renderWordPicker();
      
      // Update button
      this.updateInvokeButton();
    },
    
    renderPatternSelector() {
      const container = document.getElementById('pattern-selector-container');
      if (!container) return;
      
      let html = '<select id="pattern-choice" class="pattern-dropdown" onchange="changePattern(this.value)">';
      Object.keys(PATTERNS).forEach(id => {
        const pattern = PATTERNS[id];
        const selected = state.selectedPattern == id ? 'selected' : '';
        html += `<option value="${id}" ${selected}>${pattern.name}: ${pattern.example}</option>`;
      });
      html += '</select>';
      
      container.innerHTML = html;
    },
    
    renderSlots() {
      const container = document.getElementById('sentence-slots-container');
      if (!container) return;
      
      const pattern = PATTERNS[state.selectedPattern];
      if (!pattern) return;
      
      let html = '';
      pattern.slots.forEach((pos, index) => {
        const label = pattern.labels[index];
        const slotId = pos; // Use POS as slot ID for simplicity
        html += `
          <div class="syntax-slot" id="slot-${slotId}" data-pos="${pos}">
            <div class="syntax-slot-label">${label}</div>
            <div class="syntax-slot-word" id="word-${slotId}"></div>
            <div class="syntax-slot-clear" onclick="clearSlot('${slotId}')">×</div>
          </div>
        `;
      });
      
      container.innerHTML = html;
      
      // Re-setup drag and drop for new slots
      this.setupDropZones();
    },
    
    setupDropZones() {
      const slots = document.querySelectorAll('.syntax-slot');
      slots.forEach(slot => {
        // Remove old listeners by cloning
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
      });
      
      // Add new listeners
      document.querySelectorAll('.syntax-slot').forEach(slot => {
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
      
      // Update state - use POS as key
      if (!state.currentSpell) {
        state.currentSpell = {};
      }
      state.currentSpell[slotType] = word; // Store just the word
      
      console.log(`[Syntax Engine] Filled ${slotType} slot with "${word}"`);
      
      // Update preview and button
      this.updateSentencePreview();
      this.updateInvokeButton();
      
      // Update magic meter
      this.updateMagicMeter();
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
        delete state.currentSpell[slotType];
      }
      
      console.log(`[Syntax Engine] Cleared ${slotType} slot`);
      
      // Update preview and button
      this.updateSentencePreview();
      this.updateInvokeButton();
      
      // Update magic meter
      this.updateMagicMeter();
    },
    
    clearAllSlots() {
      const pattern = PATTERNS[state.selectedPattern];
      if (pattern) {
        pattern.slots.forEach(pos => this.clearSlot(pos));
      }
      state.currentSpell = {};
    },
    
    validateSentence() {
      const pattern = PATTERNS[state.selectedPattern];
      if (!pattern) {
        return { valid: false, error: 'No pattern selected' };
      }
      
      if (!state.currentSpell) {
        return { valid: false, error: 'No spell assembled' };
      }
      
      // Check if all required slots are filled
      for (const pos of pattern.slots) {
        if (!state.currentSpell[pos]) {
          return { valid: false, error: `${pos} slot must be filled` };
        }
      }
      
      // Generate sentence using pattern template
      try {
        const sentence = pattern.template(state.currentSpell);
        return { valid: true, sentence };
      } catch (err) {
        console.error('[Syntax Engine] Template error:', err);
        return { valid: false, error: 'Failed to generate sentence' };
      }
    },
    
    updateSentencePreview() {
      const preview = document.getElementById('sentence-preview');
      if (!preview) return;
      
      const validation = this.validateSentence();
      if (validation.valid) {
        preview.innerHTML = `<strong>Preview:</strong> "${validation.sentence}"`;
        preview.style.color = '#27ae60';
      } else {
        preview.innerHTML = '<em>Fill all slots to see preview...</em>';
        preview.style.color = '#999';
      }
    },
    
    updateInvokeButton() {
      const btn = document.getElementById('btn-invoke');
      const equipBtn = document.getElementById('btn-equip');
      
      const validation = this.validateSentence();
      
      if (btn) {
        btn.disabled = !validation.valid;
      }
      
      if (equipBtn) {
        equipBtn.disabled = !validation.valid;
      }
      
      if (validation.valid) {
        console.log(`[Syntax Engine] Valid spell: "${validation.sentence}"`);
      }
    },
    
    getCurrentSpell() {
      return state.currentSpell || {};
    },
    
    getSelectedPattern() {
      return state.selectedPattern || 1;
    },
    
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
    },
    
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
  };
  
  // ============================================
  // PHASE 4: MAGIC POINT SYSTEM
  // ============================================
  
  // Magic values for each part of speech
  const WORD_MAGIC_VALUES = {
    noun: 3,        // Concrete, stable magic
    verb: 4,        // Action, powerful magic
    adjective: 2,   // Modifying, enhancing magic
    adverb: 2       // Modifying, enhancing magic
  };
  
  // Pattern multipliers affect final magic points
  const PATTERN_MULTIPLIERS = {
    1: 1.0,   // Declarative: Balanced
    2: 1.2,   // Imperative: Command power
    3: 0.9,   // Exclamatory: Quick but weaker
    4: 1.3    // Adverbial: Complex, powerful
  };
  
  // Magic Point Tiers determine spell power
  const MAGIC_TIERS = {
    0: { min: 0, max: 5, name: 'Too Weak' },
    1: { min: 6, max: 9, name: 'Basic' },
    2: { min: 10, max: 12, name: 'Intermediate' },
    3: { min: 13, max: 15, name: 'Advanced' },
    4: { min: 16, max: 999, name: 'Master' }
  };
  
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
  
  
  const SpellSystem = {
    init() {
      console.log('[Syntax Sorcery] Spell System initialized');
    },
    
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
    },
    
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
  };
  
  // ============================================
  // PHASE 5: GRAMMAR GATES
  // ============================================
  
  const GrammarGates = {
    init() {
      console.log('[Syntax Sorcery] Grammar Gates initialized');
      
      // Initialize gates if not present
      if (typeof window.player !== 'undefined' && !window.player.grammarGates) {
        window.player.grammarGates = [];
      }
    },
    
    // Register a gate in the world
    registerGate(x, y, gateType, gateConfig) {
      if (!window.player || !window.player.grammarGates) {
        console.error('[Grammar Gates] Player not ready');
        return null;
      }
      
      const gate = {
        id: `gate_${x}_${y}`,
        x: x,
        y: y,
        type: gateType,
        requirement: gateConfig.requirement,
        hint: gateConfig.hint,
        solved: false,
        reward: gateConfig.reward || null
      };
      
      window.player.grammarGates.push(gate);
      console.log(`[Grammar Gates] Registered gate at (${x}, ${y})`);
      return gate;
    },
    
    // Find gate at specific coordinates
    getGateAt(x, y) {
      if (!window.player || !window.player.grammarGates) return null;
      return window.player.grammarGates.find(g => g.x === x && g.y === y);
    },
    
    // Check if gate is already solved
    isGateSolved(x, y) {
      const gate = this.getGateAt(x, y);
      return gate ? gate.solved : false;
    },
    
    // Validate sentence against gate requirements
    validateSentence(gate, words, patternId) {
      if (!gate || !gate.requirement) return { valid: false, message: 'Invalid gate' };
      
      // Check if pattern matches (if specified)
      if (gate.requirement.pattern && gate.requirement.pattern !== patternId) {
        return {
          valid: false,
          message: `This gate requires a different sentence pattern.`
        };
      }
      
      // Check if all required POS are present
      const requiredPOS = gate.requirement.requiredPOS || [];
      for (const pos of requiredPOS) {
        if (!words[pos]) {
          return {
            valid: false,
            message: `Missing required part: ${pos}`
          };
        }
      }
      
      return { valid: true, message: 'Gate accepts your words!' };
    },
    
    // Solve a gate (remove barrier)
    solveGate(x, y) {
      const gate = this.getGateAt(x, y);
      if (!gate) return false;
      
      gate.solved = true;
      
      // Remove tile from grid
      if (window.grid && window.grid[y] && window.grid[y][x] === 20) {
        window.grid[y][x] = 0; // Convert to air
      }
      
      // Award reward if present
      if (gate.reward) {
        if (gate.reward.fragments && window.player) {
          window.player.fragments += gate.reward.fragments;
        }
      }
      
      console.log(`[Grammar Gates] Gate at (${x}, ${y}) solved!`);
      return true;
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
    
    // Expose magic point system for HTML access
    getState() {
      return state;
    },
    
    getTierFromMagicPoints,
    calculateMagicPoints,
    SPELL_TYPES,
    MAGIC_TIERS,
    
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
