import Link from "next/link";
import { Button } from "@usa-limousine-corporation/ui/components/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-9xl font-extrabold tracking-tighter text-primary/10">404</h1>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Page not found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't
            exist.
          </p>
        </div>
        <div className="flex gap-4 justify-center pt-6">
          <Button asChild size="lg" color="primary">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
