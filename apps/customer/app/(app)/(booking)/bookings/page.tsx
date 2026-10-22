import { BookingList } from "@/components/bookings/booking-list";

export default function BookingsPage() {
  return (
    <BookingList
      title="All Bookings"
      description="All your bookings. Filter by status or search by booking number."
    />
  );
}
