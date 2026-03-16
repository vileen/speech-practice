# Regression Tests

This directory contains tests that verify previously fixed bugs don't reoccur.

## Test Coverage

### LessonList.regression.test.tsx
Tests for the Lessons page issues:
- **Single column layout**: Prevents grid breaking into multiple columns
- **Default sort to newest first**: Ensures newest lessons appear at top by default
- **Consistent lesson numbers**: Verifies #1 always means oldest lesson, regardless of sort order
- **English locale for dates**: Prevents Polish month names appearing (e.g., "stycznia")
- **Sort buttons in header**: Ensures sorting controls are always available
- **Lesson number vertical alignment**: Keeps number centered while text stays at top

### KanjiPractice.regression.test.tsx
Tests for the Kanji practice page:
- **No duplicate imports**: Prevents kanji count growing on every page refresh
- **Import only on first visit**: Verifies kanji are only imported when localStorage is empty
- **Stable kanji count**: Ensures count doesn't increase with multiple renders

### Header.regression.test.tsx
Tests for the Header component:
- **Title centered without back button**: Prevents title shifting when no back button present
- **Title centered with back button**: Ensures back button doesn't push title off-center
- **Actions rendering**: Verifies action buttons appear in header-right
- **Full width header**: Prevents padding issues causing gaps

## Running Regression Tests

```bash
# Run all tests including regression
yarn test

# Run only regression tests
yarn test src/test/regression/

# Run specific regression test file
yarn test src/test/regression/LessonList.regression.test.tsx
```

## Adding New Regression Tests

When fixing a bug that could reoccur:
1. Create a test in the appropriate file (or create a new one)
2. Name the test descriptively: "should NOT [bad behavior]"
3. Include a comment explaining what bug it prevents
4. Update this README with the new test coverage
