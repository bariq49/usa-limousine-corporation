"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <h2 className="text-base font-medium text-default-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This page failed to render. You can retry without leaving the dashboard.
      </p>
      <button
        type="button"
        className="mt-4 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        onClick={reset}
      >
        Retry
      </button>
    </div>
  );
}
