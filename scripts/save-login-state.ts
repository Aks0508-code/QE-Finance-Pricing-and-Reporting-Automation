/**
 * One-time manual login helper.
 *
 * Opens a real browser against Stage, lets you log in to AshleyNET by hand,
 * then saves the authenticated session (cookies/local storage) to
 * `auth/stage-storage-state.json`. Every subsequent Playwright test run
 * automatically reuses that saved session (see playwright.config.ts), so you
 * do not have to log in again for each test run.
 *
 * Usage:
 *   npx ts-node scripts/save-login-state.ts
 *   (or: npx playwright test-server is not required; this is a plain script)
 *
 * Re-run this script whenever the saved session expires (tests will start
 * failing with the "AshleyNET requires authentication" error again).
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { runtimeConfig } from '../config/runtime-config';

export const STORAGE_STATE_PATH = resolve(__dirname, '..', 'auth', 'stage-storage-state.json');

async function main() {
  mkdirSync(dirname(STORAGE_STATE_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ignoreHTTPSErrors: runtimeConfig.ignoreHTTPSErrors });
  const page = await context.newPage();

  await page.goto(runtimeConfig.baseURL + runtimeConfig.priceCodesPath);

  console.log('Complete the AshleyNET login in the opened browser window.');
  console.log('Waiting up to 3 minutes for login to complete...');

  const loginPrompt = page.getByText('Please Login...', { exact: true });
  await loginPrompt.waitFor({ state: 'hidden', timeout: 180_000 }).catch(() => {
    console.warn('Login prompt did not disappear within 3 minutes; saving session state anyway.');
  });

  await context.storageState({ path: STORAGE_STATE_PATH });
  console.log(`Saved authenticated session to ${STORAGE_STATE_PATH}`);
  console.log('You can now run tests normally (without STAGE_MANUAL_AUTH) and they will reuse this session.');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
