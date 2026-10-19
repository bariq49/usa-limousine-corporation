"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

const ROUTE_COLOR = "#FC7C1E";
const CALLOUT_ACCENT = "#FC7C1E";
const DEFAULT_CENTER = { lat: 52.3676, lng: 4.9041 };
const CAR_MARKER_SRC = "/assets/images/map_car_marker.png";

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f8f9fa" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5f6368" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#edf2f7" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#718096" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e2f0d9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e8eaed" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#d1d5db" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#cbe3f5" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#60a5fa" }] },
];

const PLANE_SVG_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z";
const TRAIN_SVG_PATH =
  "M12 2c-4 0-8 .5-8 4v9.5A3.5 3.5 0 0 0 7.5 19L6 21h2l1.5-2h5L16 21h2l-1.5-2A3.5 3.5 0 0 0 20 15.5V6c0-3.5-4-4-8-4ZM7.5 16.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm9 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5ZM7 7h10v4H7V7Z";
const HOTEL_SVG_PATH =
  "M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z";
const CAR_SVG_PATH =
  "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z";

type LocationType = "airport" | "train" | "hotel" | "generic";

type Props = {
  pickupAddress?: string | undefined;
  dropoffAddress?: string | undefined;
  pickupTimeLabel?: string | undefined;
  durationMinutes?: number | undefined;
  className?: string | undefined;
};

function detectLocationType(address: string): LocationType {
  const lower = address.toLowerCase();
  if (
    lower.includes("airport") ||
    lower.includes("schiphol") ||
    /\b(ams|lhr|lgw|cdg|fra)\b/.test(lower)
  ) {
    return "airport";
  }
  if (
    lower.includes("station") ||
    lower.includes("centraal") ||
    lower.includes("train") ||
    lower.includes("railway")
  ) {
    return "train";
  }
  if (
    lower.includes("hotel") ||
    lower.includes("inn ") ||
    lower.includes("resort") ||
    lower.includes("suites")
  ) {
    return "hotel";
  }
  return "generic";
}

function getLocationIconSvg(locationType: LocationType, fillColor: string, size = 18): string {
  const path =
    locationType === "airport"
      ? PLANE_SVG_PATH
      : locationType === "train"
        ? TRAIN_SVG_PATH
        : locationType === "hotel"
          ? HOTEL_SVG_PATH
          : CAR_SVG_PATH;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0;"><path d="${path}"/></svg>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getAddressTitle(address: string): string {
  if (!address) return "";
  const parts = address.split(",");
  if (parts.length > 1) {
    const first = (parts[0] || "").trim();
    if (first.length < 10 && parts[1]) {
      return `${first}, ${parts[1].trim()}`;
    }
    return first;
  }
  return address.trim();
}

function truncateTitle(title: string, maxLen = 26): string {
  if (title.length <= maxLen) return title;
  return `${title.slice(0, maxLen - 1)}…`;
}

