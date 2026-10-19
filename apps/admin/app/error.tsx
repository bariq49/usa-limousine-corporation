"use client";

import { Button } from "@usa-limousine-corporation/ui/components/button";
import type { AppErrorProps } from "@/lib/types/error";

export default function AppError(props: AppErrorProps) {
  const { reset } = props;
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-9xl font-extrabold tracking-tighter text-destructive/10">500</h1>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Something went wrong
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            This page failed to render. You can retry without leaving the app.
          </p>
        </div>
        <div className="flex gap-4 justify-center pt-6">
          <Button onClick={reset} size="lg" color="destructive">
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
