import { BookingList } from "@/components/bookings/booking-list";

export default function ConfirmedBookingsPage() {
  return (
    <BookingList
      title="Confirmed Bookings"
      description="Upcoming rides that are confirmed and scheduled."
      status="CONFIRMED"
    />
  );
}
