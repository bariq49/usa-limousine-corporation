type LatLng = { lat: number; lng: number };

function haversineKm(a: LatLng, b: LatLng) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough road ETA minutes from current point to target (~30 km/h urban). */
export function etaMinutesTo(from: LatLng, to: LatLng): number {
  const km = haversineKm(from, to);
  return Math.max(1, Math.round((km / 30) * 60));
}
