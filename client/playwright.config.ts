import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // `next dev` compila on-demand: pocos workers evitan timeouts por compilación concurrente.
  workers: process.env.CI ? 1 : 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx next dev -p 4173',
    url: 'http://localhost:4173/login',
    env: { SYNTHETICA_DEMO: 'true', NEXT_DIST_DIR: '.next-e2e' },
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
