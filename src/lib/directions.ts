/**
 * "Get directions" links. We don't build routing ourselves — we hand off to
 * Google Maps' universal directions URL, which opens the Maps *app* with
 * turn-by-turn on a phone (from the user's current location) and google.com/maps
 * in a browser on desktop. Leaving the origin unset means "from wherever you
 * are now", which is exactly what someone heading to a class wants.
 *
 * Docs: https://developers.google.com/maps/documentation/urls/get-started#directions-action
 */
import type { Experience } from "@/data/locations";
import type { CityClass } from "@/data/city-classes";

export interface Destination {
  /** Human label for the place (venue + city) — used as the maps query fallback. */
  label: string;
  /** Full street address, when known (most accurate destination). */
  address?: string;
  lat?: number;
  lng?: number;
  /** Google Place ID — pinpoints the exact venue when known. */
  placeId?: string;
}

/** Best available destination string: address → coords → label. */
function destinationQuery(d: Destination): string {
  if (d.address && d.address.trim()) return d.address.trim();
  if (typeof d.lat === "number" && typeof d.lng === "number") {
    return `${d.lat},${d.lng}`;
  }
  return d.label;
}

/** Universal Google Maps directions deep link to this destination. */
export function directionsUrl(d: Destination): string {
  const params = new URLSearchParams({
    api: "1",
    destination: destinationQuery(d),
  });
  if (d.placeId) params.set("destination_place_id", d.placeId);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** True when we have enough to route to this place (not just a vague label). */
export function hasRoutableLocation(d: Destination): boolean {
  return Boolean(
    (d.address && d.address.trim()) ||
      (typeof d.lat === "number" && typeof d.lng === "number"),
  );
}

/** Directions destination for a FareHarbor venue. */
export function venueDestination(e: Experience): Destination {
  return {
    label: [e.venue, e.city, e.state].filter(Boolean).join(", "),
    address: e.address || undefined,
    lat: e.lat || undefined,
    lng: e.lng || undefined,
    placeId: e.placeId || undefined,
  };
}

/** Directions destination for a city-run class / featured event. */
export function cityClassDestination(c: CityClass): Destination {
  return {
    label: [c.venue, c.city, c.state].filter(Boolean).join(", "),
    address: c.address || undefined,
    lat: c.lat,
    lng: c.lng,
  };
}
