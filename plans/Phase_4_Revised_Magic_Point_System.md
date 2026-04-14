# Phase 4 Revised: Magic Point Accumulation System
## WordCraft v5 - Flexible Spell Casting

**Goal**: Replace restrictive word-matching with a flexible magic point system where words contribute power to spells based on their grammatical properties.

---

## Core Concept

Instead of matching specific words/patterns to predefined spells, each word in the lexicon has **inherent magic properties** based on its Part of Speech. When players assemble sentences in the Grimoire, they accumulate **Magic Points** that determine spell power and type.

---

## Magic Point System

### Word Power Values

Each Part of Speech contributes different magic points:

```javascript
const WORD_MAGIC_VALUES = {
  noun: 3,        // Nouns are concrete, stable magic
  verb: 4,        // Verbs are action, powerful magic
  adjective: 2,   // Adjectives modify, enhance magic
  adverb: 2       // Adverbs modify, enhance magic
};
```

### Sentence Pattern Multipliers

Different sentence patterns have different magical efficiency:

```javascript
const PATTERN_MULTIPLIERS = {
  1: 1.0,   // Declarative: "The [Adj] [Noun] [Verb]s." - Balanced
  2: 1.2,   // Imperative: "[Verb] the [Adj] [Noun]!" - Command power
  3: 0.9,   // Exclamatory: "[Adj] [Noun] [Verb]s!" - Quick but weaker
  4: 1.3    // Adverbial: "A [Adj] [Noun] [Verb]s [Adv]." - Complex, powerful
};
```

### Magic Point Calculation

```javascript
function calculateMagicPoints(words, patternId) {
  let basePoints = 0;
  
  // Sum word values
  for (const [pos, word] of Object.entries(words)) {
    basePoints += WORD_MAGIC_VALUES[pos] || 0;
  }
  
  // Apply pattern multiplier
  const multiplier = PATTERN_MULTIPLIERS[patternId] || 1.0;
  const totalPoints = Math.floor(basePoints * multiplier);
  
  return totalPoints;
}
```

**Examples**:
- Pattern 1: "The hot ball flies" = (2 + 3 + 4) × 1.0 = **9 Magic Points**
- Pattern 2: "Throw the hot ball" = (4 + 2 + 3) × 1.2 = **10 Magic Points**
- Pattern 4: "A quick fox runs swiftly" = (2 + 3 + 4 + 2) × 1.3 = **14 Magic Points**

---

## Spell Tier System

Instead of specific spells, we have **spell tiers** based on magic point thresholds:

### Tier 1: Basic Spells (6-9 Magic Points)
**Focus Cost**: 10

- **Magic Bolt**: Fire a basic projectile
- **Minor Heal**: Restore 1 HP
- **Spark**: Small particle burst (cosmetic)

### Tier 2: Intermediate Spells (10-12 Magic Points)
**Focus Cost**: 15

- **Enhanced Projectile**: Faster, more damage
- **Moderate Heal**: Restore 2 HP
- **Tile Break**: Destroy one tile
- **Short Dash**: Teleport 2 tiles

### Tier 3: Advanced Spells (13-15 Magic Points)
**Focus Cost**: 20

- **Power Blast**: High damage projectile
- **Greater Heal**: Restore 3 HP
- **Area Break**: Destroy 3x3 tiles
- **Long Dash**: Teleport 4 tiles
- **Enemy Slow**: Slow enemies in radius

### Tier 4: Master Spells (16+ Magic Points)
**Focus Cost**: 25

- **Meteor**: Massive damage projectile
- **Full Heal**: Restore all HP
- **Excavate**: Destroy 5x5 tiles
- **Blink**: Teleport 6 tiles
- **Enemy Freeze**: Freeze all enemies in radius

---

## Spell Type Selection

Players choose spell **type** (Projectile, Heal, Utility, etc.) and the magic points determine **power level**.

### UI Flow

