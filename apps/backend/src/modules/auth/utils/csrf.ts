import { timingSafeEqual, randomBytes } from "crypto";

export function createCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function csrfTokensEqual(left: string, right: string): boolean {
  const expected = Buffer.from(left);
  const received = Buffer.from(right);

  if (expected.length === 0 || expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}
