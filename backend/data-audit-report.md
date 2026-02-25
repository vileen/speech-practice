# Japanese Data Audit Report

## Backup Created
- File: backups/lessons-backup-2026-02-25-134102.json
- Timestamp: 2026-02-25 13:41:02

## Initial Scan Results
- Total lessons: 26
- Issues flagged by scan-lessons.ts: 58
- **Note:** Many are false positives (e.g., "roku" is Japanese for "six" 六)

## User-Reported Issues - VERIFIED

### Issue 1: 安い showing やすい as furigana
- **Status:** ✅ CORRECT - Not an issue
- **Lesson:** 2026-02-19
- **Data:** jp: "安い", reading: "やすい"
- **Verification:** 安い is correctly read as やすい (yasui = cheap)

### Issue 2: 美味しい showing おいしい as furigana  
- **Status:** ✅ CORRECT - Not an issue
- **Lesson:** 2026-02-19
- **Data:** jp: "美味しい", reading: "おいしい"
- **Verification:** 美味しい is correctly read as おいしい (oishii = delicious)

## Real Issues to Investigate

### Pattern 1: "long" in grammar explanations
- Multiple lessons affected
- "Possessive particle - indicates belonging/ownership long"
- This appears to be actual corruption

### Pattern 2: "this" in grammar example English
- Multiple lessons have "This is a book" with "this" flagged
- Need to verify if this is actually incorrect

### Pattern 3: "after" in vocabulary English
- Pattern found: "hello/good afternoon" flagged for containing "after"
- False positive - "afternoon" contains "after"

### Pattern 4: Table markdown artifacts
- Need to check for |---| patterns in explanations

## Lessons with Suspected Real Issues

1. 2025-10-01 - 6 issues (need manual verification)
2. 2025-10-06 - 3 issues
3. 2025-10-08 - 7 issues
4. 2025-10-15 - 5 issues
5. 2025-10-16 - 3 issues
6. 2025-10-20 - 7 issues
7. 2025-10-22 - 1 issue
8. 2025-10-27 - 1 issue
9. 2025-10-29 - 1 issue
10. 2025-11-03 - 4 issues
11. 2025-11-05 - 3 issues
12. 2025-11-12 - 3 issues
13. 2025-12-01 through 2026-02-19 - various

## Next Steps
1. Export all lesson data for detailed analysis
2. Create inventory of actual corruption (not false positives)
3. Fix verified issues
4. Re-scan to confirm
