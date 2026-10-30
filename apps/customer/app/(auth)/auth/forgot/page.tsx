import { Suspense } from "react";
import { ForgotForm } from "@/components/forms/forgot-form";

export default function ForgotPage() {
  return (
    <Suspense fallback={null}>
      <ForgotForm />
    </Suspense>
  );
}