1. **Assemble Sentence** in Grimoire
2. **Magic Meter** fills showing accumulated points
3. **Spell Type Selector** appears (buttons or dropdown)
   - 🔥 Projectile
   - 💚 Heal
   - ⛏️ Break
   - ⚡ Dash
   - 🧊 Control
4. **Tier Indicator** shows what tier you'll get
5. **Invoke** or **Equip** the spell

### Example UI

```
┌─────────────────────────────────────────────┐
│          ✨ Syntax Grimoire                 │
├─────────────────────────────────────────────┤
│  Pattern: [The [Adj] [Noun] [Verb]s. ▼]    │
│                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │ hot  │  │ ball │  │ fly  │              │
│  └──────┘  └──────┘  └──────┘              │
│                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Magic Power: ████████░░░░░░ 9/20           │
│  Tier: ⭐⭐ Intermediate                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                              │
│  Choose Spell Type:                          │
│  [🔥 Projectile] [💚 Heal] [⛏️ Break]      │
│  [⚡ Dash] [🧊 Control]                      │
│                                              │
│  Selected: Enhanced Projectile (Tier 2)     │
│  Focus Cost: 15                              │
│                                              │
│  [⚡ Invoke]  [📌 Equip]  [Close]           │
└─────────────────────────────────────────────┘
```

---

## Implementation Changes

### 1. Remove Spell Dictionary
Delete the restrictive SPELL_DICTIONARY that matches specific words.

### 2. Add Magic Point Calculator

```javascript
const WORD_MAGIC_VALUES = {
  noun: 3,
  verb: 4,
  adjective: 2,
  adverb: 2
};

const PATTERN_MULTIPLIERS = {
  1: 1.0,
  2: 1.2,
  3: 0.9,
  4: 1.3
};

function calculateMagicPoints(words, patternId) {
  let basePoints = 0;
  
  for (const [pos, word] of Object.entries(words)) {
    basePoints += WORD_MAGIC_VALUES[pos] || 0;
  }
  
  const multiplier = PATTERN_MULTIPLIERS[patternId] || 1.0;
  return Math.floor(basePoints * multiplier);
}
```

### 3. Add Spell Type System

```javascript
const SPELL_TYPES = {
  projectile: {
    name: 'Projectile',
    icon: '🔥',
    tiers: {
      1: { name: 'Magic Bolt', damage: 1, speed: 0.3, color: '#9b59b6', focusCost: 10 },
      2: { name: 'Enhanced Projectile', damage: 2, speed: 0.4, color: '#e74c3c', focusCost: 15 },
      3: { name: 'Power Blast', damage: 3, speed: 0.5, color: '#f39c12', focusCost: 20 },
      4: { name: 'Meteor', damage: 5, speed: 0.6, color: '#c0392b', focusCost: 25 }
    }
  },
  h {
    name: 'Heal',
    icon: '💚',
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
    tiers: {
      1: { name: 'Distract', duration: 30, radius: 3, focusCost: 10 },
      2: { name: 'Slow', duration: 60, radius: 4, focusCost: 15 },
      3: { name: 'Stun', duration: 90, radius: 5, focusCost: 20 },
      4: { name: 'Freeze', duration: 120, radius: 6, focusCost: 25 }
    }
  }
};
```

### 4. Update Grimoire UI

Add spell type selector buttons and magic meter:

```html
<div class="magic-meter-container">
    <div class="magic-meter-label">Magic Power</div>
    <div class="magic-meter-bar">
        <div class="magic-meter-fill" id="magic-meter-fill"></div>
    </div>
    <div class="magic-meter-text">
        <span id="magic-points">0</span> / 20
        <span id="magic-tier">Tier 0</span>
    </div>
</div>

<div class="spell-type-selector">
    <div class="spell-type-label">Choose Spell Type:</div>
    <div class="spell-type-buttons">
        <button class="spell-type-btn" data-type="projectile" onclick="selectSpellType('projectile')">
            🔥 Projectile
        </button>
        <button class="spell-type-btn" data-type="heal" onclick="selectSpellType('heal')">
            💚 Heal
        </button>
        <button class="spell-type-btn" data-type="break" onclick="selectSpellType('break')">
            ⛏️ Break
        </button>
        <button class="spell-type-btn" data-type="dash" onclick="selectSpellType('dash')">
            ⚡ Dash
        </button>
        <button class="spell-type-btn" data-type="control" onclick="selectSpellType('control')">
            🧊 Control
        </button>
    </div>
</div>

<div class="spell-preview" id="spell-preview">
    Select a spell type to see details
</div>
```

