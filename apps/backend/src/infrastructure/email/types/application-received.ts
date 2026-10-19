export interface ApplicationReceived {
  to: string;
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
}

export type AdminApplicationReceived = ApplicationReceived;