function addMinutesToTimeLabel(rawTime: string, addMinutesCount?: number): string {
  let hours = 12;
  let minutes = 0;

  if (rawTime) {
    const match = rawTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = Number(match[1]);
      minutes = Number(match[2]);
      const period = match[3]?.toUpperCase();
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
    }
  }

  if (typeof addMinutesCount === "number" && !Number.isNaN(addMinutesCount)) {
    const totalMinutes = hours * 60 + minutes + addMinutesCount;
    const finalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    hours = Math.floor(finalMinutes / 60);
    minutes = finalMinutes % 60;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createCalloutOverlay({
  position,
  title,
  time,
  locationType,
  variant,
  placement,
  accentColor,
}: {
  position: google.maps.LatLng;
  title: string;
  time: string;
  locationType: LocationType;
  variant: "pickup" | "dropoff";
  placement: "above" | "below";
  accentColor: string;
}): google.maps.OverlayView {
  class CalloutOverlay extends google.maps.OverlayView {
    private container: HTMLDivElement;
    private zoomListener: google.maps.MapsEventListener | null = null;
    private currentScale = 1;

    constructor() {
      super();
      this.container = document.createElement("div");
      this.container.style.cssText =
        "position:absolute;cursor:default;user-select:none;pointer-events:auto;transition:transform 0.15s ease-out;will-change:transform,left,top;";
      this.container.style.zIndex = variant === "dropoff" ? "105" : "100";
      this.renderLayout();
    }

    private renderLayout() {
      this.container.innerHTML = "";
      const isPickup = variant === "pickup";
      const badgeBg = isPickup ? "#111827" : accentColor;
      const typeLabel = isPickup ? "Pick up" : "Drop-off";
      const iconSvg = getLocationIconSvg(locationType, "#ffffff", 18);
      const truncatedTitle = truncateTitle(escapeHtml(title));

      const squareMarkerEl = document.createElement("div");
      squareMarkerEl.style.cssText =
        "width:13px;height:13px;background:#111827;border:2px solid #ffffff;border-radius:3px;box-shadow:0 2px 5px rgba(0,0,0,0.3);box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:2;";
      squareMarkerEl.innerHTML =
        '<div style="width:3.5px;height:3.5px;background:#ffffff;border-radius:1px;"></div>';

      const connectorStemEl = document.createElement("div");
      connectorStemEl.style.cssText = "width:2px;height:9px;background:#111827;flex-shrink:0;";

      const badgeCardEl = document.createElement("div");
      badgeCardEl.style.cssText =
        "display:inline-flex;align-items:stretch;background:#ffffff;border-radius:7px;overflow:hidden;box-shadow:0 4px 18px -2px rgba(0,0,0,0.2),0 2px 6px -1px rgba(0,0,0,0.1);border:1px solid rgba(0,0,0,0.08);font-family:system-ui,-apple-system,sans-serif;white-space:nowrap;";
      badgeCardEl.innerHTML = `
        <div style="padding:6px 13px;display:flex;flex-direction:column;justify-content:center;background:#ffffff;">
          <span style="font-size:11.5px;font-weight:500;color:#6b7280;line-height:1.25;">${typeLabel}</span>
          <span style="font-size:14px;font-weight:700;color:#121110;line-height:1.3;">${truncatedTitle}</span>
        </div>
        <div style="background:${badgeBg};padding:6px 13px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:60px;gap:3px;">
          ${iconSvg}
          <span style="font-size:11.5px;font-weight:700;color:#ffffff;line-height:1.2;letter-spacing:-0.2px;">${escapeHtml(time)}</span>
        </div>
      `;

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:flex;flex-direction:column;align-items:center;";

      if (placement === "above") {
        wrapper.appendChild(badgeCardEl);
        wrapper.appendChild(connectorStemEl);
        wrapper.appendChild(squareMarkerEl);
        this.container.style.transformOrigin = "center calc(100% - 6.5px)";
        this.container.style.transform = `translate(-50%, calc(-100% + 6.5px)) scale(${this.currentScale})`;
      } else {
        wrapper.appendChild(squareMarkerEl);
        wrapper.appendChild(connectorStemEl);
        wrapper.appendChild(badgeCardEl);
        this.container.style.transformOrigin = "center 6.5px";
        this.container.style.transform = `translate(-50%, -6.5px) scale(${this.currentScale})`;
      }

      this.container.appendChild(wrapper);
    }

    private updateScale() {
      const map = this.getMap() as google.maps.Map | null;
      if (!map) return;
      const zoom = map.getZoom() ?? 12;
      this.currentScale = Math.max(0.85, Math.min(1.2, 0.55 + zoom * 0.038));
      if (placement === "above") {
        this.container.style.transform = `translate(-50%, calc(-100% + 6.5px)) scale(${this.currentScale})`;
      } else {
        this.container.style.transform = `translate(-50%, -6.5px) scale(${this.currentScale})`;
      }
    }

    override onAdd() {
      this.getPanes()?.floatPane.appendChild(this.container);
      const map = this.getMap() as google.maps.Map | null;
      if (map) {
        this.updateScale();
        this.zoomListener = map.addListener("zoom_changed", () => this.updateScale());
      }
    }

    override draw() {
      const projection = this.getProjection();
      if (!projection) return;
      const point = projection.fromLatLngToDivPixel(position);
      if (!point) return;
      this.container.style.left = `${point.x}px`;
      this.container.style.top = `${point.y}px`;
    }

    override onRemove() {
      if (this.zoomListener) {
        google.maps.event.removeListener(this.zoomListener);
        this.zoomListener = null;
      }
      this.container.parentElement?.removeChild(this.container);
    }
  }

  return new CalloutOverlay();
}

type CarOverlayInstance = google.maps.OverlayView & {
  updatePositionAndHeading: (position: google.maps.LatLng, heading: number) => void;
};

function createCarOverlay(
  initialPosition: google.maps.LatLng,
  initialHeading: number,
): CarOverlayInstance {
  class CarOverlay extends google.maps.OverlayView implements CarOverlayInstance {
    private container: HTMLDivElement;
    private currentPosition: google.maps.LatLng = initialPosition;
    private currentHeading = initialHeading;
    private currentScale = 1;
    private zoomListener: google.maps.MapsEventListener | null = null;

    constructor() {
      super();
      this.container = document.createElement("div");
      this.container.style.cssText =
        "position:absolute;pointer-events:none;z-index:250;transform-origin:center center;width:40px;height:40px;will-change:transform,left,top;";

      const img = document.createElement("img");
      img.src = CAR_MARKER_SRC;
      img.alt = "Vehicle";
      img.style.cssText =
        "width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.4));";
      this.container.appendChild(img);
    }

    private applyTransform() {
      this.container.style.transform = `translate(-50%, -50%) rotate(${this.currentHeading}deg) scale(${this.currentScale})`;
    }

    private updateScale() {
      const map = this.getMap() as google.maps.Map | null;
      if (!map) return;
      const zoom = map.getZoom() ?? 12;
      this.currentScale = Math.max(0.75, Math.min(1.45, 0.45 + zoom * 0.05));
      this.applyTransform();
    }

    updatePositionAndHeading(position: google.maps.LatLng, heading: number) {
      this.currentPosition = position;
      this.currentHeading = heading;
      const projection = this.getProjection();
      if (projection) {
        const point = projection.fromLatLngToDivPixel(position);
        if (point) {
          this.container.style.left = `${point.x}px`;
          this.container.style.top = `${point.y}px`;
        }
      }
      this.applyTransform();
    }

    override onAdd() {
      this.getPanes()?.overlayMouseTarget.appendChild(this.container);
      const map = this.getMap() as google.maps.Map | null;
      if (map) {
        this.updateScale();
        this.zoomListener = map.addListener("zoom_changed", () => this.updateScale());
      }
    }

    override draw() {
      const projection = this.getProjection();
      if (!projection) return;
      const point = projection.fromLatLngToDivPixel(this.currentPosition);
      if (point) {
        this.container.style.left = `${point.x}px`;
        this.container.style.top = `${point.y}px`;
      }
      this.applyTransform();
    }

    override onRemove() {
      if (this.zoomListener) {
        google.maps.event.removeListener(this.zoomListener);
        this.zoomListener = null;
      }
      this.container.parentElement?.removeChild(this.container);
    }
  }

  return new CarOverlay();
}

export function BookingRouteMap(props: Props) {
  const {
    pickupAddress = "",
    dropoffAddress = "",
    pickupTimeLabel = "",
    durationMinutes,
    className,
  } = props;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const calloutOverlaysRef = useRef<google.maps.OverlayView[]>([]);
  const carOverlayRef = useRef<CarOverlayInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickup = pickupAddress.trim();
  const dropoff = dropoffAddress.trim();
  const isValidTrip = Boolean(pickup && dropoff);

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      carOverlayRef.current?.setMap(null);
      carOverlayRef.current = null;
      calloutOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      calloutOverlaysRef.current = [];
      directionsRendererRef.current?.setMap(null);
      directionsRendererRef.current = null;
    };

    const initMap = async () => {
      if (!isValidTrip || !mapRef.current) return;

      try {
        await loadGoogleMaps();
      } catch {
        if (!cancelled) {
          setError("Map unavailable. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable routing.");
        }
        return;
      }

      if (cancelled || typeof google === "undefined" || !google.maps || !mapRef.current) {
        return;
      }

      cleanup();
      setError(null);

      const map = new google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 11,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        styles: MAP_STYLES,
      });
      mapInstanceRef.current = map;

      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: ROUTE_COLOR,
          strokeWeight: 5,
          strokeOpacity: 0.95,
        },
      });
      directionsRenderer.setMap(map);
      directionsRendererRef.current = directionsRenderer;

      try {
        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          new google.maps.DirectionsService().route(
            {
              origin: pickup,
              destination: dropoff,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (res, status) => {
              if (status === google.maps.DirectionsStatus.OK && res) {
                resolve(res);
                return;
              }
              reject(new Error(String(status)));
            },
          );
        });

        if (cancelled || !result.routes?.[0]) return;

        const route = result.routes[0];
        directionsRenderer.setDirections(result);

        if (route.bounds) {
          map.fitBounds(route.bounds, { top: 90, right: 80, bottom: 90, left: 80 });
          google.maps.event.addListenerOnce(map, "idle", () => {
            const zoom = map.getZoom();
            if (typeof zoom === "number" && zoom > 14) map.setZoom(14);
          });
        }

        const firstLeg = route.legs?.[0];
        const lastLeg = route.legs?.[route.legs.length - 1];
        if (!firstLeg?.start_location || !lastLeg?.end_location) return;

        let points: google.maps.LatLng[] = [];
        route.legs?.forEach((leg) =>
          leg.steps?.forEach((step) => step.path?.forEach((point) => points.push(point))),
        );
        const overviewPath = route.overview_path;
        if (points.length < 2 && overviewPath && overviewPath.length >= 2) {
          points = [...overviewPath];
        }

        const startPoint = points[0] ?? firstLeg.start_location;
        const endPoint = points[points.length - 1] ?? lastLeg.end_location;
        const pickupBelow = endPoint.lat() >= startPoint.lat();

        const legDurationMin = Math.round(
          (firstLeg.duration?.value ||
            (typeof durationMinutes === "number" ? durationMinutes * 60 : 0)) / 60,
        );
        const pickupTime = pickupTimeLabel || "—";
        const dropoffTime =
          pickupTimeLabel && legDurationMin > 0
            ? addMinutesToTimeLabel(pickupTimeLabel, legDurationMin)
            : pickupTime;

        const pickupOverlay = createCalloutOverlay({
          position: startPoint,
          title: getAddressTitle(pickup) || "Pickup Location",
          time: pickupTime,
          locationType: detectLocationType(pickup),
          variant: "pickup",
          placement: pickupBelow ? "below" : "above",
          accentColor: CALLOUT_ACCENT,
        });
        pickupOverlay.setMap(map);
        calloutOverlaysRef.current.push(pickupOverlay);

        const dropoffOverlay = createCalloutOverlay({
          position: endPoint,
          title: getAddressTitle(dropoff) || "Drop-off Location",
          time: dropoffTime,
          locationType: detectLocationType(dropoff),
          variant: "dropoff",
          placement: pickupBelow ? "above" : "below",
          accentColor: CALLOUT_ACCENT,
        });
        dropoffOverlay.setMap(map);
        calloutOverlaysRef.current.push(dropoffOverlay);

        if (points.length < 2) return;

        const distances: number[] = [0];
        let totalDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          if (!p1 || !p2) continue;
          totalDistance += getDistanceMeters(p1.lat(), p1.lng(), p2.lat(), p2.lng());
          distances.push(totalDistance);
        }
        if (totalDistance <= 0) return;

        const first = points[0];
        const second = points[1];
        if (!first || !second) return;

        const initialHeading = calculateHeading(
          first.lat(),
          first.lng(),
          second.lat(),
          second.lng(),
        );
        const carOverlay = createCarOverlay(first, initialHeading);
        carOverlay.setMap(map);
        carOverlayRef.current = carOverlay;

        const moveDurationMs = 12000;
        const pauseDurationMs = 800;
        const cycleDurationMs = moveDurationMs + pauseDurationMs;
        let startedAt = 0;
        let smoothedHeading = initialHeading;

        const animate = (time: number) => {
          if (cancelled || !carOverlayRef.current) return;
          if (!startedAt) startedAt = time;

          const elapsed = (time - startedAt) % cycleDurationMs;
          const progress = Math.min(elapsed / moveDurationMs, 1);
          const currentDist = progress * totalDistance;

          let idx = 0;
          while (idx < distances.length - 2 && (distances[idx + 1] ?? 0) < currentDist) {
            idx += 1;
          }

          const segStartDist = distances[idx] ?? 0;
          const segEndDist = distances[idx + 1] ?? segStartDist + 1;
          const segFrac = Math.max(
            0,
            Math.min(1, (currentDist - segStartDist) / (segEndDist - segStartDist || 1)),
          );

          const p1 = points[idx];
          const p2 = points[Math.min(idx + 1, points.length - 1)];
          if (!p1 || !p2) {
            animationFrameRef.current = requestAnimationFrame(animate);
            return;
          }

          const curLat = p1.lat() + segFrac * (p2.lat() - p1.lat());
          const curLng = p1.lng() + segFrac * (p2.lng() - p1.lng());
          const currentPos = new google.maps.LatLng(curLat, curLng);

          const lookaheadDist = Math.min(currentDist + 15, totalDistance);
          let lookaheadIdx = idx;
          while (
            lookaheadIdx < distances.length - 2 &&
            (distances[lookaheadIdx + 1] ?? 0) < lookaheadDist
          ) {
            lookaheadIdx += 1;
          }
          const lookaheadP = points[Math.min(lookaheadIdx + 1, points.length - 1)] ?? p2;
          const targetHeading = calculateHeading(
            curLat,
            curLng,
            lookaheadP.lat(),
            lookaheadP.lng(),
          );

          let diff = (targetHeading - smoothedHeading) % 360;
          if (diff < -180) diff += 360;
          if (diff > 180) diff -= 360;
          smoothedHeading = (smoothedHeading + diff * 0.2 + 360) % 360;
          if (progress < 0.02) smoothedHeading = initialHeading;

          carOverlayRef.current.updatePositionAndHeading(
            currentPos,
            Math.round(smoothedHeading * 10) / 10,
          );

          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      } catch {
        if (!cancelled) setError("Could not load route for these locations.");
      }
    };

    void initMap();

    return () => {
      cancelled = true;
      cleanup();
      mapInstanceRef.current = null;
    };
  }, [isValidTrip, pickup, dropoff, pickupTimeLabel, durationMinutes]);

  if (!isValidTrip) return null;

  return (
    <div className={className ?? "w-full"}>
      <div className="relative h-[360px] w-full overflow-hidden border-b border-border bg-default-50 sm:h-[460px] md:h-[520px]">
        <div ref={mapRef} className="absolute inset-0 h-full w-full" />
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-default-50 px-4 text-center text-sm text-default-500">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
