import { Suspense } from "react";
import { CreatePasswordForm } from "@/components/forms/create-password-form";

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={null}>
      <CreatePasswordForm />
    </Suspense>
  );
}
