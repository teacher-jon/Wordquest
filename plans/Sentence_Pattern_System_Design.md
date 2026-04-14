# Sentence Pattern System Design
## WordCraft v5 - Syntax Sorcery Enhancement

**Goal**: Allow players to choose from multiple sentence patterns for spell construction, with proper grammar (articles, punctuation, verb conjugation).

---

## Current State (Phase 3)

**Pattern**: `[Adjective] [Noun] [Verb]`
- Example: "helpful walker coverred" ❌
- Issues:
  - No articles (a/an/the)
  - No punctuation
  - Awkward grammar
  - Word doubling bug ("coverred" should be "covered")

---

## Proposed Solution: Pattern Selection System

### Architecture

```
Syntax Grimoire UI
├── Pattern Selector (dropdown/tabs)
│   ├── Pattern 1: "The [Adj] [Noun] [Verb]s."
│   ├── Pattern 2: "[Verb] the [Adj] [Noun]!"
│   ├── Pattern 3: "[Adj] [Noun] [Verb]s!"
│   └── Pattern 4: "A [Adj] [Noun] [Verb]s [Adverb]."
├── Dynamic Slot Display (changes based on pattern)
└── Word Picker (filters by required POS)
```

---

## Pattern Definitions

### Pattern 1: Declarative Statement
**Structure**: `The [Adjective] [Noun] [Verb]s.`
**Example**: "The hot ball flies."
**Slots**: 3 (Adj, Noun, Verb)
**Grammar**:
- Article: "The" (fixed)
- Verb: Auto-conjugate to 3rd person singular (+s)
- Punctuation: Period (.)

**Use Case**: Descriptive spells, observations

---

### Pattern 2: Imperative Command
**Structure**: `[Verb] the [Adjective] [Noun]!`
**Example**: "Throw the hot ball!"
**Slots**: 3 (Verb, Adj, Noun)
**Grammar**:
- Article: "the" (fixed, lowercase)
- Verb: Base form (imperative)
- Punctuation: Exclamation (!)

**Use Case**: Action spells, direct commands

---

### Pattern 3: Exclamatory Phrase
**Structure**: `[Ade] [Noun] [Verb]s!`
**Example**: "Hot ball flies!"
**Slots**: 3 (Adj, Noun, Verb)
**Grammar**:
- No article (poetic/spell-like)
- Verb: 3rd person singular (+s)
- Punctuation: Exclamation (!)

**Use Case**: Quick incantations, battle spells

---

### Pattern 4: Adverbial Statement
**Structure**: `A [Adjective] [Noun] [Verb]s [Adverb].`
**Example**: "A quick fox runs swiftly."
**Slots**: 4 (Adj, Noun, Verb, Adverb)
**Grammar**:
- Article: "A" or "An" (auto-select based on adjective)
- Verb: 3rd person singular (+s)
- Adverb: Modifies verb
- Punctuation: Period (.)

**Use Case**: Complex spells, enhanced effects

---

## Implementation Plan

### Phase 3.5: Pattern System Enhancement

#### Task 1: Fix Word Doubling Bug
**File**: [`index.html`](index.html:1278-1316) - `fixSpelling()` function
**Issue**: "cover" + "ed" → "coverred" (should be "covered")
**Root Cause**: CVC doubling rule incorrectly triggers on words ending in 'r'
**Fix**: Exclude 'r' from doubling when followed by 'e' (cover, hover, etc.)

```javascript
// Current (buggy):
if(endsInCVC(root) && isVowel(suf[0])) { 
    return { word: root + lastChar + suf, ... }; 
}

// Fixed:
if(endsInCVC(root) && isVowel(suf[0])) {
    // Don't double if word ends in -er, -or, -ar (cover, hover, etc.)
    if (root.slice(-2, -1) === 'e' || root.slice(-2, -1) === 'o' || root.slice(-2, -1) === 'a') {
        return { word: root + suf, ... };
    }
    return { word: root + lastChar + suf, ... }; 
}
```

