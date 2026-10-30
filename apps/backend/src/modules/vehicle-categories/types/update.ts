export type UpdateVehicleCategoryData = {
  name?: string;
  models?: string | null;
  description?: string | null;
  image?: string | null;
  passengerCount?: number;
  sortOrder?: number;
  isActive?: boolean;
};
