import { describe, expect, it } from "vitest";
import { APP_CONFIG } from "../../apps/customer/config/app";

describe("customer app config", () => {
  it("identifies this dashboard only", () => {
    expect(APP_CONFIG.id).toBe("customer");
    expect(APP_CONFIG.name.length).toBeGreaterThan(0);
  });
});
