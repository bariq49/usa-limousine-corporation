import { defineConfig } from "@playwright/test";

const reuseExistingServer = !process.env["CI"];
const skipWebServer = process.env["PLAYWRIGHT_SKIP_WEBSERVER"] === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/results",
  fullyParallel: true,
  workers: process.env["CI"] ? 2 : undefined,
  timeout: 90_000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
  },
  ...(skipWebServer
    ? {}
    : {
        webServer: [
          {
            command: "pnpm --filter @usa-limousine-corporation/admin dev",
            url: "http://127.0.0.1:3001/auth/login",
            reuseExistingServer,
            timeout: 180_000,
          },
          {
            command: "pnpm --filter @usa-limousine-corporation/customer dev",
            url: "http://127.0.0.1:3002/auth/login",
            reuseExistingServer,
            timeout: 180_000,
          },
        ],
      }),
});
