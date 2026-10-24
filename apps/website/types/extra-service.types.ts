export type ExtraServiceType = "CHILD_SEAT" | "EXTRA";

export type ExtraService = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  type: ExtraServiceType;
  maxQuantity: number;
};

export type LuggageType = {
  id: string;
  name: string;
  description?: string | null;
  dimensions?: string | null;
  image?: string | null;
  price?: number | null;
};
