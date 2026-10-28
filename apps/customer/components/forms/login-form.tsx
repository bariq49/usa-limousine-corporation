"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { loginSchema, type LoginSchema } from "@usa-limousine-corporation/ui/schemas";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { useAuthLogin } from "@/hooks/queries/use-auth";

export function LoginForm() {
  const { mutate: login, isPending: isLoading } = useAuthLogin();
  const callbackUrl = useSearchParams().get("callbackUrl");

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginSchema) => {
    login(data);
  };

  return (
    <div className="w-full">
      <span className="inline-block">
        <Logo />
      </span>
      <div className="mt-6 text-2xl font-bold text-default-900 2xl:mt-8 2xl:text-3xl">
        Hey, Hello 👋
      </div>
      <div className="mt-2 text-base leading-6 text-default-600 2xl:text-lg">
        Enter the information you entered while registering.
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 2xl:mt-7">
          <Input name="email" label="Email" type="email" autoComplete="email" />
          <Input
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            className="mt-6"
          />
          <div className="mt-5 mb-6 flex flex-wrap items-center gap-2">
            <div className="flex-1">
              <Input name="rememberMe" type="checkbox" label="Remember me" />
            </div>
            <Link href="/auth/forgot" className="flex-none text-sm text-primary">
              Forgot Password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
            Sign In
          </Button>
        </form>
      </Form>
      <div className="mt-6 text-center text-base text-default-600">
        Don&apos;t have an account?{" "}
        <Link
          href={
            callbackUrl ? `/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/auth/register"
          }
          className="text-primary"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
