const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  // Suites hand data to each other (see utils/state.js), so run them one by one, in order, without retries.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 5 * 60 * 1000,
  expect: { timeout: 15000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    // Jenkins report
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // Allure: `npm run allure:serve` after a run (needs Java)
    ['allure-playwright', {
      resultsDir: 'allure-results',
      // Show only the business steps (test.step), not every internal Playwright call
      detail: false,
      suiteTitle: false,
      environmentInfo: {
        Application: 'Jubelio',
        URL: process.env.BASE_URL || 'https://v2.jubelio.com',
        Browser: 'Chromium',
      },
    }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://v2.jubelio.com',
    storageState: '.auth/user.json',
    viewport: { width: 1440, height: 900 },
    // SLOWMO=300 slows every action down (ms), handy when watching a headed run
    launchOptions: { slowMo: Number(process.env.SLOWMO || 0) },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    // Screenshot at the end of every test (passed or failed); steps add their own (utils/report-helper.js)
    screenshot: 'on',
    // Video of every test (passed or failed) -> attached to the Allure report
    video: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /login\.setup\.js/, use: { storageState: { cookies: [], origins: [] } } },
    {
      name: 'chromium',
      testMatch: /.*\.spec\.js/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
