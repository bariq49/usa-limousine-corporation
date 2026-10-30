export type VehicleCategory = {
  id: string;
  name: string;
  models: string | null;
  description: string | null;
  image: string | null;
  passengerCount: number;
  luggageCount: number;
};

export type VehicleCategoriesSectionProps = {
  title?: string;
  description?: string;
  className?: string;
};
