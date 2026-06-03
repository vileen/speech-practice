import { Page } from '@playwright/test';

export const TEST_PASSWORD = 'default123';

/**
 * Authenticate by setting the password in localStorage.
 * The app uses HashRouter, so we land on /#/ after auth.
 */
export async function authenticate(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate((password) => {
    localStorage.setItem('speech_practice_password', password);
  }, TEST_PASSWORD);
}

/**
 * Navigate to a hash-based route inside the SPA.
 */
export async function gotoHash(page: Page, route: string): Promise<void> {
  const hash = route.startsWith('/') ? route : `/${route}`;
  await page.goto(`/#${hash}`);
}

/**
 * Login via the UI form.
 * Use when you specifically want to test the login flow.
 */
export async function loginViaUI(page: Page, password: string = TEST_PASSWORD): Promise<void> {
  await page.goto('/');
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Enter")');
  // HashRouter doesn't always add #/ on initial root load after reload,
  // so just wait for the home page to appear.
  await page.waitForSelector('.home-page', { timeout: 5000 });
}
