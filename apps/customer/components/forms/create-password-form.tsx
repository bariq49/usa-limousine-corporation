"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import {
  createPasswordSchema,
  type CreatePasswordSchema,
} from "@usa-limousine-corporation/ui/schemas";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { useAuthResetPassword } from "@/hooks/queries/use-auth";

export function CreatePasswordForm() {
  const searchParams = useSearchParams();
  const defaultToken = searchParams.get("token") ?? "";
  const { mutate: resetPassword, isPending: isLoading } = useAuthResetPassword();

  const form = useForm<CreatePasswordSchema>({
    resolver: zodResolver(createPasswordSchema),
    mode: "all",
    defaultValues: {
      token: defaultToken,
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = (data: CreatePasswordSchema) => {
    resetPassword({
      token: data.token,
      newPassword: data.password,
    });
  };

  return (
    <div className="w-full">
      <span className="hidden md:inline-block">
        <Logo />
      </span>
      <div className="text-2xl font-bold text-default-900 md:mt-6 2xl:mt-8 2xl:text-3xl">
        Create New Password
      </div>
      <div className="mt-2 text-base leading-6 text-default-600 2xl:text-lg">
        Enter the reset code from your email and choose a new password.
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 2xl:mt-7">
          <Input
            name="token"
            label="Reset Code"
            placeholder="Enter the code from your email"
            type="text"
            autoComplete="one-time-code"
          />
          <Input
            name="password"
            label="New Password"
            placeholder="Enter a new password"
            type="password"
            autoComplete="new-password"
            className="mt-4"
          />
          <Input
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your new password"
            type="password"
            autoComplete="new-password"
            className="mt-4"
          />
          <div className="mt-5">
            <Input
              name="terms"
              type="checkbox"
              label={
                <>
                  You accept our{" "}
                  <a
                    href={`${process.env["NEXT_PUBLIC_WEBSITE_URL"]}/terms-and-conditions`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href={`${process.env["NEXT_PUBLIC_WEBSITE_URL"]}/privacy-policy`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                </>
              }
            />
          </div>
          <Button type="submit" className="mt-8 w-full" disabled={isLoading} isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </Form>
      <div className="mt-6 text-center text-base text-default-600">
        Not now? Return{" "}
        <Link href="/auth/login" className="text-primary">
          Sign In
        </Link>
      </div>
    </div>
  );
}
