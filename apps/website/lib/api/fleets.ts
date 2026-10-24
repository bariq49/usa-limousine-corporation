import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type {
  ApiPaginated,
  ApiPricedVehicleCategory,
  ApiVehicleCategory,
  ByDistanceParams,
  CategoryByDistance,
  CategoryPriceBreakdown,
} from "@/types/vehicle-category.types";

function luggageTotal(category: ApiVehicleCategory): number {
  return (category.luggageCapacity ?? []).reduce((sum, item) => sum + item.quantity, 0);
}

function toCategoryByDistance(
  category: ApiVehicleCategory,
  priceBreakdown: CategoryPriceBreakdown,
  allowRequestQuote = false,
): CategoryByDistance {
  return {
    _id: category.id,
    name: category.name,
    image: category.image || null,
    description: category.description ?? undefined,
    passengers: category.passengerCount,
    suitcases: luggageTotal(category),
    allowRequestQuote,
    priceBreakdown,
  };
}

/** Categories priced for a trip distance in miles; unpriced categories are left out. */
export const getCategoriesByDistance = async (
  params: ByDistanceParams,
): Promise<CategoryByDistance[]> => {
  const response = await api.get(API_ROUTES.VEHICLE_PRICING, {
    params: {
      distance: Math.round(params.distance * 100) / 100,
      isAirport: Boolean(params.isAirport),
    },
  });
  const categories: ApiPricedVehicleCategory[] = response.data ?? [];
  return categories.map((category) => toCategoryByDistance(category, category.priceBreakdown));
};

/** Hourly hire is quoted by our team, so every active category is offered as a quote request. */
export const getCategoriesForHourly = async (): Promise<CategoryByDistance[]> => {
  const response = await api.get(API_ROUTES.VEHICLE_CATEGORIES, { params: { limit: 100 } });
  const page: ApiPaginated<ApiVehicleCategory> | undefined = response.data;
  return (page?.data ?? []).map((category) => toCategoryByDistance(category, { oneWayTotalPrice: 0, returnTotalPrice: 0 }, true));
};
