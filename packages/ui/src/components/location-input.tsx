/// <reference types="google.maps" />
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Close, LocateFixed, Location, Plane, Train } from "../svg";
import { cn } from "../utils/cn";
import { isAirportAddress, isTrainAddress } from "../utils/places";
import { loadGoogleMaps } from "./bookings/google-maps-loader";

const PANEL_EASE = [0.22, 1, 0.36, 1] as const;

export interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  className?: string | undefined;
  /** Shows a "Use my location" row; the caller fills in the address. */
  onUseCurrentLocation?: (() => Promise<void> | void) | undefined;
}

const US_BOUNDS: google.maps.LatLngBoundsLiteral = {
  north: 49.4,
  south: 24.5,
  west: -125.0,
  east: -66.9,
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

export const LocationInput = React.forwardRef<HTMLInputElement, LocationInputProps>(
  ({ value, onChange, placeholder, className, onUseCurrentLocation }, ref) => {
    const [predictions, setPredictions] = React.useState<
      google.maps.places.AutocompletePrediction[]
    >([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [locating, setLocating] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [dropdownPosition, setDropdownPosition] = React.useState<DropdownPosition | null>(null);
    const [isMobile, setIsMobile] = React.useState(false);

    const closingRef = React.useRef(false);
    const prevValueRef = React.useRef(value);

    const closeDropdown = React.useCallback(
      (revertValue = false) => {
        closingRef.current = true;
        setIsOpen(false);
        if (revertValue) {
          onChange(prevValueRef.current);
        }
        setTimeout(() => {
          closingRef.current = false;
        }, 200);
      },
      [onChange],
    );

    React.useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 640);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const serviceRef = React.useRef<google.maps.places.AutocompleteService | null>(null);
    const placesServiceRef = React.useRef<google.maps.places.PlacesService | null>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const updateDropdownPosition = React.useCallback(() => {
      const input = inputRef.current;
      if (!input) return;

      const rect = input.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }, []);

    React.useEffect(() => {
      const initServices = async () => {
        try {
          await loadGoogleMaps();

          if (window.google?.maps?.places && !serviceRef.current) {
            serviceRef.current = new window.google.maps.places.AutocompleteService();
            const dummy = document.createElement("div");
            placesServiceRef.current = new window.google.maps.places.PlacesService(dummy);
          }
        } catch (err) {
          console.error("Failed to load Google Maps Services", err);
        }
      };
      void initServices();
    }, []);

    React.useEffect(() => {
      if (!isOpen) return;

      updateDropdownPosition();

      const handleReposition = () => updateDropdownPosition();
      window.addEventListener("resize", handleReposition);
      window.addEventListener("scroll", handleReposition, true);

      return () => {
        window.removeEventListener("resize", handleReposition);
        window.removeEventListener("scroll", handleReposition, true);
      };
    }, [isOpen, updateDropdownPosition]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      if (!newValue || newValue.length < 2) {
        setPredictions([]);
        setLoading(false);
        if (!isMobile) {
          setIsOpen(false);
        }
        return;
      }

      if (serviceRef.current) {
        setLoading(true);
        setIsOpen(true);
        updateDropdownPosition();
        serviceRef.current.getPlacePredictions(
          {
            input: newValue,
            bounds: US_BOUNDS,
            componentRestrictions: { country: "us" },
          },
          (results, status) => {
            setLoading(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              setPredictions(results);
              setIsOpen(true);
              updateDropdownPosition();
            } else {
              setPredictions([]);
              if (!isMobile) {
                setIsOpen(false);
              }
            }
          },
        );
      }
    };

    const handleClear = () => {
      onChange("");
      setPredictions([]);
      setLoading(false);
    };

    const handleUseCurrentLocation = () => {
      if (!onUseCurrentLocation || locating) return;
      setLocating(true);
      void Promise.resolve(onUseCurrentLocation()).finally(() => {
        setLocating(false);
        closeDropdown(false);
      });
    };

    const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
      if (placesServiceRef.current) {
        placesServiceRef.current.getDetails(
          {
            placeId: prediction.place_id,
            fields: ["formatted_address", "name", "address_components", "types", "geometry"],
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              const isNamedPlace = place.types?.some((type: string) =>
                ["airport", "lodging", "establishment", "point_of_interest"].includes(type),
              );

              let nextValue = "";
              if (isNamedPlace && place.name && place.formatted_address) {
                if (place.formatted_address.toLowerCase().includes(place.name.toLowerCase())) {
                  nextValue = place.formatted_address;
                } else {
                  nextValue = `${place.name}, ${place.formatted_address}`;
                }
              } else {
                nextValue = place.formatted_address || place.name || "";
              }

              onChange(nextValue);
              closeDropdown(false);
            }
          },
        );
      }
    };

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const clickedInput = containerRef.current?.contains(target);
        const clickedDropdown = dropdownRef.current?.contains(target);
        if (!clickedInput && !clickedDropdown) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getSuggestionIcon = (prediction: google.maps.places.AutocompletePrediction) => {
      const types = prediction.types ?? [];
      const description = prediction.description;
      const isAirport = types.includes("airport") || isAirportAddress(description);
      const isTrain =
        types.some((type) =>
          [
            "train_station",
            "transit_station",
            "subway_station",
            "light_rail_station",
            "bus_station",
          ].includes(type),
        ) || isTrainAddress(description);

      const iconClassName = "size-5 text-default-900";

      if (isAirport) return <Plane className={iconClassName} aria-hidden />;
      if (isTrain) return <Train className={iconClassName} aria-hidden />;
      return <Location className={iconClassName} aria-hidden />;
    };

    return (
      <div ref={containerRef} className="relative w-full">
        <input
          type="text"
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={(e) => {
            if (closingRef.current) return;

            if (isMobile) {
              e.target.blur();
              prevValueRef.current = value;
              updateDropdownPosition();
              setIsOpen(true);
            } else if (value.length >= 2 && (predictions.length > 0 || loading)) {
              updateDropdownPosition();
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={cn(className)}
        />

        {mounted
          ? createPortal(
              <AnimatePresence>
                {isOpen && dropdownPosition && (isMobile || loading || predictions.length > 0) ? (
                  <motion.div
                    ref={dropdownRef}
                    key="location-autocomplete-dropdown"
                    data-location-dropdown
                    // Keep focus in the address input while picking, so dialogs around it
                    // don't treat the click as focus leaving them.
                    onMouseDown={(event) => {
                      if (!isMobile) event.preventDefault();
                    }}
                    suppressHydrationWarning
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: PANEL_EASE }}
                    style={
                      isMobile
                        ? {
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }
                        : {
                            position: "fixed",
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            width: dropdownPosition.width,
                            transformOrigin: "top center",
                          }
                    }
                    className={cn(
                      "pointer-events-auto z-[9999] overflow-hidden bg-white",
                      isMobile ? "flex flex-col" : "rounded-md border border-default-200 shadow-lg",
                    )}
                  >
                    {isMobile && (
                      <div className="flex items-center gap-3 p-4 border-b border-default-100 bg-white shrink-0">
                        <button
                          type="button"
                          onClick={() => closeDropdown(true)}
                          className="flex h-9 w-9 items-center justify-center rounded-md bg-primary shrink-0 text-primary-foreground"
                        >
                          <ChevronLeft width={18} height={18} />
                        </button>
                        <div className="relative flex-1">
                          <Location
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-default-400"
                            aria-hidden
                          />
                          <input
                            autoFocus
                            value={value}
                            onChange={handleInputChange}
                            placeholder="Address, airport, hotel, ..."
                            className="w-full h-10 bg-default-100 border border-transparent rounded-md py-2 pl-9 pr-9 text-[15px] focus:outline-none"
                          />
                          {value ? (
                            <button
                              type="button"
                              aria-label="Clear location"
                              onClick={handleClear}
                              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-default-600"
                            >
                              <Close className="size-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
                    {isMobile && (loading || locating) ? (
                      <div className="mx-4 mt-3 h-1 shrink-0 overflow-hidden rounded-full bg-default-100">
                        <motion.div
                          className="h-full w-1/3 rounded-full bg-default-900"
                          initial={{ x: "-100%" }}
                          animate={{ x: "300%" }}
                          transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
                        />
                      </div>
                    ) : null}
                    <div className="flex-1 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {isMobile && onUseCurrentLocation ? (
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={locating}
                          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-default-50 disabled:opacity-60"
                        >
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-default-100">
                            <LocateFixed className="size-5 text-default-900" aria-hidden />
                          </div>
                          <span className="text-sm font-semibold text-default-900">
                            {locating ? "Finding your location..." : "Use my location"}
                          </span>
                        </button>
                      ) : null}
                      {loading && !isMobile
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <div
                              key={`location-skeleton-${index}`}
                              className="flex w-full items-center gap-3 px-3 py-2.5"
                              aria-hidden
                            >
                              <div className="size-11 shrink-0 animate-pulse rounded-xl bg-default-100" />
                              <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="h-3.5 w-17/25 animate-pulse rounded-sm bg-default-200" />
                                <div className="h-3 w-22/25 animate-pulse rounded-sm bg-default-100" />
                              </div>
                            </div>
                          ))
                        : predictions.slice(0, 6).map((prediction) => {
                            const mainText = prediction.structured_formatting.main_text;
                            const secondaryText = prediction.structured_formatting.secondary_text;

                            return (
                              <button
                                key={prediction.place_id}
                                type="button"
                                onClick={() => handleSelect(prediction)}
                                className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-default-50"
                              >
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-default-100">
                                  {getSuggestionIcon(prediction)}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col justify-center gap-px">
                                  <span
                                    suppressHydrationWarning
                                    className="truncate text-sm font-semibold leading-tight text-default-900"
                                  >
                                    {mainText}
                                  </span>
                                  {secondaryText && (
                                    <span
                                      suppressHydrationWarning
                                      className="truncate text-xs font-normal leading-snug text-default-500"
                                    >
                                      {secondaryText}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                    </div>

                    <div className="flex items-center gap-2.5 border-t border-default-100 px-3.5 py-2.5">
                      <span
                        suppressHydrationWarning
                        className="shrink-0 text-3xs font-medium uppercase tracking-wider text-default-400"
                      >
                        Powered by
                      </span>
                      <span className="h-3.5 w-px shrink-0 bg-default-200" aria-hidden />
                      <span
                        suppressHydrationWarning
                        className="truncate text-xs font-semibold text-default-900"
                      >
                        USA <span className="font-bold text-primary">Limousine</span>
                      </span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>,
              document.body,
            )
          : null}
      </div>
    );
  },
);

LocationInput.displayName = "LocationInput";
