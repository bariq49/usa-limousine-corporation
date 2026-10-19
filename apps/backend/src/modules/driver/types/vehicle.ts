import type { DriverDocumentType, DriverOnboardingStatus } from "@prisma/client";

export type DriverLuggageCapacityItem = {
  luggageTypeId: string;
  quantity: number;
};

export type DriverVehicleDocumentItem = {
  documentType: DriverDocumentType;
  url: string;
};

export type SaveDriverVehicleData = {
  make: string;
  model: string;
  year: number;
  color: string | null;
  licensePlate: string;
  vehicleCategoryId: string;
  luggageCapacity: DriverLuggageCapacityItem[];
  documents: DriverVehicleDocumentItem[];
  onboardingStatus?: DriverOnboardingStatus;
};
