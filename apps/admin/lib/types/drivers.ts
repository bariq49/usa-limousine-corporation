import type { BookingStatus, BookingType } from "./bookings";

export type DriverStatus = "ACTIVE" | "INACTIVE";

export type AssignmentStatus = "ACTIVE" | "SUPERSEDED" | "UNASSIGNED";

export type StatsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type Driver = {
  id: string;
  userId: string;
  vehicleCategoryId: string;
  licenseNumber: string | null;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
    createdAt: string;
  };
  vehicleCategory: { id: string; name: string; image: string | null; passengerCount: number };
  _count: { assignments: number };
};

export type DriverQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: DriverStatus | undefined;
  vehicleCategoryId?: string | undefined;
};

export type DriverListResponse = {
  data: Driver[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type DriverPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string | null | undefined;
  vehicleCategoryId: string;
  licenseNumber?: string | null | undefined;
  status: DriverStatus;
};

export type DriverStats = {
  period: StatsPeriod;
  labels: string[];
  totalRides: number;
  totalEarnings: number;
  totalCommission: number;
  rides: number[];
  earnings: number[];
  commission: number[];
};

export type DriverBooking = {
  id: string;
  commissionRate: number;
  commissionAmount: number;
  driverAmount: number;
  note: string | null;
  status: AssignmentStatus;
  assignedAt: string;
  booking: {
    id: string;
    bookingNumber: string;
    status: BookingStatus;
    bookingType: BookingType;
    totalPrice: number;
    address: { pickup?: { address?: string }; dropoff?: { address?: string } | null };
    bookingTime: { pickupDate: string; pickupTime: string };
    passenger: { name?: string };
  };
};

export type DriverBookingsQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  bookingStatus?: BookingStatus | undefined;
};

export type DriverBookingsResponse = Omit<DriverListResponse, "data"> & { data: DriverBooking[] };

export type Assignment = {
  id: string;
  bookingId: string;
  driverId: string;
  commissionRate: number;
  commissionAmount: number;
  driverAmount: number;
  note: string | null;
  status: AssignmentStatus;
  assignedAt: string;
  driver: {
    id: string;
    status: DriverStatus;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
      phone: string | null;
      avatar: string | null;
    };
    vehicleCategory: { id: string; name: string };
  };
};

export type AssignPayload = {
  driverId: string;
  commissionRate: number;
  note?: string | undefined;
};
