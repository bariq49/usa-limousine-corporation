import type { DriverLanguageFluency, DriverShift } from "@prisma/client";

export type UpdateDriverProfileData = {
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  about: string | null;
  homeAddress: string | null;
  houseNo: string | null;
  streetName: string | null;
  postalCode: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  countryCode: string | null;
  yearsExperience: number | null;
  shift: DriverShift;
  startTime: string | null;
  endTime: string | null;
  dressesInSuit: boolean;
  services: string[];
  languages?: Array<{
    code: string;
    fluency: DriverLanguageFluency;
  }>;
};
