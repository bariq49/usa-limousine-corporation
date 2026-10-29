import { PLATFORM } from "@usa-limousine-corporation/config";
import type { Verification } from "../../types/auth";
import { emailParagraph } from "../shared/components/paragraph";
import { emailLayout } from "../shared/layout";
import { otpCodeCard } from "./components/otp-code";


export function verification(props: Verification) {
  const { token, expiresInMinutes = 24 * 60 } = props;
  const expiryLabel =
    expiresInMinutes >= 60
      ? `${Math.round(expiresInMinutes / 60)} hour${expiresInMinutes >= 120 ? "s" : ""}`
      : `${expiresInMinutes} minutes`;

  return emailLayout({
    title: "Confirm your email",
    subtitle: "Email verification",
    preheader: `Your ${PLATFORM.name} verification code is ready.`,
    body: `
      ${emailParagraph(
        `Welcome to ${PLATFORM.name}. Use the security code below to activate your account and continue.`,
      )}
      ${otpCodeCard({ label: "Your secure access code", token })}
      ${emailParagraph(
        `This code expires in <strong>${expiryLabel}</strong>. Do not share it with anyone—our team will never ask for it.`,
        { muted: true },
      )}
    `,
  });
}
