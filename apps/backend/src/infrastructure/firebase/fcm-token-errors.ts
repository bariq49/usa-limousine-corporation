const PERMANENT_FCM_TOKEN_ERROR_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

export function isPermanentFcmTokenError(errorCode: string | undefined): boolean {
  if (!errorCode) {
    return false;
  }

  return PERMANENT_FCM_TOKEN_ERROR_CODES.has(errorCode);
}
