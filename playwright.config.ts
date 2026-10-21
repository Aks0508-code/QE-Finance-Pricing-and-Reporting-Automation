import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Minimal .env loader (no external dependency): populates process.env with any
// KEY=VALUE pairs from a root .env file before runtime-config reads them.
// Existing environment variables always take precedence over .env values.
function loadDotEnv(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(resolve(__dirname, '.env'));

import { runtimeConfig } from './config/runtime-config';

const storageStatePath = resolve(__dirname, 'auth', 'stage-storage-state.json');
const storageState = existsSync(storageStatePath) ? storageStatePath : undefined;

export default defineConfig({
  testDir: './tests',
  timeout: 600_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: runtimeConfig.baseURL,
    browserName: 'chromium',
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    ignoreHTTPSErrors: runtimeConfig.ignoreHTTPSErrors,
    ...(storageState ? { storageState } : {}),
  },
  outputDir: './test-results',
});