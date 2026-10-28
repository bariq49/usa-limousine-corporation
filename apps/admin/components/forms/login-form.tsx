"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { loginSchema, type LoginSchema } from "@usa-limousine-corporation/ui/schemas";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { useAuthLogin } from "@/hooks/queries/use-auth";

export function LoginForm() {
  const { mutate: login, isPending: isLoading } = useAuthLogin();

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
        Welcome Back, Admin
      </div>
      <div className="mt-2 text-base leading-6 text-default-600 2xl:text-lg">
        Please sign in to securely access the administrative dashboard.
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
          <div className="mt-5 mb-6">
            <Input name="rememberMe" type="checkbox" label="Remember me" />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  );
}
