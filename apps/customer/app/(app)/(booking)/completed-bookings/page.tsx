import { BookingList } from "@/components/bookings/booking-list";

export default function CompletedBookingsPage() {
  return (
    <BookingList
      title="Completed Bookings"
      description="Rides you have completed."
      status="COMPLETED"
    />
  );
}
