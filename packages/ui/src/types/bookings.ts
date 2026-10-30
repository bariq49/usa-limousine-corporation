import type { ReactNode } from "react";
import type { VehicleCategory, Estimate } from "./booking";
import type { CalendarEvent, CalendarQuery, DayRides, Item, Passenger, Payment } from "./booking-model";

export type { CalendarEvent, CalendarQuery, DayRides };

export type BookingDetailViewProps = {
  booking: Item;
  actions?: ReactNode;
  backHref?: string;
  heading?: { title: string; description: string };
  mapStickyClassName?: string;
  children?: ReactNode;
};

export type MiniMonthCalendarProps = {
  month: Date;
  selected: Date;
  onMonthChange: (date: Date) => void;
  onSelect: (date: Date) => void;
};

export type DayRideCardsProps = {
  day: DayRides;
  basePath: string;
  getBooking: (id: string) => Promise<Item>;
  bookingQueryKey?: ((id: string) => readonly unknown[]) | undefined;
  onCancelBooking?: ((input: { id: string; reason: string }) => Promise<unknown> | void) | undefined;
  cancelPending?: boolean | undefined;
  onEditBooking?: ((booking: Item) => void) | undefined;
};

export type BookingCalendarProps = {
  events?: CalendarEvent[] | undefined;
  isFetching?: boolean | undefined;
  onQueryChange: (query: CalendarQuery) => void;
  basePath: string;
  title?: string | undefined;
  description?: string | undefined;
  getBooking: (id: string) => Promise<Item>;
  bookingQueryKey?: ((id: string) => readonly unknown[]) | undefined;
  onCancelBooking?: ((input: { id: string; reason: string }) => Promise<unknown> | void) | undefined;
  cancelPending?: boolean | undefined;
  onEditBooking?: ((booking: Item) => void) | undefined;
};

export interface BookingPaymentDetailsProps {
  payment?: Payment | null | undefined;
}

export interface BookingPaymentSummaryProps {
  booking: Pick<Item, "pricing" | "totalPrice" | "extraServices" | "luggage" | "bookingType">;
  variant?: "card" | "plain" | undefined;
}

export interface BookingLocationPoint {
  label: string;
  value: string;
  time?: string | null | undefined;
  hint?: string;
}

export interface BookingLocationDetailsProps {
  pickupLocation?: string | null | undefined;
  dropoffLocation?: string | null | undefined;
  stops?: string[] | undefined;
  isHourly?: boolean | undefined;
  durationLabel?: string | null | undefined;
  pickupTime?: string | null | undefined;
  dropoffTime?: string | null | undefined;
  note?: string | null | undefined;
  variant?: "card" | "plain";
  className?: string | undefined;
}

export interface BookingVehicleDetailsProps {
  vehicleCategory?: Item["vehicleCategory"] | undefined;
  vehicleCount?: number | undefined;
}

export interface BookingCustomerDetailsProps {
  passenger?: Passenger | null | undefined;
}

export interface DetailItemProps {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface AnimatedRouteMapProps {
  pickupAddress: string;
  deliveryAddress: string;
  stops?: { address: string }[] | undefined;
  pickupTime?: string | undefined;
  travelDuration?: number | undefined;
  carMarkerSrc?: string | undefined;
  className?: string | undefined;
  wrapperClassName?: string | undefined;
  bottomInset?: number | undefined;
}

export interface BookingColumnOptions {
  basePath?: string;
  onDelete?: (item: Item) => void;
  onCancel?: (item: Item) => void;
  onConfirm?: (item: Item) => void;
}

export interface VehicleCategoryCardProps {
  vehicleCategory: VehicleCategory;
  estimate: Estimate | null;
  isPricing?: boolean;
  isSelected?: boolean;
  vehicleCount: number;
  passengers: number;
  bags: number;
  onSelect: (vehicleCategory: VehicleCategory) => void;
  onVehicleCountChange: (value: number) => void;
  onPassengersChange: (value: number) => void;
  onBagsChange: (value: number) => void;
  onShowSummary: () => void;
}

export interface BookingCardProps {
  booking: Item;
  detailsHref: string;
  onCancel?: (() => void) | undefined;
  onEdit?: (() => void) | undefined;
  className?: string | undefined;
}
