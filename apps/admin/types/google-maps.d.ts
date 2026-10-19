/** Minimal Google Maps typings used by the booking route map. */
declare namespace google.maps {
  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    fitBounds(
      bounds: LatLngBounds,
      padding?: number | { top: number; right: number; bottom: number; left: number },
    ): void;
    getZoom(): number | undefined;
    setZoom(zoom: number): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    addListener(eventName: string, handler: () => void): MapsEventListener;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latLng: LatLng | LatLngLiteral): void;
  }

  class DirectionsService {
    route(
      request: DirectionsRequest,
      callback: (result: DirectionsResult | null, status: DirectionsStatus | string) => void,
    ): void;
  }

  class DirectionsRenderer {
    constructor(opts?: DirectionsRendererOptions);
    setMap(map: Map | null): void;
    setDirections(directions: DirectionsResult): void;
  }

  class OverlayView {
    setMap(map: Map | null): void;
    getMap(): Map | null;
    getPanes(): MapPanes | null;
    getProjection(): MapCanvasProjection | null;
    onAdd(): void;
    draw(): void;
    onRemove(): void;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    zoomControlOptions?: { position?: ControlPosition };
    styles?: MapTypeStyle[];
    isFractionalZoomEnabled?: boolean;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MapTypeStyle {
    elementType?: string;
    featureType?: string;
    stylers?: Array<Record<string, string | number | boolean>>;
  }

  interface Icon {
    url: string;
    scaledSize?: Size;
    anchor?: Point;
  }

  interface MarkerOptions {
    map?: Map | null;
    position?: LatLng | LatLngLiteral;
    icon?: string | Icon;
    title?: string;
    zIndex?: number;
    optimized?: boolean;
  }

  interface DirectionsRequest {
    origin: string | LatLng | LatLngLiteral;
    destination: string | LatLng | LatLngLiteral;
    travelMode: TravelMode;
  }

  interface DirectionsResult {
    routes: DirectionsRoute[];
  }

  interface DirectionsRoute {
    bounds?: LatLngBounds;
    legs?: DirectionsLeg[];
    overview_path?: LatLng[];
  }

  interface DirectionsLeg {
    start_location?: LatLng;
    end_location?: LatLng;
    duration?: { value: number };
    distance?: { value: number };
    steps?: DirectionsStep[];
  }

  interface DirectionsStep {
    path?: LatLng[];
  }

  interface DirectionsRendererOptions {
    suppressMarkers?: boolean;
    preserveViewport?: boolean;
    polylineOptions?: {
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
    };
  }

  interface MapPanes {
    floatPane: Element;
    overlayMouseTarget: Element;
  }

  interface MapCanvasProjection {
    fromLatLngToDivPixel(latLng: LatLng): Point | null;
  }

  type MapsEventListener = { remove(): void };

  enum TravelMode {
    DRIVING = "DRIVING",
  }

  enum DirectionsStatus {
    OK = "OK",
  }

  enum ControlPosition {
    RIGHT_TOP = 3,
  }

  namespace event {
    function addListenerOnce(
      instance: object,
      eventName: string,
      handler: () => void,
    ): MapsEventListener;
    function removeListener(listener: MapsEventListener): void;
    function trigger(instance: object, eventName: string): void;
  }
}

declare namespace google {
  const maps: typeof google.maps;
}

declare const google: typeof google;
