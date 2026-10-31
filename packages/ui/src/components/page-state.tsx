"use client";

import Link from "next/link";
import { ArrowLeft } from "../svg";
import { Button } from "./button";

type PageStateProps = {
  type: "not-found" | "error";
  homeHref: string;
  reset?: (() => void) | undefined;
};

export function PageState({ type, homeHref, reset }: PageStateProps) {
  const isNotFound = type === "not-found";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <section className="w-full max-w-lg text-center">
        <p className="text-6xl font-semibold tracking-tight text-default-300 sm:text-7xl">
          {isNotFound ? "404" : "Error"}
        </p>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-default-900 sm:text-3xl">
          {isNotFound ? "Page not found" : "We couldn’t load this page"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-default-600 sm:text-base">
          {isNotFound
            ? "The page may have moved, or the address may be incorrect."
            : "Please try again, or return to your dashboard."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {!isNotFound && reset ? (
            <Button type="button" onClick={reset}>
              Try again
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
          <Button asChild variant={isNotFound ? "default" : "outline"}>
            <Link href={homeHref}>{isNotFound ? "Go to dashboard" : "Dashboard"}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
