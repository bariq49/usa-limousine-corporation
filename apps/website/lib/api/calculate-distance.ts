"use client";

import { loadGoogleMaps } from "@usa-limousine-corporation/ui/bookings/google-maps-loader";
import { DISTANCE_UNIT } from "@/constants/app-default";

const METERS_PER_MILE = 1609.344;

export interface DistanceResult {
    distanceMiles: number;
    distanceKm: number;
    distanceText: string;
    durationMinutes: number;
    durationText: string;
}

export interface TotalDistanceResult {
    totalDistanceMiles: number;
    totalDistanceKm: number;
    totalDistanceText: string;
    totalDurationMinutes: number;
    totalDurationText: string;
    legs: DistanceResult[];
}

function milesToKm(miles: number): number {
    return miles / 0.621371;
}

function formatDistanceLabel(value: number): string {
    return `${value.toFixed(1)} ${DISTANCE_UNIT}`;
}

function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${Math.round(minutes)} mins`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
}

export async function calculateDistance(
    origin: string,
    destination: string
): Promise<DistanceResult> {
    await loadGoogleMaps();

    return new Promise((resolve, reject) => {
        if (!window.google?.maps) {
            reject(new Error("Google Maps is not loaded"));
            return;
        }

        const service = new google.maps.DistanceMatrixService();

        service.getDistanceMatrix(
            {
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL,
            },
            (response, status) => {
                if (status !== google.maps.DistanceMatrixStatus.OK || !response) {
                    reject(new Error(`Distance Matrix API failed: ${status}`));
                    return;
                }

                const element = response.rows[0]?.elements[0];

                if (!element || element.status !== "OK") {
                    reject(
                        new Error(
                            `Could not calculate distance: ${element?.status ?? "NO_RESULT"}`
                        )
                    );
                    return;
                }

                const distanceMiles = element.distance.value / METERS_PER_MILE;
                const distanceKm = milesToKm(distanceMiles);
                const durationMinutes = element.duration.value / 60;

                resolve({
                    distanceMiles: Math.round(distanceMiles * 10) / 10,
                    distanceKm: Math.round(distanceKm * 10) / 10,
                    distanceText: formatDistanceLabel(distanceMiles),
                    durationMinutes: Math.round(durationMinutes),
                    durationText: formatDuration(durationMinutes),
                });
            }
        );
    });
}

export async function calculateTotalDistance(
    addresses: string[]
): Promise<TotalDistanceResult> {
    if (addresses.length < 2) {
        throw new Error("At least 2 addresses are required to calculate distance");
    }

    const legPromises: Promise<DistanceResult>[] = [];

    for (let i = 0; i < addresses.length - 1; i++) {
        legPromises.push(calculateDistance(addresses[i], addresses[i + 1]));
    }

    const legs = await Promise.all(legPromises);

    const totalDistanceMiles = legs.reduce((sum, l) => sum + l.distanceMiles, 0);
    const totalDistanceKm = legs.reduce((sum, l) => sum + l.distanceKm, 0);
    const totalDurationMinutes = legs.reduce(
        (sum, l) => sum + l.durationMinutes,
        0
    );

    return {
        totalDistanceMiles: Math.round(totalDistanceMiles * 10) / 10,
        totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
        totalDistanceText: formatDistanceLabel(totalDistanceMiles),
        totalDurationMinutes: Math.round(totalDurationMinutes),
        totalDurationText: formatDuration(totalDurationMinutes),
        legs,
    };
}
