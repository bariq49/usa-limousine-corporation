import { createHash } from "crypto";

/** Stable Agora RTC uid (1..2^32-1) derived from platform user id. */
export function agoraUidFromUserId(userId: string): number {
  const digest = createHash("sha256").update(userId).digest();
  const uid = digest.readUInt32BE(0) >>> 0;
  return uid === 0 ? 1 : uid;
}

export function tripCallChannel(tripId: string): string {
  return `trip:${tripId}`;
}
