import { expect, test } from "@playwright/test";

export interface DashboardSmokeOptions {
  headingRegex?: RegExp;
  hasForgotPassword?: boolean;
  dashboardPath?: string;
  profilePath?: string;
}

export function dashboardSmokeTests(
  name: string,
  origin: string,
  options: DashboardSmokeOptions = {},
): void {
  const {
    headingRegex = /Hey, Hello/i,
    hasForgotPassword = true,
    dashboardPath = "/dashboard",
    profilePath = "/profile",
  } = options;

  test(`${name} login page loads with auth form`, async ({ page }) => {
    await page.goto(`${origin}/auth/login`);
    await expect(page.getByText(headingRegex)).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeEnabled();
    if (hasForgotPassword) {
      await expect(page.getByRole("link", { name: "Forgot Password?" })).toBeVisible();
    }
  });

  test(`${name} dashboard redirects to login without a session`, async ({ page }) => {
    await page.goto(`${origin}${dashboardPath}`);
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 45_000 });
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test(`${name} profile redirects to login without a session`, async ({ page }) => {
    await page.goto(`${origin}${profilePath}`);
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 45_000 });
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
}
