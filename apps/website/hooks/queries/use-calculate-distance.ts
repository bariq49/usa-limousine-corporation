import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    calculateTotalDistance,
    type TotalDistanceResult,
} from "@/lib/api/calculate-distance";

const ROUTE_DISTANCE_STALE_MS = 10 * 60 * 1000;

export function routeDistanceQueryKey(addresses: string[]) {
    return ["route-distance", ...addresses] as const;
}

export function useCalculateRouteDistance() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (addresses: string[]): Promise<TotalDistanceResult> => {
            return queryClient.fetchQuery({
                queryKey: routeDistanceQueryKey(addresses),
                queryFn: () => calculateTotalDistance(addresses),
                staleTime: ROUTE_DISTANCE_STALE_MS,
            });
        },
    });
}
