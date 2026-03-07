# Scripts Security Audit

## Date: 2026-03-07

## Summary

The `backend/scripts/` folder contains **76 scripts** that need cleanup for a public repository.

---

## Issues Found

### 1. **Personal Information Exposure** ⚠️

**Files affected:**
- `insert-lesson-2026-02-25.js`
- `insert-lesson-2026-03-02.js`
- `insert-lesson-2026-03-04.js`
- `update-lesson-2026-03-02.js`
- `update-lesson-2026-03-02-vocab.js`
- `update-lessons-2026-02-25-03-02.js`

**Issues:**
```javascript
user: process.env.USER || 'dominiksoczewka',  // Hardcoded username

// Full system paths:
readFileSync('/Users/dominiksoczewka/clawd/lesson-2026-03-02.json')
```

**Risk:** Low - username and local paths are not critical, but reveal personal info and system structure.

### 2. **External Path References** ⚠️

Scripts reference files outside the project directory:
```javascript
'/Users/dominiksoczewka/clawd/lesson-2026-03-02.json'
```

These files won't work on other machines.

### 3. **One-Time Scripts Clutter** 📦

**Count:** 32+ `fix-*` scripts

These are data correction scripts that were run once and are no longer needed:
- `fix-2025-10-20.ts` through `fix-2025-11-12.ts`
- `fix-lesson-*.ts`
- `fix-vocab-formats*.ts`
- etc.

**Risk:** None, but clutters the repository.

### 4. **Hardcoded Database Connections** ℹ️

Several scripts set `DATABASE_URL` to localhost:
```javascript
process.env.DATABASE_URL = 'postgresql://localhost:5432/speech_practice';
```

**Risk:** None - localhost is not exposed.

---

## Recommendations

### Option A: Archive Old Scripts (Recommended)

Move to `scripts/archive/`:
```
All fix-*.ts files (32 files)
All insert-*.js files (3 files)
All update-*.js files (4 files)
All check-*.ts files (15 files) - except reusable ones
```

**Keep in scripts/:**
- `backup-lessons.ts` - Maintenance
- Reusable validation scripts (if any)

### Option B: Clean Personal Info

For scripts that must stay, remove:
1. Replace `|| 'dominiksoczewka'` with `|| 'postgres'`
2. Replace hardcoded paths with relative paths or env vars
3. Remove references to `/Users/dominiksoczewka/`

### Option C: Add to .gitignore

Add to `.gitignore`:
```
backend/scripts/archive/
backend/scripts/one-time/
```

---

## Action Items

- [ ] Move 32+ fix-* scripts to scripts/archive/
- [ ] Move insert-* and update-* scripts to scripts/archive/
- [ ] Clean personal info from remaining scripts
- [ ] Add scripts/archive/ to .gitignore
- [ ] Document which scripts are actively used

---

## Scripts That Can Be Safely Archived

```
# One-time fixes (32 files)
fix-10-01-format.ts
fix-10-01.ts
fix-2025-10-20.ts
fix-2025-10-22.ts
fix-2025-10-27.ts
fix-2025-10-29.ts
fix-2025-11-03.ts
fix-2025-11-05.ts
fix-2025-11-12.ts
fix-all-grammar.ts
fix-batch-1.ts
fix-common-verbs.ts
fix-data-quality.ts
fix-dec-1.ts
fix-dec-2.ts
fix-feb-1.ts
fix-feb-2.ts
fix-final-empty.ts
fix-furigana.ts
fix-lesson-3.ts
fix-lesson-4.ts
fix-lesson-batch.ts
fix-lesson.ts
fix-lessons-1-2.ts
fix-missing-furigana-batch.ts
fix-remaining.ts
fix-tsukau.ts
fix-vocab-formats-*.ts (5 files)

# Data insertion scripts (3 files)
insert-lesson-*.js

# Data update scripts (4 files)
update-lesson-*.js
update-lessons-*.js

# Audit scripts that have been run (15 files)
audit-furigana.ts
check-*.ts (except reusable ones)
```

**Total to archive: ~54 scripts**
**Keep: ~20 scripts**
