# Article & Punctuation Selection Enhancement

## Overview
Add UI controls to let players freely choose articles (the/a/an) and punctuation (./!/?) in the sentence builder, giving them more creative control over spell construction.

---

## Design Rationale

**Educational Value**
- Teaches article usage (definite vs. indefinite)
- Demonstrates how punctuation affects sentence mood
- Encourages experimentation with sentence structure

**Gameplay Impact**
- Punctuation could affect spell behavior (. = balanced, ! = powerful but costly, ? = experimental)
- Article choice adds personalization without affecting power
- Maintains grammatical correctness while allowing creativity

---

## Implementation

### Step 1: Update State Management

**Location**: Module state in [`js/syntax-sorcery.js`](js/syntax-sorcery.js:19)

```javascript
const state = {
  initialized: false,
  currentSpell: { adj: null, noun: null, verb: null },
  selectedPattern: 1,
  magicPoints: 0,
  selectedSpellType: null,
  selectedArticle: 'the',   // NEW: Player-chosen article
  selectedPunctuation: '.', // NEW: Player-chosen punctuation
  equippedSpell: null
};
```

### Step 2: Add Selection Functions

**Location**: In SyntaxEngine object

```javascript
selectArticle(article) {
  state.selectedArticle = article;
  
  // Update button states
  document.querySelectorAll('.article-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const selectedBtn = document.querySelector(`[data-article="${article}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('active');
  }
  
  // Update sentence preview
  this.updateSentencePreview();
  
  console.log(`[Syntax Engine] Selected article: ${article}`);
},

