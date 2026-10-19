import { isPermanentFcmTokenError } from "../src/infrastructure/firebase/fcm-token-errors";

describe("isPermanentFcmTokenError", () => {
  it("treats registration-token-not-registered as permanent", () => {
    expect(isPermanentFcmTokenError("messaging/registration-token-not-registered")).toBe(true);
  });

  it("treats invalid-registration-token as permanent", () => {
    expect(isPermanentFcmTokenError("messaging/invalid-registration-token")).toBe(true);
  });

  it("does not treat transient errors as permanent", () => {
    expect(isPermanentFcmTokenError("messaging/unavailable")).toBe(false);
    expect(isPermanentFcmTokenError("messaging/internal-error")).toBe(false);
    expect(isPermanentFcmTokenError(undefined)).toBe(false);
  });
});
