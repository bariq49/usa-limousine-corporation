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
import { SiteLogo } from "@usa-limousine-corporation/ui/svg";
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
      <span className="inline-block">
        <SiteLogo className="h-10 w-10 text-primary 2xl:h-14 2xl:w-14" />
      </span>
      <div className="mt-6 text-2xl font-bold text-default-900 2xl:mt-8 2xl:text-3xl">
        Create New Password
      </div>
      <div className="mt-2 text-base leading-6 text-default-600 2xl:text-lg">
        Enter the reset code from your email and choose a new password.
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 2xl:mt-7">
          <Input name="token" label="Reset Code" type="text" autoComplete="one-time-code" />
          <Input
            name="password"
            label="New Password"
            type="password"
            autoComplete="new-password"
            className="mt-4"
          />
          <Input
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            className="mt-4"
          />
          <div className="mt-5">
            <Input name="terms" type="checkbox" label="You accept our Terms & Conditions" />
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
