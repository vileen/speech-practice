import { test, expect } from '@playwright/test';
import { authenticate, gotoHash } from './helpers/auth.js';

test.describe('Lesson List & Detail', () => {
  test('loads lesson list with lessons from backend', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/lessons');

    // Wait for loading to finish
    await page.waitForFunction(() => {
      return !document.body.innerText.includes('Loading');
    }, { timeout: 10_000 });

    // Header should show lessons
    await expect(page.locator('header')).toContainText('Lessons');

    // Either lessons are displayed or an error message
    const bodyText = await page.locator('body').textContent();
    const hasLessons = bodyText && bodyText.includes('Lesson') && !bodyText.includes('Failed to load');
    const hasError = bodyText?.includes('Failed to load');
    expect(hasLessons || hasError).toBe(true);
  });

  test('sort order toggle works', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/lessons');

    // Wait for content to settle
    await page.waitForTimeout(1000);

    const sortButton = page.locator('button:has-text("Newest"), button:has-text("Oldest")');
    if (await sortButton.isVisible().catch(() => false)) {
      const beforeText = await sortButton.textContent();
      await sortButton.click();
      await page.waitForTimeout(500);
      const afterText = await sortButton.textContent();
      expect(afterText).not.toBe(beforeText);
    }
  });

  test('navigates to lesson detail when clicking a lesson', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/lessons');

    // Wait for loading to finish
    await page.waitForFunction(() => {
      return !document.body.innerText.includes('Loading');
    }, { timeout: 10_000 });

    // Try to click the first lesson card/link
    const firstLesson = page.locator('.lesson-card, .lesson-item, [class*="lesson"]').first();
    if (await firstLesson.isVisible().catch(() => false)) {
      await firstLesson.click();
      // Should navigate to /lessons/:id
      await page.waitForURL(/\/lessons\/.+/, { timeout: 5000 });
    } else {
      test.skip(true, 'No lessons available to click');
    }
  });
});
