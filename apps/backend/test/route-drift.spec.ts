import { routeDrifted } from "../src/modules/booking/utils/route-drift";

describe("routeDrifted", () => {
  it("ignores tiny changes within tolerance", () => {
    expect(routeDrifted(100, 102)).toBe(false);
    expect(routeDrifted(100, 103)).toBe(false);
  });

  it("flags relative drift beyond 3% with an absolute floor", () => {
    expect(routeDrifted(100, 103.1)).toBe(true);
    expect(routeDrifted(10, 10.2)).toBe(false);
    expect(routeDrifted(10, 10.5)).toBe(true);
  });

  it("uses the absolute floor when the quoted distance is zero", () => {
    expect(routeDrifted(0, 0.2)).toBe(false);
    expect(routeDrifted(0, 0.4)).toBe(true);
  });
});
