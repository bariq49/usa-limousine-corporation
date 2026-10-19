"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { registerSchema, type RegisterSchema } from "@usa-limousine-corporation/ui/schemas";
import { SiteLogo } from "@usa-limousine-corporation/ui/svg";
import { useAuthRegister } from "@/hooks/queries/use-auth";

export function RegisterForm() {
  const { mutate: register, isPending: isLoading } = useAuthRegister();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    defaultValues: {
      name: "",
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
      <span className="inline-block">
        <SiteLogo className="h-10 w-10 text-primary 2xl:h-14 2xl:w-14" />
      </span>
      <div className="mt-6 text-2xl font-bold text-default-900 2xl:mt-8 2xl:text-3xl">
        Hey, Hello 👋
      </div>
      <div className="mt-2 text-base leading-6 text-default-600 2xl:text-lg">
        Create an account to start using USA Limousine Corporation.
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 xl:mt-7">
          <Input name="name" label="Full Name" type="text" autoComplete="name" />
          <Input name="email" label="Email" type="email" autoComplete="email" className="mt-4" />
          <Input
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            className="mt-4"
          />
          <div className="mt-5 mb-8">
            <Input name="terms" type="checkbox" label="You accept our Terms & Conditions" />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
            Create an Account
          </Button>
        </form>
      </Form>
      <div className="mt-5 text-center text-base text-default-600 2xl:mt-8">
        Already Registered?{" "}
        <Link href="/auth/login" className="text-primary">
          Sign In
        </Link>
      </div>
    </div>
  );
}
