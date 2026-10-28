import { Suspense } from "react";
import { ForgotForm } from "@/components/forms/forgot-form";
import { ASSETS } from "@usa-limousine-corporation/ui/assets";

export default function ForgotPage() {
  return (
    <div className="loginwrapper relative flex min-h-screen items-center justify-center overflow-hidden">
      <img
        src={ASSETS.auth.dark.src}
        alt=""
        className="absolute top-0 left-0 hidden h-full w-full object-cover dark:block"
      />
      <img
        src={ASSETS.auth.light.src}
        alt=""
        className="absolute top-0 left-0 h-full w-full object-cover dark:hidden"
      />
      <div className="relative z-10 m-4 w-full max-w-xl rounded-xl bg-card p-10 xl:p-12 2xl:p-16">
        <Suspense fallback={null}>
          <ForgotForm />
        </Suspense>
      </div>
    </div>
  );
}
