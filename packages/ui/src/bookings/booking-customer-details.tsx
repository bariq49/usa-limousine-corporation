"use client";

import { Mail, Phone, User } from "../svg";
import { DetailItem } from "./detail-item";
import type { Passenger } from "./types";

type Props = {
  passenger?: Passenger | null | undefined;
};

export function BookingCustomerDetails(props: Props) {
  const passenger = props.passenger;

  return (
    <section className="flex flex-col rounded-md bg-default-100 p-4">
      <h3 className="font-bold text-default-900">Customer Details</h3>
      <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
        <DetailItem icon={<User className="h-5 w-5" />}>
          {passenger?.name?.trim() || "—"}
        </DetailItem>
        <DetailItem icon={<Mail className="h-5 w-5" />}>
          {passenger?.email?.trim() || "—"}
        </DetailItem>
        <DetailItem icon={<Phone className="h-5 w-5" />}>
          {passenger?.phone?.trim() || "—"}
        </DetailItem>
      </div>
    </section>
  );
}
