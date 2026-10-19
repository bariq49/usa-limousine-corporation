export type DriverApplicationEmailStatus = "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export type SendApplicationStatusEmail = {
  email: string;
  status: DriverApplicationEmailStatus;
  reason?: string;
};

export type SendApplicationReceivedEmails = {
  driverEmail: string;
  adminEmail?: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  homeAddress?: string | null;
  shift?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  operatingCountry?: string | null;
  operatingCity?: string | null;
  vehicleSummary?: string | null;
};

export type SendDriverCredentialsEmail = {
  email: string;
  password: string;
};
