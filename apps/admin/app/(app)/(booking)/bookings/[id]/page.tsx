"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { BookingDetailView } from "@/components/bookings/booking-detail-view";
import { BookingDetailSkeleton } from "@/components/skeletons/booking-detail-skeleton";
import { useBooking } from "@/hooks/queries/use-bookings";

const crumbs = [
  { label: "Home", href: "/analytics" },
  { label: "Booking", href: "/pending-bookings" },
  { label: "Detail" },
];

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: booking, isLoading, isError } = useBooking(params.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={crumbs} />
        <BookingDetailSkeleton />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={crumbs} />
        <Card className="border border-border shadow-xs">
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-bold text-default-900">Booking not found</h2>
            <p className="text-sm text-default-500">
              This booking may have been removed or the link is invalid.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/pending-bookings">Back to bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <BookingDetailView booking={booking} />
    </div>
  );
}
