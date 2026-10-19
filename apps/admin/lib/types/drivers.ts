export type Status = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "EXPIRED";

export type OnboardingStatus =
  "NOT_STARTED" | "IN_PROGRESS" | "DOCUMENTS_PENDING" | "UNDER_REVIEW" | "COMPLETED";

export type LuggageCapacity = {
  luggageTypeId: string;
  name: string;
  slug: string;
  isSpecial: boolean;
  quantity: number;
  dimensions?: string | null;
  description?: string | null;
};

export type VehicleCategory = {
  id: string;
  name: string;
  image?: string | null;
  passengerCount?: number;
};

export type Vehicle = {
  id?: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  licensePlate?: string | null;
  category?: VehicleCategory | null;
  vehicleCategory?: VehicleCategory | null;
  luggageCapacity?: LuggageCapacity[];
  images?: Record<string, string | null> | null;
};

export type Document = {
  id: string;
  type?: string;
  status?: string;
  documentType: string;
  verificationStatus: string;
  url?: string | null;
  publicId?: string | null;
  documentUrl?: string | null;
  uploadedAt: string;
  expiryDate?: string | null;
};

export type Language = {
  id: string;
  driverId?: string;
  code: string;
  fluency: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ReviewPassenger = {
  name: string;
  avatarUrl?: string | null;
  initials?: string | null;
};

export type Review = {
  id: string;
  passenger: ReviewPassenger;
  route?: string;
  time?: string;
  rating: number;
  comment?: string | null;
};

export type ReviewsSummary = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: Record<number, number>;
};

export type ReviewsResponse = {
  summary: ReviewsSummary;
  reviews: Review[];
};

export type Driver = {
  id: string;
  userId: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  phoneNumber?: string | null;
  operatingCountry?: string | null;
  operatingCity?: string | null;
  homeAddress?: string | null;
  streetName?: string | null;
  houseNo?: string | null;
  postalCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  kvkNo?: string | null;
  licenseExpiry?: string | null;
  yearsExperience?: number | null;
  shift?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  dressesInSuit?: boolean;
  services?: string[];
  status?: string;
  about?: string | null;
  approvalStatus: Status;
  onboardingStatus: OnboardingStatus;
  onboardingPersonal?: boolean;
  onboardingEmailVerified?: boolean;
  onboardingDetails?: boolean;
  onboardingVehicle?: boolean;
  onboardingDocuments?: boolean;
  avatarUrl?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
  };
  vehicle?: Vehicle | null;
  documents?: Document[];
  languages?: Language[];
};

export type Query = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  approvalStatus?: Status | undefined;
  onboardingStatus?: OnboardingStatus | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
};

export type ListResponse = {
  data: Driver[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type RejectPayload = {
  reason: string;
};

export type ActivityType =
  | "PROFILE_UPDATED"
  | "DOCUMENTS_UPDATED"
  | "VEHICLE_UPDATED"
  | "APPLICATION_UNDER_REVIEW"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  | "SUSPENDED"
  | "UNSUSPENDED"
  | "DELETE_REQUESTED"
  | "DELETE_APPROVED"
  | "DELETE_REJECTED"
  | "DELETE_CANCELLED"
  | "TICKET_CREATED"
  | "TICKET_REPLIED"
  | "TICKET_STATUS_UPDATED";

export type ActivityPayload = {
  changedFields?: string[];
  documentTypes?: string[];
  licensePlate?: string;
  kvkNo?: string;
  licenseExpiry?: string;
  reason?: string;
  adminNote?: string;
  requestId?: string;
  ticketId?: string;
  ticketNumber?: string;
  subject?: string;
  category?: string;
  status?: string;
  messageId?: string;
  from?: string;
  to?: string;
  note?: string | null;
};

export type ActivityItem = {
  id: string;
  type: ActivityType | string;
  createdAt: string;
  actorType?: "DRIVER" | "CUSTOMER" | "USER" | null;
  actorId?: string | null;
  data?: ActivityPayload | null;
};

export type ActivityResponse = {
  data: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type GroupBy = "day" | "month" | "year";

/** Query params for driver performance / activity. */
export type Params = {
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  day?: string;
  groupBy?: GroupBy;
};

export type SeriesBucket = {
  key: string;
  label: string;
  finished: number;
  incoming: number;
};

export type ReasonCount = {
  count: number;
  percent: number;
};

export type Performance = {
  timezone: string;
  groupBy: GroupBy;
  startDate: string;
  endDate: string;
  acceptanceRate: number;
  finishedRides: number;
  incomingRequests: number;
  series: SeriesBucket[];
  cancelReasons: {
    total: number;
    youCancelled: ReasonCount;
    youDidNotAccept: ReasonCount;
    clientCancelled: ReasonCount;
    clientNoShow: ReasonCount;
  };
};
