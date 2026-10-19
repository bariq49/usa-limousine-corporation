import { describe, expect, it } from "vitest";
import { APP_CONFIG } from "../../apps/admin/config/app";

describe("admin app config", () => {
  it("identifies this dashboard only", () => {
    expect(APP_CONFIG.id).toBe("admin");
    expect(APP_CONFIG.name.length).toBeGreaterThan(0);
  });
});