selectPunctuation(punctuation) {
  state.selectedPunctuation = punctuation;
  
  // Update button states
  document.querySelectorAll('.punctuation-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const selectedBtn = document.querySelector(`[data-punctuation="${punctuation}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('active');
  }
  
  // Update sentence preview
  this.updateSentencePreview();
  
  // Optional: Apply punctuation modifier to magic points
  this.updateMagicMeter();
  
  console.log(`[Syntax Engine] Selected punctuation: ${punctuation}`);
}
```

### Step 3: Update Pattern Templates

**Location**: Modify PATTERNS object to accept custom article and punctuation

```javascript
const PATTERNS = {
  1: {
    name: "Declarative",
    slots: ['adjective', 'noun', 'verb'],
    labels: ['Adjective', 'Noun', 'Verb'],
    template: (words, article = 'The', punctuation = '.') => {
      const adj = words.adjective;
      const noun = words.noun;
      const verb = GrammarHelpers.conjugateVerb(words.verb);
      return `${article} ${adj} ${noun} ${verb}${punctuation}`;
    },
    example: "The hot ball flies.",
    supportsArticle: true,
    supportsPunctuation: true,
    articleOptions: ['The', 'A', 'An']
  },
  2: {
    name: "Imperative",
    slots: ['verb', 'adjective', 'noun'],
    labels: ['Verb', 'Adjective', 'Noun'],
    template: (words, article = 'the', punctuation = '!') => {
      const verb = GrammarHelpers.capitalize(words.verb);
      const adj = words.adjective;
      const noun = words.noun;
      return `${verb} ${article} ${adj} ${noun}${punctuation}`;
    },
    example: "Throw the hot ball!",
    supportsArticle: true,
    supportsPunctuation: true,
    articleOptions: ['the', 'a', 'an']
  },
  3: {
    name: "Exclamatory",
    slots: ['adjective', 'noun', 'verb'],
    labels: ['Adjective', 'Noun', 'Verb'],
    template: (words, article = null, punctuation = '!') => {
      const adj = GrammarHelpers.capitalize(words.adjective);
      const noun = words.noun;
      const verb = GrammarHelpers.conjugateVerb(words.verb);
      return `${adj} ${noun} ${verb}${punctuation}`;
    },
    example: "Hot ball flies!",
    supportsArticle: false, // No article in exclamatory
    supportsPunctuation: true,
    articleOptions: []
  },
  4: {
    name: "Adverbial",
    slots: ['adjective', 'noun', 'verb', 'adverb'],
    labels: ['Adjective', 'Noun', 'Verb', 'Adverb'],
    template: (words, article = null, punctuation = '.') => {
      // Auto-select a/an if article is null
      const selectedArticle = article || GrammarHelpers.getArticle(words.adjective);
      const adj = words.adjective;
      const noun = words.noun;
      const verb = GrammarHelpers.conjugateVerb(words.verb);
      const adv = words.adverb;
      return `${selectedArticle} ${adj} ${noun} ${verb} ${adv}${punctuation}`;
    },
    example: "A quick fox runs swiftly.",
    supportsArticle: true,
    supportsPunctuation: true,
    articleOptions: ['A', 'An', 'The']
  }
};
```

### Step 4: Update Sentence Preview Function

**Location**: Modify validateSentence() in SyntaxEngine

```javascript
validateSentence() {
  const pattern = PATTERNS[state.selectedPattern];
  if (!pattern) {
    return { valid: false, error: 'Invalid pattern' };
  }
  
  // Check if all required slots are filled
  const allFilled = pattern.slots.every(slot => {
    return state.currentSpell[slot] !== null && state.currentSpell[slot] !== undefined;
  });
  
  if (!allFilled) {
    return { valid: false, error: 'Fill all slots' };
  }
  
  // Generate sentence with custom article and punctuation
  const article = pattern.supportsArticle ? state.selectedArticle : null;
  const punctuation = state.selectedPunctuation;
  const sentence = pattern.template(state.currentSpell, article, punctuation);
  
  return { valid: true, sentence: sentence };
}
```

### Step 5: Add HTML UI Elements

**Location**: In [`index.html`](index.html:522) - Inside sentence-assembly div, after sentence-slots-container

```html
<!-- Article & Punctuation Selectors -->
<div class="grammar-controls" style="margin-top:15px; display:flex; gap:15px; justify-content:center;">
  <!-- Article Selector -->
  <div class="article-selector" id="article-selector-container">
    <div class="grammar-label">Article:</div>
    <div class="grammar-buttons">
      <button class="article-btn active" data-article="the" 
              onclick="window.SyntaxSorcery.syntax.selectArticle('the')">
        the
      </button>
      <button class="article-btn" data-article="a" 
              onclick="window.SyntaxSorcery.syntax.selectArticle('a')">
        a
      </button>
      <button class="article-btn" data-article="an" 
              onclick="window.SyntaxSorcery.syntax.selectArticle('an')">
        an
      </button>
    </div>
  </div>
  
  <!-- Punctuation Selector -->
  <div class="punctuation-selector">
    <div class="grammar-label">Punctuation:</div>
    <div class="grammar-buttons">
      <button class="punctuation-btn active" data-punctuation="." 
              onclick="window.SyntaxSorcery.syntax.selectPunctuation('.')">
        . (Statement)
      </button>
      <button class="punctuation-btn" data-punctuation="!" 
              onclick="window.SyntaxSorcery.syntax.selectPunctuation('!')">
        ! (Command)
      </button>
      <button class="punctuation-btn" data-punctuation="?" 
              onclick="window.SyntaxSorcery.syntax.selectPunctuation('?')">
        ? (Question)
      </button>
    </div>
  </div>
</div>
```

### Step 6: Add CSS Styling

**Location**: In [`index.html`](index.html:7) - Inside `<style>` tag

```css
/* Grammar Controls */
.grammar-controls {
  background: rgba(255,255,255,0.9);
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #9c27b0;
}

.article-selector, .punctuation-selector {
  flex: 1;
  text-align: center;
}

.grammar-label {
  font-weight: bold;
  font-size: 12px;
  color: #7b1fa2;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.grammar-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.article-btn, .punctuation-btn {
  background: white;
  border: 2px solid #9c27b0;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a148c;
  min-width: 50px;
}

.article-btn:hover, .punctuation-btn:hover {
  background: #f3e5f5;
  transform: translateY(-1px);
}

.article-btn.active, .punctuation-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #6a1b9a;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.article-btn.disabled, .punctuation-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Step 7: Dynamic Article Visibility

**Location**: Add function to show/hide article selector based on pattern

