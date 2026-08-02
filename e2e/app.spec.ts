import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { logE2e } from './logger';

test.beforeEach(async ({ browserName, page }, testInfo) => {
  logE2e('INFO', 'Browser scenario started', {
    browser: browserName,
    project: testInfo.project.name,
    scenario: testInfo.title,
  });
  logE2e('DEBUG', 'Browser context', {
    baseURL: testInfo.project.use.baseURL,
    retry: testInfo.retry,
    viewport: testInfo.project.use.viewport,
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A frontend baseline you can verify.',
  );
});

test('persists checklist progress after a pointer interaction', async ({ page }) => {
  const firstGate = page.getByRole('checkbox', { name: /TypeScript reports no errors/i });

  await firstGate.check();
  await expect(firstGate).toBeChecked();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '17');

  await page.reload();
  await expect(firstGate).toBeChecked();
  await expect(page.getByRole('status')).toHaveText('5 gates remain before release.');
});

test('follows a predictable keyboard focus order', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Frontend Quality Starter home/i })).toBeFocused();

  await page.keyboard.press('Tab');
  const firstGate = page.getByRole('checkbox', { name: /TypeScript reports no errors/i });
  await expect(firstGate).toBeFocused();

  await page.keyboard.press('Space');
  await expect(firstGate).toBeChecked();
});

test('fits a mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);

  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
  await expect(page.getByRole('heading', { name: 'Quality checklist' })).toBeVisible();
});

test('has no automated accessibility violations', async ({ page }, testInfo) => {
  const accessibilityScan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  if (accessibilityScan.violations.length > 0) {
    logE2e('ERROR', 'Accessibility violations detected', {
      browser: testInfo.project.name,
      violations: accessibilityScan.violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        nodeCount: nodes.length,
      })),
      reportPath: 'playwright-report/index.html',
    });
  }

  expect(accessibilityScan.violations).toEqual([]);
});
