"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import type { ClipboardEvent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { verifySchema, type VerifySchema } from "@usa-limousine-corporation/ui/schemas";
import { SiteLogo } from "@usa-limousine-corporation/ui/svg";
import { useAuthResendOtp, useAuthVerify } from "@/hooks/queries/use-auth";

export function VerifyForm() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") ?? "";
  const { mutate: verify, isPending: isLoading } = useAuthVerify();
  const { mutate: resend, isPending: isResending } = useAuthResendOtp();

  const form = useForm<VerifySchema>({
    resolver: zodResolver(verifySchema),
    mode: "all",
    defaultValues: { email: defaultEmail, token: "" },
  });

  const token = form.watch("token");
  const digits = Array.from({ length: 6 }, (_, index) => token[index] ?? "");

  const setDigit = (index: number, value: string) => {
    const next = digits
      .map((digit, digitIndex) => (digitIndex === index ? value : digit))
      .join("")
      .slice(0, 6);
    form.setValue("token", next, { shouldValidate: true, shouldDirty: true });
  };

  const pasteCode = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const code = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!code) return;

    form.setValue("token", code, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (data: VerifySchema) => {
    verify(data);
  };

  return (
    <div className="w-full py-5 md:w-[420px]">
      <span className="inline-block">
        <SiteLogo className="h-10 w-10 text-primary 2xl:h-14 2xl:w-14" />
      </span>
      <div className="mt-6 text-2xl font-bold text-default-900 2xl:mt-8 2xl:text-3xl">
        Email Verification
      </div>
      <div className="mt-2 text-base leading-6 text-default-600 2xl:text-lg">
        Enter the 6 digit confirmation code sent to your email.
      </div>
      <Form {...form}>
        <form className="mt-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-3">
            {digits.map((digit, index) => (
              <Input
                key={index}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Verification code digit ${index + 1}`}
                className="h-12 flex-1 text-center text-lg"
                onPaste={pasteCode}
                onChange={(event) => {
                  const next = event.target.value.replace(/\D/g, "").slice(-1);
                  setDigit(index, next);
                }}
              />
            ))}
          </div>
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Verify Now
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-3 w-full"
            disabled={isResending}
            isLoading={isResending}
            onClick={() => {
              resend({ email: form.getValues("email") });
            }}
          >
            Resend code
          </Button>
        </form>
      </Form>
    </div>
  );
}