```javascript
updateArticleVisibility() {
  const pattern = PATTERNS[state.selectedPattern];
  const articleContainer = document.getElementById('article-selector-container');
  
  if (!articleContainer) return;
  
  if (pattern.supportsArticle) {
    articleContainer.style.display = 'block';
    
    // Update available options
    const buttons = articleContainer.querySelectorAll('.article-btn');
    buttons.forEach(btn => {
      const article = btn.dataset.article;
      if (pattern.articleOptions.includes(article) || 
          pattern.articleOptions.includes(article.charAt(0).toUpperCase() + article.slice(1))) {
        btn.classList.remove('disabled');
      } else {
        btn.classList.add('disabled');
      }
    });
  } else {
    articleContainer.style.display = 'none';
  }
}
```

### Step 8: Optional - Punctuation Modifiers

**Location**: In calculateMagicPoints function

```javascript
function calculateMagicPoints(words, patternId, punctuation = '.') {
  let basePoints = 0;
  
  // Sum word values based on POS
  for (const [pos, word] of Object.entries(words)) {
    if (word && WORD_MAGIC_VALUES[pos]) {
      basePoints += WORD_MAGIC_VALUES[pos];
    }
  }
  
  // Apply pattern multiplier
  const multiplier = PATTERN_MULTIPLIERS[patternId] || 1.0;
  
  // Optional: Apply punctuation modifier
  let punctuationMod = 1.0;
  if (punctuation === '!') punctuationMod = 1.1; // 10% boost for emphasis
  else if (punctuation === '?') punctuationMod = 0.95; // 5% reduction for uncertainty
  
  const totalPoints = Math.floor(basePoints * multiplier * punctuationMod);
  
  console.log(`[Magic Points] Base: ${basePoints}, Pattern ${patternId} (×${multiplier}), Punctuation (×${punctuationMod}), Total: ${totalPoints}`);
  
  return totalPoints;
}
```

---

## Usage Examples

### Example 1: Definite Article
- Pattern 1: "**The** hot ball flies."
- Implies a specific, known ball
- Standard magic power

### Example 2: Indefinite Article
- Pattern 1: "**A** hot ball flies."
- Implies any hot ball
- Same magic power, different flavor

### Example 3: Exclamation
- Pattern 1: "The hot ball flies**!**"
- Adds emphasis and urgency
- Optional: +10% magic power boost

### Example 4: Question
- Pattern 4: "A quick fox runs swiftly**?**"
- Experimental, uncertain spell
- Optional: -5% magic power, but unique effects

---

## Educational Benefits

1. **Article Usage**
   - Teaches definite (the) vs. indefinite (a/an)
   - Shows when articles are appropriate
   - Demonstrates a/an vowel sound rules

2. **Punctuation Meaning**
   - Period = statement of fact
   - Exclamation = command or emphasis
   - Question = inquiry or uncertainty

3. **Sentence Mood**
   - Declarative (.) = neutral
   - Imperative (!) = forceful
   - Interrogative (?) = questioning

---

## Testing Checklist

- [ ] Article buttons update sentence preview correctly
- [ ] Punctuation buttons update sentence preview correctly
- [ ] Article selector hides for Pattern 3 (Exclamatory)
- [ ] Default selections work for each pattern
- [ ] Active button states update properly
- [ ] Sentence remains grammatically correct with all combinations
- [ ] Optional punctuation modifiers apply correctly
- [ ] UI is responsive and intuitive

---

## Future Enhancements

1. **Smart Article Suggestions**
   - Highlight recommended article based on noun
   - Show tooltip explaining a/an vowel rule

2. **Punctuation Effects**
   - ! = Higher damage, higher Focus cost
   - ? = Random effect, lower Focus cost
   - . = Balanced, predictable

3. **Advanced Grammar**
   - Add possessive articles (my, your, their)
   - Add demonstratives (this, that, these, those)
   - Add quantifiers (some, many, few)

---

## Integration with Magic Point System

The article/punctuation system integrates seamlessly:
- Articles don't affect magic points (cosmetic choice)
- Punctuation can optionally modify final power (±5-10%)
- Both enhance educational value without complicating core mechanics
- Players learn grammar while building spells
