import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 45_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
  },
  webServer: { command: 'npm run dev -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'desktop-chromium', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile-emulation', use: { ...devices['Pixel 7'] } },
  ],
});
