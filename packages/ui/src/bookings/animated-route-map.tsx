"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTimeFormat, type HourCycle } from "../store/time-format";
import { cn } from "../utils/cn";
import { isAirportAddress, isHotelAddress, isTrainAddress } from "../utils/places";
import { loadGoogleMaps } from "./google-maps-loader";

export interface AnimatedRouteMapProps {
  pickupAddress: string;
  deliveryAddress: string;
  stops?: { address: string }[] | undefined;
  /** Pickup time ("HH:mm") shown on the pickup pin; the drop-off pin adds the drive time. */
  pickupTime?: string | undefined;
  /** Fallback drive time in minutes when Google does not return one. */
  travelDuration?: number | undefined;
  /** Top-down car image that drives along the route. */
  carMarkerSrc?: string | undefined;
  className?: string | undefined;
  wrapperClassName?: string | undefined;
  /** Pixels of the map's bottom edge covered by content laid over it (e.g. a mobile sheet). */
  bottomInset?: number | undefined;
}

// --- Constants & Styles ---
const BRAND_GOLD = "#C9A84C";
const DEFAULT_CAR_MARKER = "/assets/images/map-car-marker.png";
const NEW_YORK = { lat: 40.7128, lng: -74.006 };

/**
 * Google-style basemap: light grey land, white streets with soft edges, blue-grey highways,
 * soft water and parks, with place labels kept for orientation.
 */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5f6368" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 2 }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9aa0a6" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c5c9cf" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3c4043" }],
  },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#e8eaed" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#f1f3f4" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eceff1" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#cdebd3" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#4a8a5c" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#dadce0" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5f6368" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#b9c6d8" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#9fafc6" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#3c4043" }] },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry.fill",
    stylers: [{ color: "#a9b8cd" }],
  },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#d4d8de" }] },
  {
    featureType: "transit.station.airport",
    elementType: "geometry",
    stylers: [{ color: "#e3e6ea" }],
  },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#aad3ea" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4b7fa3" }] },
];

// --- SVG path data from @/components/svg/duel-tone ---
const PLANE_SVG_PATH = `M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z`;
const TRAIN_SVG_PATH = `M12 2c-4 0-8 .5-8 4v9.5A3.5 3.5 0 0 0 7.5 19L6 21h2l1.5-2h5L16 21h2l-1.5-2A3.5 3.5 0 0 0 20 15.5V6c0-3.5-4-4-8-4ZM7.5 16.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm9 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5ZM7 7h10v4H7V7Z`;
const HOTEL_SVG_PATH = `M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z`;
const CAR_SVG_PATH = `M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z`;

type LocationType = "airport" | "train" | "hotel" | "generic";

function detectLocationType(address: string): LocationType {
  if (isAirportAddress(address)) return "airport";
  if (isTrainAddress(address)) return "train";
  if (isHotelAddress(address)) return "hotel";
  return "generic";
}

function getLocationIconSvg(
  locationType: LocationType,
  fillColor: string,
  size: number = 16,
): string {
  let path: string;
  switch (locationType) {
    case "airport":
      path = PLANE_SVG_PATH;
      break;
    case "train":
      path = TRAIN_SVG_PATH;
      break;
    case "hotel":
      path = HOTEL_SVG_PATH;
      break;
    default:
      path = CAR_SVG_PATH;
      break;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0;"><path d="${path}"/></svg>`;
}

// --- Geometry Helpers ---
function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
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
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
    const first = (parts[0] ?? "").trim();
    if (first.length < 10 && parts[1]) {
      return `${first}, ${parts[1].trim()}`;
    }
    return first;
  }
  return address.trim();
}

function truncateTitle(title: string, maxLen: number = 26): string {
  if (title.length <= maxLen) return title;
  return title.slice(0, maxLen - 1) + "…";
}

