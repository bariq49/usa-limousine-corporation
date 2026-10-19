import { randomInt } from "crypto";

export const DEFAULT_OTP_LENGTH = 6;

export function createOtp(length = DEFAULT_OTP_LENGTH): string {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error("OTP length must be a positive integer");
  }

  return String(randomInt(0, 10 ** length)).padStart(length, "0");
}
