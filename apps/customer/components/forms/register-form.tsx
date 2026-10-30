"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { registerSchema, type RegisterSchema } from "@usa-limousine-corporation/ui/schemas";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { useAuthRegister } from "@/hooks/queries/use-auth";
import { PLATFORM } from "@usa-limousine-corporation/config";

export function RegisterForm() {
  const { mutate: register, isPending: isLoading } = useAuthRegister();
  const callbackUrl = useSearchParams().get("callbackUrl");

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = (data: RegisterSchema) => {
    register(data);
  };

  return (
    <div className="w-full">
      <span className="hidden md:inline-block">
        <Logo />
      </span>
      <div className="text-2xl font-bold text-default-900 md:mt-6 2xl:mt-8 2xl:text-3xl">
        Welcome to effortless travel.
      </div>
      <div className="mt-2 text-base leading-6 text-default-600 2xl:text-lg">
        Tell us a little about yourself to get started {PLATFORM.name}.
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 xl:mt-7 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="firstName"
              label="First Name"
              placeholder="Enter your first name"
              type="text"
              autoComplete="given-name"
            />
            <Input
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
              type="text"
              autoComplete="family-name"
            />
          </div>
          <Input
            name="email"
            label="Email"
            placeholder="Enter your email"
            type="email"
            autoComplete="email"
          />
          <Input
            name="password"
            label="Password"
            placeholder="Create a password"
            type="password"
            autoComplete="new-password"
          />
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
            checkboxSize="md"
          />
          <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
            Create an Account
          </Button>
        </form>
      </Form>
      <div className="mt-5 text-center text-base text-default-600 2xl:mt-8">
        Already Registered?{" "}
        <Link
          href={
            callbackUrl
              ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/auth/login"
          }
          className="text-primary"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