function formatBadgeTime(rawTime: string, hourCycle: HourCycle, addMinutesCount?: number): string {
  let hours = 13;
  let minutes = 45;

  if (rawTime) {
    const match = rawTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = Number(match[1]);
      minutes = Number(match[2]);
      const period = match[3]?.toUpperCase();
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
    }
  } else {
    const now = new Date();
    hours = now.getHours();
    minutes = now.getMinutes();
  }

  if (typeof addMinutesCount === "number" && !isNaN(addMinutesCount)) {
    const totalMinutes = hours * 60 + minutes + addMinutesCount;
    const finalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    hours = Math.floor(finalMinutes / 60);
    minutes = finalMinutes % 60;
  }

  if (hourCycle === "24h") {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

// --- Unified Callout Pin Overlay (Marker + Stem + Badge as one cohesive unit) ---
function createCalloutOverlay({
  position,
  title,
  time,
  locationType,
  variant,
  placement,
  secondaryColor,
}: {
  position: google.maps.LatLng;
  title: string;
  time: string;
  locationType: LocationType;
  variant: "pickup" | "dropoff";
  placement: "above" | "below";
  secondaryColor: string;
}): google.maps.OverlayView {
  class CalloutOverlay extends google.maps.OverlayView {
    private container: HTMLDivElement;
    private zoomListener: google.maps.MapsEventListener | null = null;
    private placement: "above" | "below" = placement;
    private currentScale: number = 1.0;

    constructor() {
      super();
      this.container = document.createElement("div");
      this.container.style.position = "absolute";
      this.container.style.cursor = "default";
      this.container.style.userSelect = "none";
      this.container.style.pointerEvents = "auto";
      this.container.style.zIndex = variant === "dropoff" ? "105" : "100";
      this.container.style.transition = "transform 0.15s ease-out";
      this.container.style.willChange = "transform, left, top";

      this.renderLayout();
    }

    private renderLayout() {
      this.container.innerHTML = "";

      const isPickup = variant === "pickup";
      const iconColor = "#ffffff";
      const textColor = "#ffffff";
      const badgeBg = isPickup ? "#111827" : secondaryColor;
      const typeLabel = isPickup ? "Pick up" : "Drop-off";
      const iconSvg = getLocationIconSvg(locationType, iconColor, 14);
      const truncatedTitle = truncateTitle(escapeHtml(title), 22);

      const squareMarkerEl = document.createElement("div");
      squareMarkerEl.style.cssText = `
        width: 11px;
        height: 11px;
        background: #111827;
        border: 2px solid #ffffff;
        border-radius: 2px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 2;
      `;
      squareMarkerEl.innerHTML = `<div style="width: 3px; height: 3px; background: #ffffff; border-radius: 1px;"></div>`;

      const connectorStemEl = document.createElement("div");
      connectorStemEl.style.cssText = `
        width: 2px;
        height: 7px;
        background: #111827;
        flex-shrink: 0;
      `;

      const badgeCardEl = document.createElement("div");
      badgeCardEl.style.cssText = `
        display: inline-flex;
        align-items: stretch;
        background: #ffffff;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 3px 12px -2px rgba(0,0,0,0.18), 0 1px 4px -1px rgba(0,0,0,0.08);
        border: 1px solid rgba(0,0,0,0.08);
        font-family: system-ui, -apple-system, sans-serif;
        white-space: nowrap;
      `;
      badgeCardEl.innerHTML = `
        <div style="padding: 4px 9px; display: flex; flex-direction: column; justify-content: center; background: #ffffff;">
          <span style="font-size: 9.5px; font-weight: 500; color: #6b7280; line-height: 1.2;">${typeLabel}</span>
          <span style="font-size: 11.5px; font-weight: 700; color: #121110; line-height: 1.25;">${truncatedTitle}</span>
        </div>
        <div style="
          background: ${badgeBg};
          padding: 4px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          gap: 2px;
        ">
          ${iconSvg}
          <span style="font-size: 9.5px; font-weight: 700; color: ${textColor}; line-height: 1.15; letter-spacing: -0.2px;">${escapeHtml(time)}</span>
        </div>
      `;

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display: flex; flex-direction: column; align-items: center;";

      if (this.placement === "above") {
        wrapper.appendChild(badgeCardEl);
        wrapper.appendChild(connectorStemEl);
        wrapper.appendChild(squareMarkerEl);
        this.container.style.transformOrigin = "center calc(100% - 5.5px)";
        this.container.style.transform = `translate(-50%, calc(-100% + 5.5px)) scale(${this.currentScale})`;
      } else {
        wrapper.appendChild(squareMarkerEl);
        wrapper.appendChild(connectorStemEl);
        wrapper.appendChild(badgeCardEl);
        this.container.style.transformOrigin = "center 5.5px";
        this.container.style.transform = `translate(-50%, -5.5px) scale(${this.currentScale})`;
      }

      this.container.appendChild(wrapper);
    }

    private updateScale() {
      const map = this.getMap() as google.maps.Map | null;
      if (!map) return;
      const zoom = map.getZoom() ?? 12;
      // Keep badges compact on tall, narrow map columns
      this.currentScale = Math.max(0.75, Math.min(1.05, 0.5 + zoom * 0.035));
      if (this.placement === "above") {
        this.container.style.transform = `translate(-50%, calc(-100% + 5.5px)) scale(${this.currentScale})`;
      } else {
        this.container.style.transform = `translate(-50%, -5.5px) scale(${this.currentScale})`;
      }
    }

    override onAdd() {
      const panes = this.getPanes();
      panes?.floatPane.appendChild(this.container);
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
      if (this.container.parentElement) {
        this.container.parentElement.removeChild(this.container);
      }
    }
  }

  return new CalloutOverlay();
}

// --- Animated Car Overlay ---
export interface CarOverlayInstance extends google.maps.OverlayView {
  updatePositionAndHeading: (position: google.maps.LatLng, heading: number) => void;
}

function createCarOverlay(
  initialPosition: google.maps.LatLng,
  initialHeading: number,
  markerSrc: string,
): CarOverlayInstance {
  class CarOverlay extends google.maps.OverlayView implements CarOverlayInstance {
    private container: HTMLDivElement;
    private currentPosition: google.maps.LatLng = initialPosition;
    private currentHeading: number = initialHeading;
    private currentScale: number = 1.0;
    private zoomListener: google.maps.MapsEventListener | null = null;

    constructor() {
      super();
      this.container = document.createElement("div");
      this.container.style.position = "absolute";
      this.container.style.pointerEvents = "none";
      this.container.style.zIndex = "250";
      this.container.style.transformOrigin = "center center";
      this.container.style.width = "40px";
      this.container.style.height = "40px";
      this.container.style.willChange = "transform, left, top";

      const img = document.createElement("img");
      img.src = markerSrc;
      img.alt = "Chauffeur Vehicle";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
      img.style.display = "block";
      img.style.filter = "drop-shadow(0 4px 6px rgba(0,0,0,0.4))";

      this.container.appendChild(img);
    }

    private updateScale() {
      const map = this.getMap() as google.maps.Map | null;
      if (!map) return;
      const zoom = map.getZoom() ?? 12;
      this.currentScale = Math.max(0.75, Math.min(1.45, 0.45 + zoom * 0.05));
      this.applyTransform();
    }

    private applyTransform() {
      this.container.style.transform = `translate(-50%, -50%) rotate(${this.currentHeading}deg) scale(${this.currentScale})`;
    }

    public updatePositionAndHeading(position: google.maps.LatLng, heading: number) {
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
      const panes = this.getPanes();
      panes?.overlayMouseTarget.appendChild(this.container);
      const map = this.getMap() as google.maps.Map | null;
      if (map) {
        this.updateScale();
        this.zoomListener = map.addListener("zoom_changed", () => this.updateScale());
      }
    }

    override draw() {
      const projection = this.getProjection();
      if (!projection || !this.currentPosition) return;
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
      if (this.container.parentElement) {
        this.container.parentElement.removeChild(this.container);
      }
    }
  }

  return new CarOverlay();
}

// --- Main Component ---
/** Route map with pickup/drop-off callouts and a car that drives the route on a loop. */
export function AnimatedRouteMap({
  pickupAddress,
  deliveryAddress,
  stops,
  pickupTime = "",
  travelDuration,
  carMarkerSrc = DEFAULT_CAR_MARKER,
  className,
  wrapperClassName,
  bottomInset = 0,
}: AnimatedRouteMapProps) {
  const hourCycle = useTimeFormat((state) => state.hourCycle);
  const mapRef = useRef<HTMLDivElement>(null);
  const bottomInsetRef = useRef(bottomInset);
  bottomInsetRef.current = bottomInset;
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const routeCasingRef = useRef<google.maps.Polyline | null>(null);
  const carOverlayRef = useRef<CarOverlayInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pickupOverlayRef = useRef<google.maps.OverlayView | null>(null);
  const dropoffOverlayRef = useRef<google.maps.OverlayView | null>(null);

  const stopAddressesKey = (stops ?? [])
    .map((stop) => stop.address?.trim())
    .filter(Boolean)
    .join("|");
  const stopWaypoints = useMemo(
    () =>
      stopAddressesKey
        ? stopAddressesKey.split("|").map((address) => ({
            location: address,
            stopover: true,
          }))
        : [],
    [stopAddressesKey],
  );

  const isValidTrip = Boolean(pickupAddress.trim() && deliveryAddress.trim());

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const cleanupPreviousOverlays = () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (carOverlayRef.current) carOverlayRef.current.setMap(null);
      if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
      if (routeCasingRef.current) routeCasingRef.current.setMap(null);
      if (pickupOverlayRef.current) pickupOverlayRef.current.setMap(null);
      if (dropoffOverlayRef.current) dropoffOverlayRef.current.setMap(null);
    };

    const initMap = async () => {
      if (!isValidTrip || !mapRef.current) return;

      await loadGoogleMaps();
      if (cancelled || !window.google?.maps || !mapRef.current) return;

      cleanupPreviousOverlays();

      const secondaryColor = BRAND_GOLD;

      const map = new google.maps.Map(mapRef.current, {
        center: NEW_YORK,
        zoom: 12,
        clickableIcons: false,
        isFractionalZoomEnabled: true,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        styles: MAP_STYLES,
      });
      mapInstanceRef.current = map;

      const fitBoundsWithPadding = (
        targetMap: google.maps.Map,
        bounds: google.maps.LatLngBounds,
        distKm: number,
      ) => {
        const containerH = mapRef.current?.clientHeight || 450;
        const containerW = mapRef.current?.clientWidth || 450;
        const isCompact = containerH < 400 || containerW < 400;

        // Generous padding so top/bottom badges (~60px), side badges (~105px half-width),
        // and Google copyright/terms (~25px) are never clipped, plus the mobile sheet that
        // overlaps the bottom edge of a small map:
        const padTop = isCompact ? 70 : Math.min(125, Math.max(90, Math.round(containerH * 0.18)));
        const padBottom =
          (isCompact ? 80 : Math.min(140, Math.max(105, Math.round(containerH * 0.22)))) +
          (isCompact ? bottomInsetRef.current : 0);
        const padX = isCompact
          ? Math.min(110, Math.round(containerW * 0.27))
          : Math.min(135, Math.max(95, Math.round(containerW * 0.2)));

        targetMap.fitBounds(bounds, {
          top: padTop,
          right: padX,
          bottom: padBottom,
          left: padX,
        });

        google.maps.event.addListenerOnce(targetMap, "idle", () => {
          if (cancelled) return;
          const currentZoom = targetMap.getZoom();
          if (typeof currentZoom !== "number") return;

          // Short distance: zoom in close to see streets/neighborhood
          // Ultra-short (< 2 km): cap at 15.5
          // Short (< 5 km): cap at 14.5
          // City trip (< 15 km): ensure at least 11.5 for clear city layout
          // Medium trip (< 30 km): ensure at least 11 so route fills the frame
          // Zooming in past the fitted view would push the badges off a small map, so the
          // last two only apply to larger maps.
          let targetZoom: number | null = null;
          if (distKm < 2 && currentZoom > 15.5) targetZoom = 15.5;
          else if (distKm < 5 && currentZoom > 14.5) targetZoom = 14.5;
          else if (!isCompact && distKm < 15 && currentZoom < 11.5) targetZoom = 11.5;
          else if (!isCompact && distKm < 30 && currentZoom < 11) targetZoom = 11;
          if (targetZoom === null) return;

          targetMap.setZoom(targetZoom);
          targetMap.panTo(bounds.getCenter());
          // Keep the route centred in the padded area rather than the whole map.
          targetMap.panBy(0, (padBottom - padTop) / 2);
        });
      };

      let activeRouteData: { bounds: google.maps.LatLngBounds; distanceKm: number } | null = null;

      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current && activeRouteData) {
          google.maps.event.trigger(mapInstanceRef.current, "resize");
          fitBoundsWithPadding(
            mapInstanceRef.current,
            activeRouteData.bounds,
            activeRouteData.distanceKm,
          );
        }
      });
      if (mapRef.current) {
        resizeObserver.observe(mapRef.current);
      }

      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: "#111827",
          strokeWeight: 5,
          strokeOpacity: 1,
          zIndex: 2,
        },
      });
      directionsRenderer.setMap(map);
      directionsRendererRef.current = directionsRenderer;

      new google.maps.DirectionsService().route(
        {
          origin: pickupAddress,
          destination: deliveryAddress,
          waypoints: stopWaypoints,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status !== "OK" || !result || cancelled) return;

          directionsRenderer.setDirections(result);
          const route = result.routes?.[0];
          if (!route) return;

          let points: google.maps.LatLng[] = [];
          route.legs?.forEach((l) =>
            l.steps?.forEach((s) => s.path?.forEach((p) => points.push(p))),
          );
          if (points.length < 2 && route.overview_path && route.overview_path.length >= 2) {
            points = route.overview_path;
          }

          // White casing under the route line so it reads clearly over any background.
          routeCasingRef.current = new google.maps.Polyline({
            map,
            path: points,
            strokeColor: "#ffffff",
            strokeWeight: 9,
            strokeOpacity: 1,
            zIndex: 1,
            clickable: false,
          });

          const firstLeg = route.legs?.[0];
          const lastLeg = route.legs?.[route.legs.length - 1];

          if (!firstLeg?.start_location || !lastLeg?.end_location) return;

          // Compute duration and distance across all legs (supports stops)
          const totalDurationSec = route.legs.reduce(
            (sum, leg) => sum + (leg.duration?.value || 0),
            0,
          );
          const legDurationMin = Math.round(
            (totalDurationSec || (travelDuration ? travelDuration * 60 : 0)) / 60,
          );
          const legDistanceMeters = route.legs.reduce(
            (sum, leg) => sum + (leg.distance?.value || 0),
            0,
          );
          const distanceKm = legDistanceMeters / 1000;

          // --- Distance-aware automatic map framing (Near vs Far) ---
          const routeBounds =
            route.bounds ||
            (() => {
              const b = new google.maps.LatLngBounds();
              points.forEach((p) => b.extend(p));
              return b;
            })();

          activeRouteData = { bounds: routeBounds, distanceKm };
          fitBoundsWithPadding(map, routeBounds, distanceKm);

          const startFormattedTime = formatBadgeTime(pickupTime, hourCycle);
          const endFormattedTime = formatBadgeTime(pickupTime, hourCycle, legDurationMin);

          const pickupTitle = getAddressTitle(pickupAddress) || "Pickup Location";
          const dropoffTitle = getAddressTitle(deliveryAddress) || "Drop-off Location";

          const pickupLocationType = detectLocationType(pickupAddress);
          const dropoffLocationType = detectLocationType(deliveryAddress);

          // Placement: if dest is further North, show pickup below and dropoff above, else reversed
          const startPoint = points[0] ?? firstLeg.start_location;
          const endPoint = points[points.length - 1] ?? lastLeg.end_location;
          const pickupBelow = endPoint.lat() >= startPoint.lat();
          const dropoffBelow = !pickupBelow;

          // 1. Unified Pickup Pin (Marker + Stem + Badge)
          const pickupOverlay = createCalloutOverlay({
            position: startPoint,
            title: pickupTitle,
            time: startFormattedTime,
            locationType: pickupLocationType,
            variant: "pickup",
            placement: pickupBelow ? "below" : "above",
            secondaryColor,
          });
          pickupOverlay.setMap(map);
          pickupOverlayRef.current = pickupOverlay;

          // 2. Unified Drop-off Pin (Marker + Stem + Badge)
          const dropoffOverlay = createCalloutOverlay({
            position: endPoint,
            title: dropoffTitle,
            time: endFormattedTime,
            locationType: dropoffLocationType,
            variant: "dropoff",
            placement: dropoffBelow ? "below" : "above",
            secondaryColor,
          });
          dropoffOverlay.setMap(map);
          dropoffOverlayRef.current = dropoffOverlay;

          // 3. Animated car marker driving the route
          const firstPoint = points[0];
          const secondPoint = points[1];
          if (!firstPoint || !secondPoint) return;

          // Precompute cumulative distances along the route for realistic constant speed
          const distances: number[] = [0];
          let totalDistance = 0;
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            if (!p1 || !p2) continue;
            const d = getDistanceMeters(p1.lat(), p1.lng(), p2.lat(), p2.lng());
            totalDistance += d;
            distances.push(totalDistance);
          }

          if (totalDistance <= 0) return;

          const initialHeading = calculateHeading(
            firstPoint.lat(),
            firstPoint.lng(),
            secondPoint.lat(),
            secondPoint.lng(),
          );

          const carOverlay = createCarOverlay(firstPoint, initialHeading, carMarkerSrc);
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

            // Find current segment along route
            let idx = 0;
            while (idx < distances.length - 2 && (distances[idx + 1] ?? Infinity) < currentDist) {
              idx++;
            }

            const segStartDist = distances[idx] ?? 0;
            const segEndDist = distances[idx + 1] || segStartDist + 1;
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

            // Lookahead 15 meters ahead for smooth rotation into curves
            const lookaheadDist = Math.min(currentDist + 15, totalDistance);
            let lookaheadIdx = idx;
            while (
              lookaheadIdx < distances.length - 2 &&
              (distances[lookaheadIdx + 1] ?? Infinity) < lookaheadDist
            ) {
              lookaheadIdx++;
            }
            const lookaheadP = points[Math.min(lookaheadIdx + 1, points.length - 1)] ?? p2;
            const targetHeading = calculateHeading(
              curLat,
              curLng,
              lookaheadP.lat(),
              lookaheadP.lng(),
            );

            // Smooth angular rotation (shortest angular distance)
            let diff = (targetHeading - smoothedHeading) % 360;
            if (diff < -180) diff += 360;
            if (diff > 180) diff -= 360;
            smoothedHeading = (smoothedHeading + diff * 0.2 + 360) % 360;

            // When cycle resets near start, re-anchor heading
            if (progress < 0.02) {
              smoothedHeading = initialHeading;
            }

            carOverlayRef.current.updatePositionAndHeading(
              currentPos,
              Math.round(smoothedHeading * 10) / 10,
            );

            animationFrameRef.current = requestAnimationFrame(animate);
          };

          animationFrameRef.current = requestAnimationFrame(animate);
        },
      );
    };

    initMap();

    return () => {
      cancelled = true;
      if (resizeObserver) resizeObserver.disconnect();
      cleanupPreviousOverlays();
      mapInstanceRef.current = null;
    };
  }, [
    isValidTrip,
    pickupAddress,
    deliveryAddress,
    pickupTime,
    hourCycle,
    travelDuration,
    stopWaypoints,
    carMarkerSrc,
  ]);

  if (!isValidTrip) return null;

  return (
    <div className={cn("w-full", wrapperClassName)}>
      <div
        className={cn(
          "relative h-[320px] overflow-hidden rounded-none border-0 shadow-none group sm:h-[350px] xl:rounded-sm xl:border xl:border-border xl:overflow-hidden",
          className,
        )}
      >
        <div
          ref={mapRef}
          className="h-full w-full [&_*:focus]:outline-none [&_*:focus-visible]:outline-none [&_.gmnoprint>div]:overflow-hidden [&_.gmnoprint>div]:rounded-sm!"
        />
      </div>
    </div>
  );
}
