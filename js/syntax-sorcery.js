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
      // PERFORMANCE: Single-pass categorization instead of 5 separate filters
      const categories = {
        nouns: [],
        verbs: [],
        adjectives: [],
        adverbs: [],
        other: []
      };
      
      for (const word of words) {
        switch (word.pos) {
          case 'noun': categories.nouns.push(word); break;
          case 'verb': categories.verbs.push(word); break;
          case 'adjective': categories.adjectives.push(word); break;
          case 'adverb': categories.adverbs.push(word); break;
          default: categories.other.push(word); break;
        }
      }
      
      return categories;
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
      
      // PERFORMANCE: Use DocumentFragment for batch DOM insertion
      const fragment = document.createDocumentFragment();
      
      // Helper to create category section
      const createCategory = (title, titleClass, words, chipClass, extraStyle = '') => {
        if (words.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'lex-category';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = `lex-category-title ${titleClass}`;
        titleDiv.textContent = title;
        categoryDiv.appendChild(titleDiv);
        
        // PERFORMANCE: Batch create word chips
        words.forEach(w => {
          const chip = document.createElement('div');
          chip.className = `lex-word-chip ${chipClass}`;
          chip.title = `Strength: ${w.strength}`;
          chip.textContent = w.word;
          if (extraStyle) chip.setAttribute('style', extraStyle);
          categoryDiv.appendChild(chip);
        });
        
        fragment.appendChild(categoryDiv);
      };
      
      // Create all categories
      createCategory(`📦 Nouns (${categories.nouns.length})`, 'lex-noun-title', categories.nouns, 'lex-noun');
      createCategory(`⚡ Verbs (${categories.verbs.length})`, 'lex-verb-title', categories.verbs, 'lex-verb');
      createCategory(`✨ Adjectives (${categories.adjectives.length})`, 'lex-adj-title', categories.adjectives, 'lex-adj');
      createCategory(`🌟 Adverbs (${categories.adverbs.length})`, 'lex-adv-title', categories.adverbs, 'lex-adv');
      
      // Other category with custom styling
      if (categories.other.length > 0) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'lex-category';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'lex-category-title';
        titleDiv.style.background = '#e0e0e0';
        titleDiv.textContent = `📝 Other (${categories.other.length})`;
        categoryDiv.appendChild(titleDiv);
        
        categories.other.forEach(w => {
          const chip = document.createElement('div');
          chip.className = 'lex-word-chip';
          chip.style.cssText = 'background:#f5f5f5; border-color:#999; color:#333;';
          chip.title = `Strength: ${w.strength}`;
          chip.textContent = `${w.word} (${w.pos})`;
          categoryDiv.appendChild(chip);
        });
        
        fragment.appendChild(categoryDiv);
      }
      
      // PERFORMANCE: Single DOM update instead of incremental innerHTML concatenation
      container.innerHTML = '';
      container.appendChild(fragment);
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
  
  // Device detection
  function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }
  
  // Haptic feedback
  function triggerHaptic(style = 'light') {
    if (!navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      error: [50, 50, 50]
    };
    
    navigator.vibrate(patterns[style] || patterns.light);
  }

  const SyntaxEngine = {
    init() {
      console.log('[Syntax Sorcery] Syntax Engine initialized');
      // Set default pattern
      if (!state.selectedPattern) {
        state.selectedPattern = 1;
      }
      
      // Initialize selected word state
      state.selectedWord = null;
      
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
      
      // Show mobile hint on first open for touch devices
      if (isTouchDevice() && !localStorage.getItem('grimoire_hint_shown')) {
        const hint = document.getElementById('mobile-hint');
        if (hint) {
          hint.style.display = 'block';
          setTimeout(() => {
            hint.classList.add('fade-out');
            setTimeout(() => {
              hint.style.display = 'none';
            }, 500);
          }, 3000);
          localStorage.setItem('grimoire_hint_shown', 'true');
        }
      }
      
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
      
      // Show tutorial on first open
      if (window.player && !window.player.tutorials.grimoireOpened) {
        setTimeout(() => {
          Tutorial.show();
        }, 300); // Small delay to let Grimoire render first
      }
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
      
      // Update title based on device
      const titleElement = document.querySelector('.lexicon-picker-title');
      if (titleElement && isTouchDevice()) {
        titleElement.textContent = '📖 Tap words from your Lexicon';
      }
      
      if (!window.player || !window.player.lexicon || window.player.lexicon.length === 0) {
        container.innerHTML = '<div style="color:#999; font-style:italic; padding:20px;">Your lexicon is empty. Forge words first!</div>';
        return;
      }
      
      const categories = Lexicon.getWordsByCategory();
      
      // PERFORMANCE: Use DocumentFragment for batch DOM insertion
      const fragment = document.createDocumentFragment();
      
      // Render each category
      ['adjectives', 'nouns', 'verbs', 'adverbs'].forEach(category => {
        const words = categories[category];
        if (words.length > 0) {
          words.forEach(w => {
            const colorClass = w.pos === 'noun' ? 'lex-noun' :
                             w.pos === 'verb' ? 'lex-verb' :
                             w.pos === 'adjective' ? 'lex-adj' : 'lex-adv';
            
            const wordDiv = document.createElement('div');
            wordDiv.className = `draggable-word ${colorClass}`;
            wordDiv.draggable = true;
            wordDiv.dataset.word = w.word;
            wordDiv.dataset.pos = w.pos;
            wordDiv.textContent = w.word;
            
            fragment.appendChild(wordDiv);
          });
        }
      });
      
      // PERFORMANCE: Single DOM update
      container.innerHTML = '';
      container.appendChild(fragment);
      console.log(`[Syntax Engine] Rendered ${window.player.lexicon.length} words in picker`);
    },
    
    setupDragAndDrop() {
      console.log('[Syntax Engine] Setting up drag & drop');
      
      const isTouch = isTouchDevice();
      console.log('[Syntax Engine] Touch device:', isTouch);
      
      if (isTouch) {
        // Mobile: Use click-based selection
        this.setupClickSelection();
        this.setupMobileTooltips();
      } else {
        // Desktop: Use drag-and-drop
        this.setupDesktopDragDrop();
      }
    },
    
    setupMobileTooltips() {
      console.log('[Syntax Engine] Setting up mobile tooltips');
      
      // Track tooltip state for each button
      const tooltipState = {};
      
      document.querySelectorAll('.spell-type-btn').forEach(btn => {
        const type = btn.dataset.type;
        tooltipState[type] = false;
        
        btn.addEventListener('click', (e) => {
          // If tooltip is not shown, show it and prevent spell selection
          if (!tooltipState[type]) {
            e.stopPropagation();
            
            // Hide all other tooltips
            document.querySelectorAll('.spell-type-btn').forEach(b => {
              b.classList.remove('show-tooltip');
              tooltipState[b.dataset.type] = false;
            });
            
            // Show this tooltip
            btn.classList.add('show-tooltip');
            tooltipState[type] = true;
            
            // Prevent the onclick from firing
            return false;
          }
          // If tooltip is already shown, let the click proceed to select spell type
          // The tooltip will be hidden by selectSpellType()
        });
      });
      
      // Hide tooltips when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.spell-type-btn')) {
          document.querySelectorAll('.spell-type-btn').forEach(btn => {
            btn.classList.remove('show-tooltip');
            tooltipState[btn.dataset.type] = false;
          });
        }
      });
    },
    
    setupClickSelection() {
      console.log('[Syntax Engine] Setting up click-based selection for mobile');
      
      // Click on word to select it
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('draggable-word')) {
          this.selectWord(e.target);
        } else if (e.target.classList.contains('syntax-slot') || e.target.closest('.syntax-slot')) {
          const slot = e.target.classList.contains('syntax-slot') ? e.target : e.target.closest('.syntax-slot');
          this.handleSlotClick(slot);
        }
      });
    },
    
    selectWord(wordElement) {
      const word = wordElement.dataset.word;
      const pos = wordElement.dataset.pos;
      
      // Haptic feedback
      triggerHaptic('light');
      
      // Remove previous selection
      document.querySelectorAll('.draggable-word').forEach(w => {
        w.classList.remove('word-selected');
      });
      
      // Select this word
      wordElement.classList.add('word-selected');
      state.selectedWord = { word, pos };
      
      // Add pulse animation to available slots
      document.querySelectorAll('.syntax-slot').forEach(slot => {
        if (slot.dataset.pos === pos && !slot.classList.contains('filled')) {
          slot.classList.add('slot-available');
        } else {
          slot.classList.remove('slot-available');
        }
      });
      
      console.log('[Syntax Engine] Selected word:', word, pos);
    },
    
    handleSlotClick(slot) {
      const slotPos = slot.dataset.pos;
      const slotId = slot.id.replace('slot-', '');
      
      // If slot is filled, clear it
      if (slot.classList.contains('filled')) {
        triggerHaptic('light');
        this.clearSlot(slotId);
        return;
      }
      
      // If word is selected, fill the slot
      if (state.selectedWord) {
        if (state.selectedWord.pos === slotPos) {
          triggerHaptic('medium');
          this.fillSlot(slotId, state.selectedWord.word, state.selectedWord.pos);
          
          // Clear selection
          document.querySelectorAll('.draggable-word').forEach(w => {
            w.classList.remove('word-selected');
          });
          document.querySelectorAll('.syntax-slot').forEach(s => {
            s.classList.remove('slot-available');
          });
          state.selectedWord = null;
        } else {
          triggerHaptic('error');
          if (typeof window.showToast === 'function') {
            window.showToast(`❌ Wrong type! Need ${slotPos}, got ${state.selectedWord.pos}`, 'warn');
          }
        }
      }
    },
    
    setupDesktopDragDrop() {
      console.log('[Syntax Engine] Setting up desktop drag & drop');
      
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
        btn.classList.remove('show-tooltip'); // Hide all tooltips
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
      
      // Enhanced visual effects based on tier
      const particleCount = 15 + (tier * 10);
      this.createProjectileLaunchEffect(player.x, player.y, config.color, tier, player.facingLeft);
      
      // Screen shake for higher tiers
      if (tier >= 3) {
        this.screenShake(tier * 2);
      }
      
      // Audio with pitch variation
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
      
      // Enhanced healing visual effect
      this.createHealingAura(player.x, player.y, tier);
      
      // Pulse effect for full heal
      if (tier === 4) {
        this.createRadialBurst(player.x, player.y, '#2ecc71', 20, 2);
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
            if (tileType > 0 && tileType !== 6 && tileType !== 11 && tileType !== 13 && tileType !== 20) {
              grid[y][x] = 0;
              
              // Enhanced destruction effect
              this.createDebrisExplosion(x, y, tier);
              brokenCount++;
            }
          }
        }
      }
      
      if (brokenCount === 0) {
        return { success: false, message: '❌ Nothing to break!' };
      }
      
      // Screen shake for area breaks
      if (radius > 0) {
        this.screenShake(3 + tier);
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
      
      // Enhanced teleport effect
      this.createTeleportEffect(player.x, player.y, targetX, targetY, tier);
      
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
      
      // Create expanding control wave
      this.createControlWave(player.x, player.y, radius, tier);
      
      enemies.forEach(enemy => {
        const distance = Math.sqrt(
          Math.pow(enemy.x - player.x, 2) +
          Math.pow(enemy.y - player.y, 2)
        );
        
        if (distance <= radius) {
          enemy.stun = config.duration;
          this.createFreezeEffect(enemy.x, enemy.y, tier);
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
    },
    
    // Enhanced effect: Projectile launch with directional burst
    createProjectileLaunchEffect(x, y, color, tier, facingLeft) {
      if (!window.particles) return;
      
      const particleCount = 20 + (tier * 10);
      const chars = ['✨', '⭐', '💫', '🌟'];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (facingLeft ? Math.PI : 0) + (Math.random() - 0.5) * Math.PI * 0.5;
        const speed = 0.15 + Math.random() * 0.2 * tier;
        
        window.particles.push({
          x: x,
          y: y + (Math.random() - 0.5) * 0.5,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.3,
          char: chars[Math.floor(Math.random() * chars.length)],
          color: color,
          life: 20 + tier * 5
        });
      }
    },
    
    // Enhanced effect: Healing aura with upward particles
    createHealingAura(x, y, tier) {
      if (!window.particles) return;
      
      const particleCount = 25 + (tier * 10);
      const colors = ['#2ecc71', '#27ae60', '#1abc9c', '#16a085'];
      const chars = ['💚', '💖', '✨', '⭐', '🌟'];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1.5;
        const speed = 0.05 + Math.random() * 0.1;
        
        window.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.05,
          vy: -speed * (1 + tier * 0.3),
          char: chars[Math.floor(Math.random() * chars.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 40 + tier * 10
        });
      }
    },
    
    // Enhanced effect: Radial burst for powerful spells
    createRadialBurst(x, y, color, count, speed) {
      if (!window.particles) return;
      
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        
        window.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          char: '💫',
          color: color,
          life: 30
        });
      }
    },
    
    // Enhanced effect: Debris explosion for break spells
    createDebrisExplosion(x, y, tier) {
      if (!window.particles) return;
      
      const particleCount = 8 + (tier * 4);
      const chars = ['▪', '▫', '◾', '◽', '⬛', '⬜'];
      const colors = ['#8d6e63', '#795548', '#6d4c41', '#5d4037'];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.3;
        
        window.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.1,
          char: chars[Math.floor(Math.random() * chars.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 25 + Math.random() * 15
        });
      }
    },
    
    // Enhanced effect: Teleport trail with fade
    createTeleportEffect(startX, startY, endX, endY, tier) {
      if (!window.particles) return;
      
      const distance = Math.abs(endX - startX);
      const direction = endX > startX ? 1 : -1;
      const particlesPerTile = 5 + tier * 2;
      
      // Trail particles
      for (let i = 0; i <= distance; i++) {
        const x = startX + (i * direction);
        
        for (let j = 0; j < particlesPerTile; j++) {
          window.particles.push({
            x: x + (Math.random() - 0.5) * 0.5,
            y: startY + (Math.random() - 0.5) * 0.5,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            char: ['⚡', '✨', '💫'][Math.floor(Math.random() * 3)],
            color: ['#9b59b6', '#8e44ad', '#6c3483'][Math.floor(Math.random() * 3)],
            life: 20 + i * 2
          });
        }
      }
      
      // Arrival burst
      this.createRadialBurst(endX, endY, '#9b59b6', 12, 0.3);
    },
    
    // Enhanced effect: Control wave expansion
    createControlWave(x, y, radius, tier) {
      if (!window.particles) return;
      
      const waveParticles = 30 + (tier * 10);
      const colors = ['#3498db', '#2980b9', '#5dade2', '#85c1e9'];
      
      for (let i = 0; i < waveParticles; i++) {
        const angle = (Math.PI * 2 * i) / waveParticles;
        const distance = radius * 0.8;
        
        window.particles.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          vx: Math.cos(angle) * 0.05,
          vy: Math.sin(angle) * 0.05,
          char: ['❄️', '🧊', '💎', '💠'][Math.floor(Math.random() * 4)],
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 40 + tier * 5
        });
      }
    },
    
    // Enhanced effect: Freeze effect on enemies
    createFreezeEffect(x, y, tier) {
      if (!window.particles) return;
      
      const particleCount = 10 + (tier * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        
        window.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * 0.08,
          vy: Math.sin(angle) * 0.08,
          char: ['❄️', '🧊'][Math.floor(Math.random() * 2)],
          color: '#3498db',
          life: 30
        });
      }
    },
    
    // Screen shake effect
    screenShake(intensity) {
      if (!window.camera) return;
      
      const originalX = window.camera.x || 0;
      const originalY = window.camera.y || 0;
      const duration = 200; // ms
      const startTime = Date.now();
      
      const shake = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          if (window.camera) {
            window.camera.shakeX = 0;
            window.camera.shakeY = 0;
          }
          return;
        }
        
        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);
        
        if (window.camera) {
          window.camera.shakeX = (Math.random() - 0.5) * currentIntensity * 0.1;
          window.camera.shakeY = (Math.random() - 0.5) * currentIntensity * 0.1;
        }
        
        requestAnimationFrame(shake);
      };
      
      shake();
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
  // TUTORIAL SYSTEM
  // ============================================
  
  const Tutorial = {
    currentStep: 1,
    totalSteps: 6,
    
    show() {
      if (!window.player || window.player.tutorials.grimoireOpened) {
        return; // Don't show if already completed
      }
      
      const overlay = document.getElementById('grimoire-tutorial');
      if (overlay) {
        overlay.style.display = 'block';
        this.showStep(1);
      }
    },
    
    showStep(stepNumber) {
      this.currentStep = stepNumber;
      
      // Hide all steps
      const allSteps = document.querySelectorAll('.tutorial-step');
      allSteps.forEach(step => {
        step.style.display = 'none';
      });
      
      // Show current step
      const currentStepEl = document.querySelector(`.tutorial-step[data-step="${stepNumber}"]`);
      if (currentStepEl) {
        currentStepEl.style.display = 'flex';
      }
    },
    
    next() {
      if (this.currentStep < this.totalSteps) {
        this.showStep(this.currentStep + 1);
      } else {
        this.finish();
      }
    },
    
    skip() {
      this.finish();
    },
    
    finish() {
      const overlay = document.getElementById('grimoire-tutorial');
      if (overlay) {
        overlay.style.display = 'none';
      }
      
      // Mark tutorial as completed
      if (window.player) {
        window.player.tutorials.grimoireOpened = true;
      }
      
      console.log('[Tutorial] Grimoire tutorial completed');
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
    tutorial: Tutorial,
    
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
