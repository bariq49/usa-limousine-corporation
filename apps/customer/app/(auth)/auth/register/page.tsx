import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div className="loginwrapper relative flex min-h-screen items-center justify-center overflow-hidden">
      <img
        src="/images/auth/auth3-dark.png"
        alt=""
        className="absolute top-0 left-0 hidden h-full w-full object-cover dark:block"
      />
      <img
        src="/images/auth/auth3-light.png"
        alt=""
        className="absolute top-0 left-0 h-full w-full object-cover dark:hidden"
      />
      <div className="relative z-10 m-4 w-full max-w-xl rounded-xl bg-card p-10 xl:p-12 2xl:p-16">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
