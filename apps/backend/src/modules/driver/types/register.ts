import type { DriverLanguageFluency, DriverShift } from "@prisma/client";

export type CreateDriverData = {
  userId: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type DriverLanguageItem = {
  code: string;
  fluency: DriverLanguageFluency;
};

export type SaveDriverDetailsData = {
  address: string;
  houseNo: string;
  streetName: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  countryCode: string;
  shift: DriverShift;
  startTime: string | null;
  endTime: string | null;
  operatingCountry: string;
  operatingCity: string;
  languages: DriverLanguageItem[];
  dressesInSuit: boolean;
  services?: string[];
};

export type DriverProgress = {
  personal: boolean;
  emailVerified: boolean;
  details: boolean;
  vehicle: boolean;
  documents: boolean;
};

export type OnboardingStep = "verify-email" | "details" | "vehicle" | "documents" | "completed";
