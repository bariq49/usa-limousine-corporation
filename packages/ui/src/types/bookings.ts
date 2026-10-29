import type { ReactNode } from "react";
import type {
  BookingType,
  CalendarEvent,
  CalendarQuery,
  Item,
  Passenger,
  Payment,
} from "../bookings/types";

export interface BookingDetailViewProps {
  booking: Item;
  actions?: ReactNode;
  backHref?: string;
  heading?: { title: string; description: string };
  mapStickyClassName?: string;
  children?: ReactNode;
}

export interface MiniMonthCalendarProps {
  month: Date;
  selected: Date;
  onMonthChange: (date: Date) => void;
  onSelect: (date: Date) => void;
}

export interface BookingCalendarProps {
  events?: CalendarEvent[] | undefined;
  isFetching?: boolean | undefined;
  onQueryChange: (query: CalendarQuery) => void;
  basePath: string;
}

export interface BookingPaymentDetailsProps {
  payment?: Payment | null | undefined;
}

export interface BookingPaymentSummaryProps {
  booking: Pick<Item, "pricing" | "totalPrice" | "extraServices" | "luggage" | "bookingType">;
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

export interface BookingTypeFilterProps {
  options: BookingType[];
  value: BookingType[];
  onChange: (next: BookingType[]) => void;
  className?: string;
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