### 5. Update State Management

```javascript
const state = {
  initialized: false,
  currentSpell: { adj: null, noun: null, verb: null },
  selectedPattern: 1,
  magicPoints: 0,
  selectedSpellType: null,  // NEW
  equippedSpell: null
};
```

### 6. Update Invoke Logic

```javascript
function invokeSpell() {
  // Calculate magic points
  const magicPoints = calculateMagicPoints(currentSpell, patternId);
  
  // Determine tier
  const tier = getTierFromMagicPoints(magicPoints);
  
  // Get spell configuration
  const spellConfig = SPELL_TYPES[selectedSpellType].tiers[tier];
  
  // Check Focus
  if (player.focus < spellConfig.focusCost) {
    showToast(`❌ Need ${spellConfig.focusCost} Focus!`, 'warn');
    return;
  }
  
  // Execute spell
  executeSpellByType(selectedSpellType, tier, spellConfig);
  
  // Deduct Focus
  player.focus -= spellConfig.focusCost;
}
```

---

## Benefits of This System

1. **Flexibility**: ANY word combination works, no restrictions
2. **Progression**: More complex sentences = more powerful spells
3. **Choice**: Players choose spell type, not locked into specific effects
4. **Educational**: Teaches that sentence complexity matters
5. **Scalable**: Easy to add new spell types or tiers
6. **Balanced**: Magic points + Focus cost creates dual resource system

---

## Magic Point Tiers

```
0-5 points:   Tier 0 (Too weak, can't cast)
6-9 points:   Tier 1 (Basic)
10-12 points: Tier 2 (Intermediate)
13-15 points: Tier 3 (Advanced)
16+ points:   Tier 4 (Master)
```

---

## Example Gameplay

### Scenario 1: Early Game
Player has: "hot", "ball", "fly"

1. Assemble: "Hot ball flies!" (Pattern 3)
2. Magic Points: (2 + 3 + 4) × 0.9 = **8 points** → Tier 1
3. Choose: 🔥 Projectile
4. Result: **Magic Bolt** (basic purple projectile)
5. Cost: 10 Focus

### Scenario 2: Mid Game
Player has: "quick", "arrow", "fly", "swiftly"

1. Assemble: "A quick arrow flies swiftly." (Pattern 4)
2. Magic Points: (2 + 3 + 4 + 2) × 1.3 = **14 points** → Tier 3
3. Choose: 🔥 Projectile
4. Result: **Power Blast** (orange high-damage projectile)
5. Cost: 20 Focus

### Scenario 3: Late Game
Player has: "sharp", "blade", "cut", "quickly"

1. Assemble: "Cut the sharp blade!" (Pattern 2)
2. Magic Points: (4 + 2 + 3) × 1.2 = **10 points** → Tier 2
3. Choose: ⛏️ Break
4. Result: **Tile Break** (destroy one tile)
5. Cost: 15 Focus

---

## Implementation Priority

1. **Phase 4a**: Magic point calculation system
2. **Phase 4b**: Spell type selector UI
3. **Phase 4c**: Tier-based spell execution
4. **Phase 4d**: Magic meter visualization
5. **Phase 4e**: Testing and balance

---

## Next Steps

1. Remove restrictive SPELL_DICTIONARY
2. Implement magic point calculator
3. Create spell type system
4. Update Grimoire UI with type selector
5. Rewrite spell execution to use tiers
6. Add magic meter visualization
7. Test with various word combinations

---

**This system is much more flexible and educational!** Players learn that sentence structure and complexity directly affect spell power, without being locked into specific word combinations.
