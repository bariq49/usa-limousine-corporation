export const ROLES_KEY = "roles";
export const AUTH_COOKIE_ACTION_KEY = "authCookieAction";
export const CSRF_COOKIE_ACTION_KEY = "csrfCookieAction";

export const AUTH_QUEUE_NAME = "auth";

export const AUTH_JOB_NAMES = {
  SEND_VERIFICATION_EMAIL: "SendVerificationEmail",
  SEND_PASSWORD_RESET_EMAIL: "SendPasswordResetEmail",
  SEND_VERIFICATION_SMS: "SendVerificationSms",
  SEND_PASSWORD_RESET_SMS: "SendPasswordResetSms",
} as const;

export const AUTH_EMAIL_TTL = {
  OTP_MINUTES: 10,
  PASSWORD_RESET_SESSION_MINUTES: 15,
} as const;
