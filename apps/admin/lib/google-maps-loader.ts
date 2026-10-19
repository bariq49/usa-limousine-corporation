"use client";

let googleMapsPromise: Promise<void> | null = null;

function isGoogleMapsReady(): boolean {
  return Boolean((window as Window & { google?: typeof google }).google?.maps?.DirectionsService);
}

export function loadGoogleMaps(apiKey?: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (isGoogleMapsReady()) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const key = apiKey || process.env["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"];

  if (!key) {
    return Promise.reject(new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"));
  }

  if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const checkInterval = window.setInterval(() => {
      if (isGoogleMapsReady()) {
        window.clearInterval(checkInterval);
        resolve();
        return;
      }

      if (Date.now() - startedAt > 15000) {
        window.clearInterval(checkInterval);
        reject(new Error("Timed out loading Google Maps"));
      }
    }, 100);
  });

  return googleMapsPromise;
}