---

#### Task 2: Add Pattern Selector UI
**File**: [`index.html`](index.html:481-527) - Syntax Grimoire popup
**C
1. Add dropdown/tab selector above sentence slots
2. Store selected pattern in `state.selectedPattern`
3. Update slot labels dynamically based on pattern

```html
<div class="pattern-selector">
    <label>Spell Pattern:</label>
    <select id="pattern-choice" onchange="changePattern(this.value)">
        <option value="1">The [Adj] [Noun] [Verb]s.</option>
        <option value="2">[Verb] the [Adj] [Noun]!</option>
        <option value="3">[Adj] [Noun] [Verb]s!</option>
        <option value="4">A [Adj] [Noun] [Verb]s [Adv].</option>
    </select>
</div>
```

---

#### Task 3: Dynamic Slot System
**File**: [`js/syntax-sorcery.js`](js/syntax-sorcery.js:180-340) - SyntaxEngine
**Changes**:
1. Define pattern configurations
2. Render slots based on selected pattern
3. Update validation logic

```javascript
const PATTERNS = {
    1: {
        name: "Declarative",
        slots: ['adjective', 'noun', 'verb'],
        template: (adj, noun, verb) => `The ${adj} ${noun} ${conjugateVerb(verb, '3rd')}.`,
        example: "The hot ball flies."
    },
    2: {
        name: "Imperative",
        slots: ['verb', 'adjective', 'noun'],
        template: (verb, adj, noun) => `${capitalize(verb)} the ${adj} ${noun}!`,
        example: "Throw the hot ball!"
    },
    3: {
        name: "Exclamatory",
        slots: ['adjective', 'noun', 'verb'],
        template: (adj, noun, verb) => `${capitalize(adj)} ${noun} ${conjugateVerb(verb, '3rd')}!`,
        example: "Hot ball flies!"
    },
    4: {
        name: "Adverbial",
        slots: ['adjective', 'noun', 'verb', 'adverb'],
        template: (adj, noun, verb, adv) => `${getArticle(adj)} ${adj} ${noun} ${conjugateVerb(verb, '3rd')} ${adv}.`,
        example: "A quick fox runs swiftly."
    }
};
```

---

#### Task 4: Verb Conjugation Helper
**File**: [`js/syntax-sorcery.js`](js/syntax-sorcery.js) - New utility function
**Purpose**: Auto-conjugate verbs to 3rd person singular

```javascript
function conjugateVerb(verb, person) {
    if (person !== '3rd') return verb; // Only handle 3rd person for now
    
    // Special cases
    const irregulars = {
        'go': 'goes', 'do': 'does', 'have': 'has', 'be': 'is'
    };
    if (irregulars[verb]) return irregulars[verb];
    
    // Regular conjugation rules
    if (verb.endsWith('s') || verb.endsWith('x') || verb.endsWith('z') || 
        verb.endsWith('ch') || verb.endsWith('sh')) {
        return verb + 'es'; // pass → passes, fix → fixes
    }
    if (verb.endsWith('y') && !'aeiou'.includes(verb[verb.length-2])) {
        return verb.slice(0, -1) + 'ies'; // fly → flies, cry → cries
    }
    return verb + 's'; // run → runs, jump → jumps
}
```

---

#### Task 5: Article Selection Helper
**File**: [`js/syntax-sorcery.js`](js/syntax-sorcery.js) - New utility function
**Purpose**: Choose "a" vs "an" based on next word

```javascript
function getArticle(nextWord) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const firstLetter = nextWord[0].toLowerCase();
    
    // Special cases: "hour" uses "an", "university" uses "a"
    const anWords = ['hour', 'honest', 'honor'];
    const aWords = ['university', 'unicorn', 'european'];
    
    if (anWords.some(w => nextWord.toLowerCase().startsWith(w))) return 'An';
    if (aWords.some(w => nextWord.toLowerCase().startsWith(w))) return 'A';
    
    return vowels.includes(firstLetter) ? 'An' : 'A';
}
```

