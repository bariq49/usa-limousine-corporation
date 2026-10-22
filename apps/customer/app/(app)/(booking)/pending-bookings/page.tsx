import { BookingList } from "@/components/bookings/booking-list";

export default function PendingBookingsPage() {
  return (
    <BookingList
      title="Pending Bookings"
      description="Bookings waiting for confirmation from our team."
      status="PENDING"
    />
  );
}
