import Link from "next/link";
import { ShieldCross } from "@usa-limousine-corporation/ui/svg";

export default function PaymentNotFound() {
  return (
    <div className="flex min-h-vh-60 flex-col items-center justify-center px-4 py-12 text-center">
      <ShieldCross className="mb-4 h-12 w-12 text-red-600" />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">We couldn&apos;t find your booking</h1>
      <p className="mb-6 max-w-md text-sm text-gray-500">
        If you completed a payment, check your email for the confirmation or contact us.
      </p>
      <Link
        href="/"
        className="inline-flex h-11 items-center justify-center rounded-sm bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-black/90"
      >
        Back to Home
      </Link>
    </div>
  );
}
