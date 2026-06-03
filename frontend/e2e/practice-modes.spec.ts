import { test, expect } from '@playwright/test';
import { authenticate, gotoHash } from './helpers/auth.js';

test.describe('Practice Modes', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test('navigates to kanji practice', async ({ page }) => {
    await gotoHash(page, '/kanji');
    await expect(page.locator('body')).toContainText(/kanji|漢字|practice/i);
  });

  test('navigates to grammar drills', async ({ page }) => {
    await gotoHash(page, '/grammar');
    await expect(page.locator('body')).toContainText(/grammar|drill|exercise/i);
  });

  test('navigates to verb conjugation', async ({ page }) => {
    await gotoHash(page, '/verbs');
    await expect(page.locator('body')).toContainText(/verb|conjugation/i);
  });

  test('navigates to counters', async ({ page }) => {
    await gotoHash(page, '/counters');
    await expect(page.locator('body')).toContainText(/counter|counting|数/i);
  });

  test('navigates to reading practice', async ({ page }) => {
    await gotoHash(page, '/reading');
    await expect(page.locator('body')).toContainText(/reading|read/i);
  });

  test('navigates to listening practice', async ({ page }) => {
    await gotoHash(page, '/listening');
    await expect(page.locator('body')).toContainText(/listening|listen/i);
  });

  test('navigates to speaking drills', async ({ page }) => {
    await gotoHash(page, '/speaking');
    await expect(page.locator('body')).toContainText(/speaking|speak|drill/i);
  });

  test('404 routes redirect to home', async ({ page }) => {
    await gotoHash(page, '/nonexistent-page');
    // HashRouter redirects unknown routes to /#/ via Navigate component
    await page.waitForURL('**/#/');
    await expect(page.locator('.home-page')).toBeVisible();
  });
});