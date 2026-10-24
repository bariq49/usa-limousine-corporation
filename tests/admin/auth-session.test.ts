import { describe, expect, it } from "vitest";
import { isAdminUser } from "../../apps/admin/lib/auth/roles";
import {
  applyAuthSession,
  clearAuthSession,
  getAccessToken,
  getCsrfToken,
  setCsrfToken,
} from "../../apps/admin/lib/auth/session";
import type { CurrentUser } from "../../apps/admin/lib/types/auth";

describe("admin auth session memory", () => {
  it("keeps tokens in memory only and clears them together", () => {
    applyAuthSession({ accessToken: "access", sessionId: "session" });
    setCsrfToken("csrf");

    expect(getAccessToken()).toBe("access");
    expect(getCsrfToken()).toBe("csrf");

    clearAuthSession();

    expect(getAccessToken()).toBeNull();
    expect(getCsrfToken()).toBeNull();
  });
});

describe("admin role gate", () => {
  it("requires SUPER_ADMIN from /auth/me", () => {
    const user = {
      id: "1",
      name: "Super Admin",
      email: "admin@example.com",
      roles: ["SUPER_ADMIN"],
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      sessionId: "s1",
      avatar: null,
    } satisfies CurrentUser;

    expect(isAdminUser(user)).toBe(true);
    expect(isAdminUser({ ...user, roles: ["CUSTOMER"] })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });
});
