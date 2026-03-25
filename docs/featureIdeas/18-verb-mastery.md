# Feature Idea 18: Verb Mastery System

## Overview

Comprehensive verb conjugation practice system for mastering Japanese verb forms through active recall drills.

**Status:** ✅ **IMPLEMENTED** (2026-03-25)  
**Priority:** High  
**Complexity:** Medium  
**Impact:** High

---

## Problem Statement

Japanese verbs have complex conjugation patterns across 3 groups (Godan/Ichidan/Irregular). Learners struggle to:
- Remember which conjugation rule applies to which verb group
- Quickly produce correct forms under pressure
- Transform between forms (e.g., dictionary → te-form)

Passive reading of conjugation tables is ineffective - active practice is needed.

---

## Solution

### Core Components

1. **Verb Database**
   - 34 common verbs covering all 3 groups
   - Full conjugation metadata for 7 forms:
     - masu_form (polite present)
     - te_form (connective)
     - nai_form (negative)
     - ta_form (past)
     - conditional_form (~eba)
     - potential_form (can do)
     - passive_form (is ~ed)

2. **Practice Modes**
   - **Recognition**: "Which form is 食べて?" (multiple choice)
   - **Construction**: "Conjugate 食べる to TE-form" (input or MC)
   - **Transformation**: "Change 食べる → 食べます" (step-by-step)

3. **Smart Difficulty**
   - Filter by verb group (I/II/III)
   - Filter by JLPT level
   - Progressive unlocking

---

## Implementation

### Database Schema

```sql
CREATE TABLE verbs (
  id SERIAL PRIMARY KEY,
  dictionary_form VARCHAR(50) NOT NULL,
  reading VARCHAR(50) NOT NULL,
  meaning TEXT NOT NULL,
  verb_group SMALLINT NOT NULL, -- 1=Godan, 2=Ichidan, 3=Irregular
  jlpt_level VARCHAR(5),
  masu_form VARCHAR(50),
  te_form VARCHAR(50),
  nai_form VARCHAR(50),
  ta_form VARCHAR(50),
  conditional_form VARCHAR(50),
  potential_form VARCHAR(50),
  passive_form VARCHAR(50)
);
```

### API Endpoints

```typescript
// GET /api/verbs/random - returns random verb
// GET /api/verbs/:id - returns specific verb
// POST /api/verbs/check - validates conjugation answer
```

### Component Structure

```
VerbMode/
├── VerbMode.tsx      # Main component with practice modes
├── VerbMode.css      # Styling
└── index.ts          # Exports
```

---

## User Flow

1. Select practice mode (Recognition/Construction/Transformation)
2. Configure filters (verb groups, answer mode)
3. Practice session begins
4. For each question:
   - See source verb/form
   - Input or select answer
   - Get immediate feedback
   - See correct answer with explanation
5. Track streak and accuracy

---

## Conjugation Rules

### Godan (Group 1) - う-verbs
| Ending | masu | te | nai | ta | conditional | potential | passive |
|--------|------|-----|-----|-----|-------------|-----------|---------|
| う | います | って | わない | った | えば | える | われる |
| く | きます | いて | かない | いた | けば | ける | かれる |
| ぐ | ぎます | いで | がない | いだ | げば | げる | がれる |
| す | します | して | さない | した | せば | せる | される |
| つ | ちます | って | たない | った | てば | てる | たれる |
| ぬ | にます | んで | なない | んだ | ねば | ねる | なれる |
| ぶ | びます | んで | ばない | んだ | べば | べる | ばれる |
| む | みます | んで | まない | んだ | めば | める | まれる |
| る | ります | って | らない | った | れば | れる | られる |

### Ichidan (Group 2) - る-verbs
All forms: drop る + ending
- masu: ます
- te: て
- nai: ない
- ta: た
- conditional: れば
- potential: られる
- passive: られる

### Irregular (Group 3)
- する → します, して, しない, した, すれば, できる, される
- 来る → 来ます, 来て, 来ない, 来た, 来れば, 来られる, 来られる

---

## Files Created

- `backend/src/routes/verbs.ts` - API routes
- `backend/data/verb_conjugations.sql` - Conjugation data
- `frontend/src/components/VerbMode/VerbMode.tsx` - Component
- `frontend/src/components/VerbMode/VerbMode.css` - Styles

---

## Future Enhancements

- [ ] Expand to 100+ verbs
- [ ] Add causative form practice
- [ ] Add volitional form practice
- [ ] Add imperative form practice
- [ ] Verb conjugation speed drills
- [ ] Transitive/intransitive pair practice

---

*Implemented: 2026-03-25*  
*Part of: Phase 2 - Verb Mastery System*
