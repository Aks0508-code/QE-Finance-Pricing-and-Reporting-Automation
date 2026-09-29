import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { runtimeConfig } from './config/runtime-config';

const storageStatePath = resolve(__dirname, 'auth', 'stage-storage-state.json');
const storageState = existsSync(storageStatePath) ? storageStatePath : undefined;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
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
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: runtimeConfig.ignoreHTTPSErrors,
    ...(storageState ? { storageState } : {}),
  },
  outputDir: './test-results',
});