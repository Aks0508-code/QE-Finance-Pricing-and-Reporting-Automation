import { expect, type Page } from '@playwright/test';
import { hasRuntimeCredentials, runtimeConfig } from '../../../config/runtime-config';

export class AshleyNetShellPage {
  constructor(private readonly page: Page) {}

  async loginIfRequired(): Promise<void> {
    const loginPrompt = this.page.getByText('Please Login...', { exact: true });
    const visible = await loginPrompt.isVisible({ timeout: 1_500 }).catch(() => false);
    if (!visible) return;

    if (!hasRuntimeCredentials()) {
      if (runtimeConfig.manualAuth) {
        console.log('Complete AshleyNET login in the visible Playwright browser. Credentials remain in the browser only.');
        await expect(loginPrompt).toBeHidden({ timeout: 120_000 });
        return;
      }

      throw new Error(
        'AshleyNET requires authentication. Set STAGE_USERNAME and STAGE_PASSWORD at runtime; do not commit them.',
      );
    }

    const textboxes = this.page.getByRole('textbox');
    await textboxes.nth(0).fill(runtimeConfig.username!);
    await textboxes.nth(1).fill(runtimeConfig.password!);
    await this.page.getByRole('button', { name: /login/i }).click();
    await expect(loginPrompt).toBeHidden({ timeout: 15_000 });
  }
}