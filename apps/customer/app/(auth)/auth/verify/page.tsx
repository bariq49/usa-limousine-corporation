import { Suspense } from "react";
import { VerifyForm } from "@/components/forms/verify-form";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
