/// <reference types="@types/google.maps" />
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MapView } from "@/components/Map";
import FareHarborButton from "@/components/FareHarborButton";
import DirectionsButton from "@/components/DirectionsButton";
import { experiences, type Experience } from "@/data/locations";
import { cityClassVenues, type CityClass } from "@/data/city-classes";
import { getUpcomingSessions, type UpcomingSession } from "@/lib/experiencesApi";
import { trackEvent } from "@/lib/analytics";
import { appendUtms } from "@/lib/utm";
import {
  directionsUrl,
  hasRoutableLocation,
  venueDestination,
  cityClassDestination,
} from "@/lib/directions";
// Homepage hero — real twilight floating soundbath at the JW Marriott: a
// candlelit resort pool with guests floating on mats and crystal sound bowls
// in the foreground (self-hosted in /public).
const heroImage = "/marriott-night-soundbath.jpg";

const TZ = "America/Phoenix";
const PHOENIX_CENTER = { lat: 33.45, lng: -111.85 };

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Short "Jul 21" used for the extra upcoming dates on a venue card. */
function fmtMonthDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}

/** HTML for a venue's map info window — name, venue, next session + a link. */
function venueInfoHtml(exp: Experience, next?: UpcomingSession): string {
  const venue = exp.venue
    ? `<div style="font-size:13px;color:#475569;margin-top:1px">${escapeHtml(exp.venue)}</div>`
    : "";
  const when = next
    ? `Next: <strong>${fmtDate(next.startAt)}</strong> · ${fmtTime(next.startAt)}`
    : "See calendar for dates";
  const dest = venueDestination(exp);
  const directions = hasRoutableLocation(dest)
    ? `<a href="${escapeHtml(directionsUrl(dest))}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;margin-left:12px;font-size:13px;font-weight:700;color:#3e7c84;text-decoration:underline">Directions →</a>`
    : "";
  return `<div style="max-width:230px;line-height:1.35;font-family:inherit">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#3e7c84">${escapeHtml(exp.city)}, ${escapeHtml(exp.state)}</div>
    <div style="font-size:15px;font-weight:700;color:#0f172a;margin-top:2px">${escapeHtml(exp.title)}</div>
    ${venue}
    <div style="font-size:13px;color:#334155;margin-top:6px">${when}</div>
    <a href="/locations/${exp.slug}" style="display:inline-block;margin-top:8px;font-size:13px;font-weight:700;color:#1f3a4d;text-decoration:underline">View details →</a>${directions}
  </div>`;
}

/** Soonest still-upcoming session for a city class, if any. */
function nextCityIso(c: CityClass): string | undefined {
  const now = Date.now();
  return c.sessions
    .map((s) => s.startAt)
    .filter((iso) => Date.parse(iso) > now)
    .sort()[0];
}

/** Info window for a city-run class — booked through the city's own system. */
function cityVenueInfoHtml(c: CityClass, nextIso?: string): string {
  const when = nextIso
    ? `Next: <strong>${fmtDate(nextIso)}</strong> · ${fmtTime(nextIso)}`
    : "See calendar for dates";
  const dest = cityClassDestination(c);
  const directions = hasRoutableLocation(dest)
    ? `<a href="${escapeHtml(directionsUrl(dest))}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;margin-left:12px;font-size:13px;font-weight:700;color:#3e7c84;text-decoration:underline">Directions →</a>`
    : "";
  return `<div style="max-width:230px;line-height:1.35;font-family:inherit">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#1f3a4d">${escapeHtml(c.city)}, ${escapeHtml(c.state)} · ${c.fareharborItemId ? "Featured event" : "City class"}</div>
    <div style="font-size:15px;font-weight:700;color:#0f172a;margin-top:2px">${escapeHtml(c.title)}</div>
    <div style="font-size:13px;color:#475569;margin-top:1px">${escapeHtml(c.venue)}</div>
    <div style="font-size:13px;color:#334155;margin-top:6px">${when}</div>
    <a href="/locations/${escapeHtml(c.slug)}" style="display:inline-block;margin-top:8px;font-size:13px;font-weight:700;color:#1f3a4d;text-decoration:underline">View details →</a>${directions}
  </div>`;
}

/** A row in the venue finder list — either a FareHarbor venue or a city class. */
interface FinderRow {
  key: string;
  kind: "fareharbor" | "city";
  city: string;
  next?: { startAt: string; spotsLeft?: number | null };
  /** All upcoming session dates (ISO, sorted) at this venue — so recurring
   *  classes show more than just their soonest date. */
  dates?: string[];
  dist?: number;
  exp?: Experience;
  cityClass?: CityClass;
}

