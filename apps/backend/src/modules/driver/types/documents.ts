import type { DriverVehicleDocumentItem } from "./vehicle";

export type SaveDriverDocumentsData = {
  documents: DriverVehicleDocumentItem[];
  kvkNo?: string;
  licenseExpiry?: Date;
  onboardingDocuments?: boolean;
};
