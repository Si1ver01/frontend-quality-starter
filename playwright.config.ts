import { defineConfig, devices, type Project } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:4173';
const browserProjects = {
  chromium: {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  firefox: {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  webkit: {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
} satisfies Record<string, Project>;

function resolveProjects(): Project[] {
  const requestedBrowser = process.env.PLAYWRIGHT_BROWSER ?? 'chromium';

  if (!(requestedBrowser in browserProjects)) {
    throw new Error(
      `Unsupported PLAYWRIGHT_BROWSER "${requestedBrowser}". Expected chromium, firefox, or webkit.`,
    );
  }

  return [browserProjects[requestedBrowser as keyof typeof browserProjects]];
}

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: resolveProjects(),
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_LOG_LEVEL: process.env.DEBUG ? 'DEBUG' : 'SILENT',
    },
  },
});