/** Up to `n` venues nearest to a point, by great-circle distance. */
function nearestVenues(
  g: any,
  point: { lat: number; lng: number },
  n: number,
): Experience[] {
  if (!g?.maps?.geometry?.spherical) return experiences.slice(0, n);
  const from = new g.maps.LatLng(point.lat, point.lng);
  return experiences
    .map((e) => ({
      e,
      d: g.maps.geometry.spherical.computeDistanceBetween(
        from,
        new g.maps.LatLng(e.lat, e.lng),
      ),
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.e);
}

export default function LocationFinder({
  afterHero,
}: {
  /** Rendered between the hero and the map/venue-list finder. */
  afterHero?: ReactNode;
} = {}) {
  const [sessions, setSessions] = useState<UpcomingSession[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapAvailable, setMapAvailable] = useState(true);

  const mapRef = useRef<google.maps.Map | null>(null);
  const originMarkerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  // Load live sessions (graceful on failure)
  useEffect(() => {
    let cancelled = false;
    getUpcomingSessions().then((s) => {
      if (!cancelled) setSessions(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // itemId -> earliest upcoming session
  const nextByItem = useMemo(() => {
    const map = new Map<number, UpcomingSession>();
    for (const s of sessions) {
      const existing = map.get(s.itemId);
      if (!existing || s.startAt < existing.startAt) map.set(s.itemId, s);
    }
    return map;
  }, [sessions]);

  // itemId -> ALL upcoming session dates (ISO, sorted). Recurring classes (e.g.
  // weekly water aerobics) run several dates at one venue; showing only "Next"
  // hid the rest, so the card lists the next few dates too.
  const upcomingByItem = useMemo(() => {
    const now = Date.now();
    const map = new Map<number, string[]>();
    for (const s of sessions) {
      if (Date.parse(s.startAt) <= now) continue;
      const arr = map.get(s.itemId) ?? [];
      arr.push(s.startAt);
      map.set(s.itemId, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.localeCompare(b));
    return map;
  }, [sessions]);

  // Live ref to the sessions map so marker click handlers (created once, when
  // the map loads) read the latest "next session" data without stale closures.
  const nextByItemRef = useRef(nextByItem);
  useEffect(() => {
    nextByItemRef.current = nextByItem;
  }, [nextByItem]);

  const cities = useMemo(
    () =>
      [
        ...new Set([
          ...experiences.map((e) => e.city),
          ...cityClassVenues.map((c) => c.city),
        ]),
      ].sort((a, b) => a.localeCompare(b)),
    [],
  );

  // Distance (miles) from origin to each venue, when an origin is set
  const distanceByItem = useMemo(() => {
    const map = new Map<number, number>();
    const g = typeof window !== "undefined" ? (window as any).google : undefined;
    if (!origin || !g?.maps?.geometry?.spherical) return map;
    const from = new g.maps.LatLng(origin.lat, origin.lng);
    for (const e of experiences) {
      const meters = g.maps.geometry.spherical.computeDistanceBetween(
        from,
        new g.maps.LatLng(e.lat, e.lng),
      );
      map.set(e.itemId, meters / 1609.344);
    }
    return map;
  }, [origin]);

  // Distance (miles) to each city-run venue, when an origin is set.
  const cityDistanceById = useMemo(() => {
    const map = new Map<string, number>();
    const g = typeof window !== "undefined" ? (window as any).google : undefined;
    if (!origin || !g?.maps?.geometry?.spherical) return map;
    const from = new g.maps.LatLng(origin.lat, origin.lng);
    for (const c of cityClassVenues) {
      if (typeof c.lat !== "number" || typeof c.lng !== "number") continue;
      const meters = g.maps.geometry.spherical.computeDistanceBetween(
        from,
        new g.maps.LatLng(c.lat, c.lng),
      );
      map.set(c.id, meters / 1609.344);
    }
    return map;
  }, [origin]);

  // Unified finder list: FareHarbor venues + city-run classes, filtered by
  // city and sorted by distance (when searching) or soonest session.
  const visible = useMemo<FinderRow[]>(() => {
    const rows: FinderRow[] = [
      ...experiences.map((e) => ({
        key: e.slug,
        kind: "fareharbor" as const,
        city: e.city,
        next: nextByItem.get(e.itemId),
        dates: upcomingByItem.get(e.itemId),
        dist: distanceByItem.get(e.itemId),
        exp: e,
      })),
      ...cityClassVenues.map((c) => {
        const now = Date.now();
        const dates = c.sessions
          .map((s) => s.startAt)
          .filter((iso) => Date.parse(iso) > now)
          .sort((a, b) => a.localeCompare(b));
        return {
          key: c.id,
          kind: "city" as const,
          city: c.city,
          next: dates[0] ? { startAt: dates[0] } : undefined,
          dates,
          dist: cityDistanceById.get(c.id),
          cityClass: c,
        };
      }),
    ];

    const list = selectedCity
      ? rows.filter((r) => r.city === selectedCity)
      : rows;

    return list.slice().sort((a, b) => {
      if (origin) return (a.dist ?? Infinity) - (b.dist ?? Infinity);
      return (a.next?.startAt ?? "9999").localeCompare(b.next?.startAt ?? "9999");
    });
  }, [
    selectedCity,
    origin,
    distanceByItem,
    cityDistanceById,
    nextByItem,
    upcomingByItem,
  ]);

  function handleMapReady(map: google.maps.Map) {
    mapRef.current = map;
    const g = (window as any).google;
    if (!g?.maps?.marker) return;

    const infoWindow = new g.maps.InfoWindow();
    infoWindowRef.current = infoWindow;

    const bounds = new g.maps.LatLngBounds();
    for (const e of experiences) {
      const marker = new g.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: e.lat, lng: e.lng },
        title: `${e.title}${e.venue ? ` — ${e.venue}` : ""}, ${e.city}`,
        gmpClickable: true,
      });
      // Click a pin → open the venue's info window (fresh "next session" data).
      // AdvancedMarkerElement emits "gmp-click" (not "click") in the current API.
      const openInfo = () => {
        infoWindow.close();
        infoWindow.setContent(venueInfoHtml(e, nextByItemRef.current.get(e.itemId)));
        infoWindow.open({ map, anchor: marker });
      };
      marker.addListener("gmp-click", openInfo);
      bounds.extend({ lat: e.lat, lng: e.lng });
    }

    // City-run classes (Queen Creek, Sedona, …) book through the cities' own
    // systems, not FareHarbor — distinct navy pins that link out to register.
    for (const c of cityClassVenues) {
      if (typeof c.lat !== "number" || typeof c.lng !== "number") continue;
      const pin = g.maps.marker.PinElement
        ? new g.maps.marker.PinElement({
            background: "#1f3a4d",
            borderColor: "#0f172a",
            glyphColor: "#7fd1da",
          }).element
        : undefined;
      const marker = new g.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: c.lat, lng: c.lng },
        title: `${c.title} — ${c.venue}, ${c.city}`,
        gmpClickable: true,
        ...(pin ? { content: pin } : {}),
      });
      marker.addListener("gmp-click", () => {
        infoWindow.close();
        infoWindow.setContent(cityVenueInfoHtml(c, nextCityIso(c)));
        infoWindow.open({ map, anchor: marker });
      });
      // Only widen the DEFAULT view for metro-area venues. Far-flung pins like
      // Sedona (~120mi north) still render — they're just off the initial view
      // (reachable by panning or search), so the map stays focused on Phoenix.
      if (Math.abs(c.lat - PHOENIX_CENTER.lat) < 0.7) {
        bounds.extend({ lat: c.lat, lng: c.lng });
      }
    }

    map.fitBounds(bounds, 48);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setGeoError(null);
    const g = (window as any).google;
    if (!g?.maps?.Geocoder) {
      setGeoError("Map is still loading — try again in a moment.");
      return;
    }
    const term = query.trim();
    if (!term) return;
    const geocoder = new g.maps.Geocoder();
    geocoder.geocode(
      { address: `${term}, Arizona, USA` },
      (results: any, status: string) => {
        if (status !== "OK" || !results?.[0]) {
          setGeoError("We couldn't find that place. Try a city or ZIP code.");
          return;
        }
        const loc = results[0].geometry.location;
        const next = { lat: loc.lat(), lng: loc.lng() };
        setOrigin(next);
        setOriginLabel(results[0].formatted_address ?? term);

        const map = mapRef.current;
        if (map) {
          infoWindowRef.current?.close();

          // Frame "you" + the nearest venues so the result is visual.
          const bounds = new g.maps.LatLngBounds();
          bounds.extend(next);
          for (const e of nearestVenues(g, next, 5)) {
            bounds.extend({ lat: e.lat, lng: e.lng });
          }
          map.fitBounds(bounds, 64);

          // Distinct teal "You are here" pin (vs the venue pins).
          if (originMarkerRef.current) originMarkerRef.current.map = null;
          const youContent = g.maps.marker.PinElement
            ? new g.maps.marker.PinElement({
                background: "#3e7c84",
                borderColor: "#1f3a4d",
                glyphColor: "#ffffff",
              }).element
            : undefined;
          originMarkerRef.current = new g.maps.marker.AdvancedMarkerElement({
            map,
            position: next,
            title: "You are here",
            ...(youContent ? { content: youContent } : {}),
          });
        }
      },
    );
  }

  function clearOrigin() {
    setOrigin(null);
    setOriginLabel("");
    setQuery("");
    if (originMarkerRef.current) {
      originMarkerRef.current.map = null;
      originMarkerRef.current = null;
    }
  }

  return (
    <>
      {/* Compact hero with built-in search */}
      <section className="relative h-[360px] min-h-[320px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Sunset floating soundbath at a resort pool — guests floating on the water as a musician plays crystal bowls and a gong"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 via-brand-dark/45 to-brand-dark/15" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
            Floating soundbaths · water wellness · Arizona
          </p>
          {/* Fluid size keeps it on ONE line across every screen width (scales
              with the viewport, capped at 3rem so it never wraps or overflows). */}
          <h1 className="mt-2 whitespace-nowrap text-[clamp(1.25rem,6.5vw,3rem)] italic leading-[1.05] text-white">
            Life is better on the water.
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/90">
            The Floating Nap™ — a floating soundbath with live music on the water.
            Find one near you and book online.
          </p>
          <form onSubmit={handleSearch} className="mt-5 flex max-w-md gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your city or ZIP"
              className="flex-1 rounded-md bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button
              type="submit"
              className="rounded-md bg-secondary px-5 py-3 text-sm font-semibold uppercase tracking-wide text-secondary-foreground hover:bg-secondary/90"
            >
              Find near me
            </button>
          </form>
          {originLabel ? (
            <p className="mt-2 text-xs text-white/85">
              Showing distance from{" "}
              <span className="font-medium">{originLabel}</span> ·{" "}
              <button
                type="button"
                onClick={clearOrigin}
                className="underline"
              >
                clear
              </button>
            </p>
          ) : null}
          {geoError ? (
            <p className="mt-2 text-xs text-amber-200">{geoError}</p>
          ) : null}
        </div>
      </section>

      {afterHero}

      {/* Finder: filter + map + live sessions */}
      <section id="finder" className="mx-auto max-w-6xl px-4 py-10">
        {/* City filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCity("")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !selectedCity
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
          >
            All cities
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCity === city
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        <div
          className={`mt-6 grid grid-cols-1 gap-8 ${
            mapAvailable ? "lg:grid-cols-2" : ""
          }`}
        >
          {/* Map — hidden if the Maps API is unavailable, so we never show an
              empty gray box; the search + list still work without it. */}
          {mapAvailable ? (
            <div className="lg:sticky lg:top-24 lg:h-[560px]">
              <MapView
                initialCenter={PHOENIX_CENTER}
                initialZoom={9}
                onMapReady={handleMapReady}
                onUnavailable={() => setMapAvailable(false)}
                className="h-[360px] w-full overflow-hidden rounded-2xl border border-border lg:h-[560px]"
              />
            </div>
          ) : null}

          {/* Venue list — FareHarbor venues + city-run classes */}
          <div className="space-y-4">
            {visible.map((row) =>
              row.kind === "fareharbor" && row.exp ? (
                <VenueCard
                  key={row.key}
                  exp={row.exp}
                  next={row.next}
                  dates={row.dates}
                  distanceMi={row.dist}
                />
              ) : row.cityClass ? (
                <CityVenueCard
                  key={row.key}
                  c={row.cityClass}
                  next={row.next}
                  dates={row.dates}
                  distanceMi={row.dist}
                />
              ) : null,
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/** The next few upcoming dates beyond the soonest ("Next") — so a recurring
 *  venue (e.g. weekly water aerobics) shows more than one date. Renders nothing
 *  for single-date venues. */
function MoreDates({ dates }: { dates?: string[] }) {
  if (!dates || dates.length <= 1) return null;
  const extra = dates.slice(1); // dates[0] is already shown as "Next"
  const shown = extra.slice(0, 3);
  const remaining = extra.length - shown.length;
  return (
    <p className="mt-1 text-xs text-muted-foreground">
      <span className="font-medium text-brand-dark">More dates:</span>{" "}
      {shown.map(fmtMonthDay).join(" · ")}
      {remaining > 0 ? ` · +${remaining} more` : ""}
    </p>
  );
}

function VenueCard({
  exp,
  next,
  dates,
  distanceMi,
}: {
  exp: Experience;
  next?: { startAt: string; spotsLeft?: number | null };
  dates?: string[];
  distanceMi?: number;
}) {
  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <Link to={`/locations/${exp.slug}`}>
        <img
          src={exp.image}
          alt={`${exp.title}, ${exp.city}`}
          loading="lazy"
          className="h-24 w-24 flex-shrink-0 cursor-pointer rounded-xl object-cover sm:h-28 sm:w-28"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/locations/${exp.slug}`} className="min-w-0">
            <h3 className="cursor-pointer text-base font-bold leading-snug hover:text-brand-dark">
              {exp.title}
            </h3>
          </Link>
          {typeof distanceMi === "number" ? (
            <span className="whitespace-nowrap rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-dark">
              {distanceMi < 1 ? "<1" : Math.round(distanceMi)} mi away
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm font-medium text-muted-foreground">
          {exp.venue ? `${exp.venue} · ` : ""}
          {exp.city}
        </p>

        <div className="mt-2 text-sm">
          {next ? (
            <span className="text-foreground">
              Next: <span className="font-medium">{fmtDate(next.startAt)}</span>{" "}
              · {fmtTime(next.startAt)}
              {typeof next.spotsLeft === "number" && next.spotsLeft > 0 ? (
                <span className="text-muted-foreground"> · {next.spotsLeft} spots</span>
              ) : null}
            </span>
          ) : (
            <span className="text-muted-foreground">See calendar for dates</span>
          )}
        </div>
        <MoreDates dates={dates} />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <DirectionsButton dest={venueDestination(exp)} />
          <FareHarborButton
            itemId={exp.itemId}
            className="cursor-pointer rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Book
          </FareHarborButton>
        </div>
      </div>
    </article>
  );
}

// Generic soundbath image for city-class cards (they have no per-venue photo).
const CITY_CARD_IMAGE = "/floating-boards-sunset.jpg";

/** A city-run class in the finder list — books through the city, not FareHarbor. */
function CityVenueCard({
  c,
  next,
  dates,
  distanceMi,
}: {
  c: CityClass;
  next?: { startAt: string };
  dates?: string[];
  distanceMi?: number;
}) {
  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <Link to={`/locations/${c.slug}`}>
        <img
          src={c.image || CITY_CARD_IMAGE}
          alt={`${c.title}, ${c.city}`}
          loading="lazy"
          className="h-24 w-24 flex-shrink-0 cursor-pointer rounded-xl object-cover sm:h-28 sm:w-28"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/locations/${c.slug}`} className="min-w-0">
            <h3 className="cursor-pointer text-base font-bold leading-snug hover:text-brand-dark">
              {c.title}
            </h3>
          </Link>
          {typeof distanceMi === "number" ? (
            <span className="whitespace-nowrap rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-dark">
              {distanceMi < 1 ? "<1" : Math.round(distanceMi)} mi away
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm font-medium text-muted-foreground">
          {c.venue} · {c.city}
        </p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-brand">
          {c.fareharborItemId ? "Featured event" : "City class · book with the city"}
        </p>
        {c.note ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {c.note}
          </p>
        ) : null}

        <div className="mt-2 text-sm">
          {next ? (
            <span className="text-foreground">
              Next: <span className="font-medium">{fmtDate(next.startAt)}</span>{" "}
              · {fmtTime(next.startAt)}
            </span>
          ) : (
            <span className="text-muted-foreground">See calendar for dates</span>
          )}
        </div>
        <MoreDates dates={dates} />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {hasRoutableLocation(cityClassDestination(c)) ? (
            <DirectionsButton dest={cityClassDestination(c)} />
          ) : (
            <span />
          )}
          {c.fareharborItemId ? (
            <FareHarborButton
              itemId={c.fareharborItemId}
              className="cursor-pointer rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Book
            </FareHarborButton>
          ) : c.bookingUrl ? (
            <a
              href={appendUtms(c.bookingUrl)}
              target="_blank"
              rel="noopener noreferrer"
              title={c.bookingLabel}
              onClick={() => trackEvent("city_register_click", { city: c.city })}
              className="cursor-pointer rounded-full border border-primary px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Register →
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
