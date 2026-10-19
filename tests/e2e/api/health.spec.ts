import { expect, test } from "@playwright/test";

const apiBase = (process.env["PLAYWRIGHT_API_URL"] ?? "").replace(/\/$/, "");

test.skip(!process.env["PLAYWRIGHT_API_URL"], "Set PLAYWRIGHT_API_URL to run API health");

test("API health responds with database up", async ({ request }) => {
  const response = await request.get(`${apiBase}/api/v1/health`);
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as {
    success?: boolean;
    data?: {
      status?: string;
      database?: string;
    };
  };

  expect(body.success).toBe(true);
  expect(body.data?.database).toBe("up");
  // Optional deps (SMTP/Cloudinary) may be "down" in CI with dummy credentials → degraded.
  expect(["ok", "degraded"]).toContain(body.data?.status);
});
