import { PLATFORM } from "@usa-limousine-corporation/config";
import type { PasswordReset } from "../../types/auth";
import { emailParagraph } from "../shared/components/paragraph";
import { emailLayout } from "../shared/layout";
import { otpCodeCard } from "./components/otp-code";


export function passwordReset(props: PasswordReset) {
  const { token, expiresInMinutes = 10 } = props;

  return emailLayout({
    title: "Reset your password",
    preheader: `Use this verification code to reset your ${PLATFORM.name} password.`,
    body: `
      ${emailParagraph(
        `We received a request to reset your ${PLATFORM.name} password. Enter the verification code below in the app to continue.`,
      )}
      ${otpCodeCard({ label: "Password reset code", token })}
      ${emailParagraph(
        `This code expires in ${expiresInMinutes} minutes and can only be used once. ${PLATFORM.name} will never ask you to share it.`,
        { muted: true },
      )}
    `,
  });
}
