import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
