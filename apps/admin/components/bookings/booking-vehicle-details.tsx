"use client";

import { Car, UserList } from "@usa-limousine-corporation/ui/svg";
import { DetailItem } from "@/components/bookings/detail-item";
import type { Item } from "@/lib/types/bookings";

type Props = {
  vehicleCategory?: Item["vehicleCategory"] | undefined;
};

export function BookingVehicleDetails(props: Props) {
  const vehicle = props.vehicleCategory;
  if (!vehicle?.name) return null;

  return (
    <section className="flex flex-col rounded-md bg-default-100 p-4">
      <h3 className="font-bold text-default-900">Vehicle Details</h3>
      <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
        <DetailItem icon={<Car className="h-5 w-5" />}>{vehicle.name}</DetailItem>
        {vehicle.passengerCount != null ? (
          <DetailItem icon={<UserList className="h-5 w-5" />}>
            Passengers: {vehicle.passengerCount}
          </DetailItem>
        ) : undefined}
      </div>
    </section>
  );
}
