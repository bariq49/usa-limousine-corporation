import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
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
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
