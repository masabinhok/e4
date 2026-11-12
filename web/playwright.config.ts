import { defineConfig, devices } from "@playwright/test";

// Ports avoid the usual 3000/5000 so a running dev server doesn't get reused by accident.
const WEB = "http://localhost:3055";
const API = "http://localhost:5055";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: { baseURL: WEB, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm --prefix ../api run start",
      url: `${API}/api/health`,
      timeout: 120_000,
      env: {
        PORT: "5055",
        PROXY_SECRET: "e2e-proxy-secret",
        DATABASE_URL:
          process.env.DATABASE_URL ?? "mongodb://localhost:27017/e4",
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "e2e-access",
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "e2e-refresh",
      },
    },
    {
      // Production build: no dev overlay in screenshots, and it tests what ships.
      command: "npm run build && npm run start -- --port 3055",
      url: WEB,
      timeout: 240_000,
      env: { API_URL: API, PROXY_SECRET: "e2e-proxy-secret" },
    },
  ],
});
