import { test, expect } from '@playwright/test';
import { authenticate, loginViaUI, gotoHash } from './helpers/auth.js';

test.describe('Home Page', () => {
  test('shows login form when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Enter")')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Speech Practice');
  });

  test('logs in via UI and shows home page with practice modes', async ({ page }) => {
    await loginViaUI(page);

    // Header
    await expect(page.locator('header')).toContainText('Speech Practice');

    // Core practice modes visible
    await expect(page.locator('text=Start Chat')).toBeVisible();
    await expect(page.locator('text=Repeat After Me')).toBeVisible();
    await expect(page.locator('text=Lesson Mode')).toBeVisible();

    // Review & Memory
    await expect(page.locator('text=Memory Mode')).toBeVisible();
    await expect(page.locator('text=Progress Dashboard')).toBeVisible();

    // Drills & Exercises
    await expect(page.locator('text=Grammar Drills')).toBeVisible();
    await expect(page.locator('text=Verb Conjugation')).toBeVisible();
    await expect(page.locator('text=Counters')).toBeVisible();
    await expect(page.locator('text=Kanji Practice')).toBeVisible();

    // Reading, Listening & Speaking
    await expect(page.locator('text=Reading Practice')).toBeVisible();
    await expect(page.locator('text=Listening Practice')).toBeVisible();
    await expect(page.locator('text=Speaking Drills')).toBeVisible();
  });

  test('shows a random quote in footer', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/');
    const footer = page.locator('.quote-footer');
    await expect(footer).toBeVisible();
    const quoteText = await footer.locator('.quote-text').textContent();
    expect(quoteText?.length).toBeGreaterThan(0);
  });

  test('navigates to chat setup from home', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/');
    await page.click('text=Start Chat');
    await page.waitForURL('**/#/chat/setup');
    await expect(page.locator('h2')).toContainText(/chat|setup/i);
  });

  test('navigates to repeat setup from home', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/');
    await page.click('text=Repeat After Me');
    await page.waitForURL('**/#/repeat/setup');
    await expect(page.locator('h2')).toContainText(/repeat|setup/i);
  });

  test('navigates to lesson list from home', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/');
    await page.click('text=Lesson Mode');
    await page.waitForURL('**/#/lessons');
    await expect(page.locator('header, h1').first()).toContainText(/lesson|list|lessons/i);
  });

  test('navigates to memory mode from home', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/');
    await page.click('text=Memory Mode');
    await page.waitForURL('**/#/memory');
  });

  test('navigates to progress dashboard from home', async ({ page }) => {
    await authenticate(page);
    await gotoHash(page, '/');
    await page.click('text=Progress Dashboard');
    await page.waitForURL('**/#/progress');
  });
});
