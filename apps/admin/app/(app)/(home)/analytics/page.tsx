"use client";

import { useAuthMe } from "@/hooks/queries/use-auth";
import BookingOverview from "@/components/booking-overview/booking-overview";

const Analytics = () => {
  const { data: admin } = useAuthMe();
  const greetingName = admin?.name?.trim() || "Admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-default-800">Welcome back, {greetingName}</h1>
          <p className="mt-1 text-sm text-default-500">
            Here is an overview of your bookings and revenue performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <BookingOverview />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
