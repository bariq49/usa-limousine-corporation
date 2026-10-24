"use client";

import { useEffect, useMemo, useRef } from "react";
import { loadGoogleMaps } from "./google-maps-loader";

// --- Constants & Styles ---
const SECONDARY_COLOR_FALLBACK = "#C9A84C";

const getSecondaryColor = () => {
  if (typeof window === "undefined") return SECONDARY_COLOR_FALLBACK;
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--color-secondary").trim() ||
    SECONDARY_COLOR_FALLBACK
  );
};
const EMPTY_STOPS: { address: string }[] = [];

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

const getMarkerIcon = (label: string): google.maps.Icon => ({
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="#111827"/>
      <text x="16" y="22" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${label}</text>
    </svg>
  `)}`,
  scaledSize: new google.maps.Size(24, 32),
  anchor: new google.maps.Point(12, 32),
});

const getCarIcon = (color: string): google.maps.Icon => ({
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="#ffffff" stroke-width="2"/>
    </svg>
  `)}`,
  scaledSize: new google.maps.Size(24, 24),
  anchor: new google.maps.Point(12, 12),
});

// --- Main Component ---
type Props = {
  pickupAddress: string;
  deliveryAddress: string;
  stops?: { address: string }[] | undefined;
};

/** Google map that draws the trip route and animates a marker along it. */
export function AnimatedRouteMap({ pickupAddress, deliveryAddress, stops = EMPTY_STOPS }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const animatedMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopWaypoints = useMemo(
    () =>
      stops
        .filter((s) => s.address?.trim())
        .map((s) => ({ location: s.address.trim(), stopover: true })),
    [stops],
  );

  const isValidTrip = Boolean(pickupAddress.trim() && deliveryAddress.trim());

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!isValidTrip || !mapRef.current) return;

      await loadGoogleMaps();
      if (cancelled || !window.google?.maps || !mapRef.current) return;

      const secondaryColor = getSecondaryColor();

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 11,
        disableDefaultUI: true,
        styles: MAP_STYLES,
      });
      mapInstanceRef.current = map;

      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: { strokeColor: secondaryColor, strokeWeight: 6, strokeOpacity: 0.9 },
      });
      directionsRenderer.setMap(map);
      directionsRendererRef.current = directionsRenderer;

      new google.maps.DirectionsService().route(
        {
          origin: pickupAddress,
          destination: deliveryAddress,
          waypoints: stopWaypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status !== "OK" || !result || cancelled) return;

          directionsRenderer.setDirections(result);
          const route = result.routes?.[0];
          if (!route) return;

          if (route.bounds)
            map.fitBounds(route.bounds, { top: 50, right: 50, bottom: 50, left: 50 });

          const points: google.maps.LatLng[] = [];
          route.legs?.forEach((l) =>
            l.steps?.forEach((s) => s.path?.forEach((p) => points.push(p))),
          );

          const firstLeg = route.legs?.[0];
          const lastLeg = route.legs?.[route.legs.length - 1];

          if (firstLeg?.start_location)
            new google.maps.Marker({
              position: firstLeg.start_location,
              map,
              icon: getMarkerIcon("A"),
            });
          if (lastLeg?.end_location)
            new google.maps.Marker({
              position: lastLeg.end_location,
              map,
              icon: getMarkerIcon("B"),
            });

          const firstPoint = points[0];
          if (!firstPoint) return;

          const animatedMarker = new google.maps.Marker({
            position: firstPoint,
            map,
            icon: getCarIcon(secondaryColor),
            zIndex: 1000,
            optimized: false,
          });

          animatedMarkerRef.current = animatedMarker;

          const animationDurationMs = 10000;
          let startedAt = 0;
          const lastIndex = points.length - 1;

          const animate = (time: number) => {
            if (cancelled || !animatedMarkerRef.current) return;
            if (!startedAt) startedAt = time;

            const progress = Math.min((time - startedAt) / animationDurationMs, 1);
            const targetIdx = Math.floor(progress * lastIndex);

            if (points[targetIdx]) animatedMarkerRef.current.setPosition(points[targetIdx]);

            if (progress >= 1) startedAt = time;
            animationFrameRef.current = requestAnimationFrame(animate);
          };
          animationFrameRef.current = requestAnimationFrame(animate);
        },
      );
    };

    initMap();

    return () => {
      cancelled = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (animatedMarkerRef.current) animatedMarkerRef.current.setMap(null);
      if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
      mapInstanceRef.current = null;
    };
  }, [isValidTrip, pickupAddress, deliveryAddress, stopWaypoints]);

  if (!isValidTrip) return null;

  return (
    <div className="w-full">
      <div className="h-hero-media min-h-75 sm:h-87.5 lg:h-87.5 overflow-hidden relative rounded-none border-0 shadow-none lg:rounded-sm lg:border lg:border-border group">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
