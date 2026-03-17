# Regression Test Policy

## ⚠️ CRITICAL: Do Not Modify Without Approval

<!-- 
IMPORTANT REMINDER FOR AI ASSISTANT (Armin):
Changing regression tests is a SERIOUS step that requires explicit user confirmation.
These tests document bugs that were fixed and prevent them from returning.
ALWAYS ask the user before:
- Modifying test logic
- Skipping/deleting tests
- Changing assertions
- Refactoring test structure

Violation of this policy can lead to re-introducing production bugs.
-->

Regression tests in this directory (`src/test/regression/`) verify bugs that have been fixed. These tests are **protected** and require **explicit user approval** to modify.

### Why These Tests Are Special

1. **They Document Bugs** - Each test explains what broke and why
2. **They Prevent Regression** - Changing code shouldn't re-introduce old bugs
3. **They Serve as Documentation** - New developers learn what not to do

### Rules

1. **NEVER** skip or delete regression tests without code review
2. **NEVER** change the test logic (what it's verifying)
3. **ONLY** update tests if:
   - The bug was intentionally re-introduced (rare)
   - The component structure changed significantly (discuss first)
   - The test is genuinely flaky (prove it first)

### What To Do If a Regression Test Fails

1. **Don't** just fix the test
2. **Investigate** - did the bug return?
3. **Discuss** with the team if component behavior should change
4. **Document** any intentional changes in commit message

### Current Regression Tests

| Test File | Bug Fixed | Date |
|-----------|-----------|------|
| `LessonMode.regression.test.tsx` | Array iteration crash, undefined phrase fields, missing Header component | 2026-03-17 |
| `MemoryMode.regression.test.tsx` | Lesson selection not persisted, vocab count not displayed | 2026-03-17 |

### Adding New Regression Tests

When fixing a bug that:
- Caused a crash
- Affected user experience significantly  
- Was tricky to debug

Add a regression test with:
1. Clear comment explaining the bug
2. The fix that was applied
3. What the test verifies

Template:
```typescript
/**
 * REGRESSION TEST: [Short description]
 * 
 * Bug: [Detailed description of what broke]
 * 
 * Fix: [What was changed to fix it]
 */
it('should [what the test verifies]', () => {
  // test code
});
```

---

**Remember: These tests are your safety net. Don't cut them.**
