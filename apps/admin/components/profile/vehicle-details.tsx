"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { useVehicle } from "@/hooks/queries/use-drivers";
import Image from "next/image";
import {
  Car,
  Luggage,
  Bicycle,
  WinterSport,
  Stroller,
  GolfBag,
  Ski,
  Wheelchair,
  Water,
  LargeCase,
  MediumCase,
  CabinBag,
} from "@usa-limousine-corporation/ui/svg";
import type { LuggageCapacity } from "@/lib/types/drivers";
import { VehicleSkeleton } from "../skeletons/vehicle-skeleton";

function getLuggageIcon(luggage: { slug?: string; name?: string }) {
  const key = `${luggage.slug || ""} ${luggage.name || ""}`.toLowerCase();
  if (key.includes("large")) return LargeCase;
  if (key.includes("medium")) return MediumCase;
  if (key.includes("cabin") || key.includes("hand") || key.includes("carry")) return CabinBag;
  if (key.includes("bicycle") || key.includes("bike")) return Bicycle;
  if (key.includes("stroller") || key.includes("baby")) return Stroller;
  if (key.includes("ski")) return Ski;
  if (key.includes("winter") || key.includes("snow")) return WinterSport;
  if (key.includes("golf")) return GolfBag;
  if (key.includes("wheelchair") || key.includes("accessible")) return Wheelchair;
  if (key.includes("water")) return Water;
  return Luggage;
}

export interface VehicleDetailsProps {
  driverId: string;
}

export function VehicleDetails({ driverId }: VehicleDetailsProps) {
  const { data: vehicle, isLoading } = useVehicle(driverId);
  if (isLoading) {
    return <VehicleSkeleton />;
  }
  const frontImage =
    vehicle?.images?.["frontView"] ||
    (vehicle?.images ? Object.values(vehicle.images).find(Boolean) : null);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="flex flex-col gap-6 xl:col-span-6">
        <Card className="overflow-hidden rounded-lg border border-border bg-muted relative w-full h-full min-h-[300px] shadow-xs">
          {frontImage ? (
            <>
              <Image
                src={frontImage}
                alt={`${vehicle?.make || "Unknown"} ${vehicle?.model || "Vehicle"}`}
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-sm md:text-base text-white/80 font-medium drop-shadow-sm mb-1">
                  {vehicle?.licensePlate || "No Plate"} · {vehicle?.category?.name || "Standard"} ·{" "}
                  {vehicle?.color || "Unknown Color"}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold drop-shadow-md">
                  {vehicle?.make || "Unknown"} {vehicle?.model || "Vehicle"}
                </h3>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
              <Car className="w-12 h-12" />
              <span className="text-sm font-medium">No Image Available</span>
            </div>
          )}
        </Card>
      </div>
      <div className="flex flex-col gap-6 xl:col-span-6">
        <Card className="h-fit w-full shadow-xs border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 -ml-2">
              <Luggage className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg font-semibold text-default-900">
                Standard Luggage
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {vehicle?.luggageCapacity &&
            vehicle.luggageCapacity.filter((l: LuggageCapacity) => !l.isSpecial).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicle.luggageCapacity
                  .filter((l: LuggageCapacity) => !l.isSpecial)
                  .map((luggage: LuggageCapacity) => {
                    const Icon = getLuggageIcon(luggage);
                    return (
                      <Card
                        key={luggage.luggageTypeId}
                        className="p-4 rounded-lg border border-border shadow-xs flex flex-col items-center text-center relative"
                      >
                        <Icon className="w-6 h-6 text-slate-500 mb-2" />
                        <p className="font-bold text-sm mb-0.5">{luggage.name}</p>
                        {(luggage.dimensions || luggage.description) && (
                          <p className="text-muted-foreground text-xs">
                            {luggage.dimensions || luggage.description}
                          </p>
                        )}

                        <div className="mt-2 bg-black text-orange-500 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 border-black tracking-widest">
                          {luggage.quantity.toString().padStart(2, "0")}
                        </div>
                      </Card>
                    );
                  })}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
                <p className="text-muted-foreground text-sm italic">
                  No standard luggage capacity information available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {vehicle?.luggageCapacity &&
          vehicle.luggageCapacity.filter((l: LuggageCapacity) => l.isSpecial).length > 0 && (
            <Card className="h-fit w-full shadow-xs border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 -ml-2">
                  <Luggage className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg font-semibold text-default-900">
                    Special Luggage
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vehicle.luggageCapacity
                    .filter((l: LuggageCapacity) => l.isSpecial)
                    .map((luggage: LuggageCapacity) => {
                      const Icon = getLuggageIcon(luggage);
                      return (
                        <div
                          key={luggage.luggageTypeId}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border shadow-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-medium text-sm text-default-900 truncate">
                              {luggage.name}
                            </span>
                          </div>
                          <div className="bg-black text-orange-500 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] tracking-widest shrink-0 ml-2">
                            {luggage.quantity}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
