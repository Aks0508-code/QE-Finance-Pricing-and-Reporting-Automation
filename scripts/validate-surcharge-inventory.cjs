'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const playwrightPackage = path.dirname(require.resolve('@playwright/test'));
const playwrightCli = path.join(playwrightPackage, 'cli.js');
const expectedTotal = 397;
const expectedRegression = 387;
const expectedUiTotal = 265;
const expectedUiRegression = 255;

function discover(testPaths = ['tests/surcharge'], extraArgs = []) {
  const result = spawnSync(
    process.execPath,
    [playwrightCli, 'test', ...testPaths, '--list', ...extraArgs],
    { cwd: projectRoot, encoding: 'utf8' },
  );

  if (result.error || result.status !== 0) {
    throw result.error ?? new Error(`Playwright discovery exited with ${result.status}`);
  }

  const output = `${result.stdout}\n${result.stderr}`.replace(/\u001b\[[0-9;]*m/g, '');
  const titles = output
    .split(/\r?\n/)
    .filter(line => /\.spec\.ts:\d+:\d+\s+›/.test(line))
    .map(line => line.slice(line.indexOf('›') + 1).trim().replace(/\s+/g, ' '));
  const totalMatch = output.match(/Total:\s+(\d+)\s+tests?\s+in\s+\d+\s+files?/);

  if (!totalMatch) {
    throw new Error('Playwright discovery did not report a total.');
  }

  return { titles, total: Number(totalMatch[1]) };
}

function duplicateTitles(titles) {
  const counts = new Map();
  for (const title of titles) counts.set(title, (counts.get(title) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1);
}

function validate(label, discovery, expected) {
  if (discovery.total !== expected || discovery.titles.length !== expected) {
    throw new Error(`${label}: expected ${expected}, discovered ${discovery.total}, parsed ${discovery.titles.length}`);
  }

  const duplicates = duplicateTitles(discovery.titles);
  if (duplicates.length > 0) {
    throw new Error(`${label}: duplicate qualified titles: ${duplicates.map(([title, count]) => `${count}x ${title}`).join('; ')}`);
  }
}

try {
  const all = discover();
  const regression = discover(['tests/surcharge'], ['--grep', '@regression']);
  const ui = discover(['tests/surcharge/surcharge.spec.ts', 'tests/surcharge/surcharge-ui-expansion.spec.ts']);
  const uiRegression = discover(['tests/surcharge/surcharge.spec.ts', 'tests/surcharge/surcharge-ui-expansion.spec.ts'], ['--grep', '@regression']);
  validate('Surcharge', all, expectedTotal);
  validate('Surcharge regression', regression, expectedRegression);
  validate('AshleyNET Surcharge UI', ui, expectedUiTotal);
  validate('AshleyNET Surcharge UI regression', uiRegression, expectedUiRegression);
  console.log(`Surcharge inventory passed: ${all.total} total, ${regression.total} regression, ${ui.total} AshleyNET UI, ${uiRegression.total} AshleyNET UI regression, 0 duplicate qualified titles.`);
} catch (error) {
  console.error(`Surcharge inventory failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}