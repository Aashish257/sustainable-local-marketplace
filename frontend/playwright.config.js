/* global process */ // runs in Node, not the browser
import { defineConfig, devices } from '@playwright/test';

// E2E: real backend (in-memory MongoDB, seeded) + production build of the frontend.
// Run: npm run e2e   (first time on a new machine: npx playwright install chromium)
const API_PORT = 5100;
const WEB_PORT = 5174;
const env = {
    VITE_API_BASE_URL: `http://localhost:${API_PORT}/api`,
    VITE_SOCKET_URL: `http://localhost:${API_PORT}`,
};

export default defineConfig({
    testDir: './e2e',
    workers: 1, // flows share one seeded database
    fullyParallel: false,
    timeout: 60_000,
    expect: { timeout: 10_000 },
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${WEB_PORT}`,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Optional: reuse an already-downloaded Chromium instead of `npx playwright install`
        launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: [
        {
            command: 'node tests/e2e-server.js',
            cwd: '../backend',
            url: `http://127.0.0.1:${API_PORT}/`,
            timeout: 240_000, // starts alongside the frontend build, so allow for a busy machine
            stdout: 'pipe',
            reuseExistingServer: false,
        },
        {
            // A production build behaves like the deployed site and has no slow first-load compile
            command: `npx vite build --outDir dist-e2e --logLevel error && npx vite preview --outDir dist-e2e --port ${WEB_PORT} --strictPort`,
            url: `http://localhost:${WEB_PORT}`,
            timeout: 180_000,
            reuseExistingServer: false,
            env,
        },
    ],
});
