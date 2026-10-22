import { BookingList } from "@/components/bookings/booking-list";

export default function CancelledBookingsPage() {
  return (
    <BookingList
      title="Cancelled Bookings"
      description="Bookings that were cancelled."
      status="CANCELLED"
    />
  );
}
