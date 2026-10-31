"use client";

import { PageState } from "@usa-limousine-corporation/ui/components/page-state";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageState type="error" homeHref="/analytics" reset={reset} />;
}
