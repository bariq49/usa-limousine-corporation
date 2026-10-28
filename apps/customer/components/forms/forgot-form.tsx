"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { forgotSchema, type ForgotSchema } from "@usa-limousine-corporation/ui/schemas";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { useAuthForgot } from "@/hooks/queries/use-auth";

export function ForgotForm() {
  const { mutate: forgot, isPending: isLoading } = useAuthForgot();

  const form = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
    mode: "all",
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotSchema) => {
    forgot(data);
  };

  return (
    <div className="w-full">
      <span className="inline-block">
        <Logo />
      </span>
      <div className="mt-6 text-2xl font-bold text-default-900 2xl:mt-8 2xl:text-3xl">
        Forgot Your Password?
      </div>
      <div className="mt-2 text-base leading-6 text-default-600 2xl:text-lg">
        Enter your email and we will send a reset code to continue.
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 xl:mt-7">
          <Input name="email" label="Email" type="email" autoComplete="email" />
          <Button type="submit" className="mt-6 w-full" disabled={isLoading} isLoading={isLoading}>
            Send Recovery Email
          </Button>
        </form>
      </Form>
      <div className="mt-5 text-center text-base text-default-600 2xl:mt-8">
        Forget it. Send me back to{" "}
        <Link href="/auth/login" className="text-primary">
          Sign In
        </Link>
      </div>
    </div>
  );
}
