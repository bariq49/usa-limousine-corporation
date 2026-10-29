import { PLATFORM } from "@usa-limousine-corporation/config";

export const EMAIL_BRAND = {
  name: PLATFORM.name,
  accent: "#C9A84C",
  dark: "#111827",
  surface: "#ffffff",
  muted: "#6b7280",
  border: "#e5e7eb",
  background: "#f3f4f6",
  text: "#111827",
  soft: "#f9fafb",
  phone: PLATFORM.contact.phone,
  email: PLATFORM.contact.email,
} as const;