---

## UI Mockup

```
┌─────────────────────────────────────────────────┐
│          ✨ Syntax Grimoire                     │
│   Assemble words into powerful spells           │
├─────────────────────────────────────────────────┤
│                                                  │
│  Spell Pattern: [The [Adj] [Noun] [Verb]s. ▼]  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Adjective │  │  Noun    │  │  Verb    │      │
│  │          │  │          │  │          │      │
│  │   hot    │  │   ball   │  │   fly    │      │
│  │    ×     │  │    ×     │  │    ×     │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  Preview: "The hot ball flies."                 │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ 📖 Drag words from your Lexicon         │   │
│  │                                          │   │
│  │  [hot] [cold] [quick] [sharp]           │   │
│  │  [ball] [arrow] [wind] [fire]           │   │
│  │  [fly] [throw] [blow] [burn]            │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [⚡ Invoke Spell]  [Close]                     │
└─────────────────────────────────────────────────┘
```

---

## Testing Checklist

### Bug Fix Testing
- [ ] Forge "cover" + "ed" → Should be "covered" (not "coverred")
- [ ] Forge "hover" + "ing" → Should be "hovering" (not "hoverring")
- [ ] Forge "run" + "ing" → Should be "running" (doubling still works)

### Pattern 1 Testing
- [ ] Select Pattern 1
- [ ] Fill: hot, ball, fly
- [ ] Preview shows: "The hot ball flies."
- [ ] Invoke button enables

### Pattern 2 Testing
- [ ] Select Pattern 2
- [ ] Fill: throw, hot, ball
- [ ] Preview shows: "Throw the hot ball!"
- [ ] Invoke button enables

### Pattern 3 Testing
- [ ] Select Pattern 3
- [ ] Fill: hot, ball, fly
- [ ] Preview shows: "Hot ball flies!"
- [ ] Invoke button enables

### Pattern 4 Testing
- [ ] Select Pattern 4
- [ ] Fill: quick, fox, run, swiftly
- [ ] Preview shows: "A quick fox runs swiftly."
- [ ] Article changes: "An old fox runs swiftly."
- [ ] Invoke button enables

### Edge Cases
- [ ] Switch patterns mid-assembly → Slots clear/rearrange
- [ ] Irregular verbs: "go" → "goes", "have" → "has"
- [ ] Y-ending verbs: "fly" → "flies", "play" → "plays"

---

## Implementation Estimate

| Task | Complexity | Lines of Code | Time |
|------|------------|---------------|------|
| Fix word doubling bug | Low | ~10 | 30 min |
| Add pattern selector UI | Low | ~30 | 1 hour |
| Dynamic slot system | Medium | ~100 | 2 hours |
| Verb conjugation | Medium | ~50 | 1 hour |
| Article selection | Low | ~20 | 30 min |
| Testing & polish | Low | ~20 | 1 hour |
| **Total** | **Mixed** | **~230** | **6 hours** |

---

## Benefits

1. **Better Grammar**: Proper sentences with articles and punctuation
2. **Player Choice**: Different patterns for different spell types
3. **Educational**: Teaches sentence structure and verb conjugation
4. **Flexibility**: Easy to add more patterns in future
5. **Spell Variety**: Same words create different effects based on pattern

---

## Future Enhancements (Post-Phase 3.5)

- Pattern 5: Question form - "Does the hot ball fly?"
- Pattern 6: Conditional - "If the ball flies, then..."
- Pattern 7: Compound - "The hot ball flies and burns."
- Custom patterns: Let players create their own templates
- Pattern unlocks: Earn new patterns through gameplay

---

## Next Steps

1. **Review this design** - Confirm approach
2. **Switch to Code mode** - Implement fixes
3. **Test thoroughly** - Verify all patterns work
4. **Merge to dev** - Phase 3.5 complete!

**Ready to proceed with implementation?**
