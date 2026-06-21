/// <reference types="@types/google.maps" />
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MapView } from "@/components/Map";
import FareHarborButton from "@/components/FareHarborButton";
import { experiences, type Experience } from "@/data/locations";
import { getUpcomingSessions, type UpcomingSession } from "@/lib/experiencesApi";
// Homepage hero — Sarah's signature sunset shot: branded boards on the
// evening floating soundbath at a resort pool — floats on the water, candle
// lanterns and a sound-healer with crystal bowls (self-hosted in /public).
const heroImage = "/floating-soundbath-evening.jpg";

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
  return `<div style="max-width:230px;line-height:1.35;font-family:inherit">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#3e7c84">${escapeHtml(exp.city)}, ${escapeHtml(exp.state)}</div>
    <div style="font-size:15px;font-weight:700;color:#0f172a;margin-top:2px">${escapeHtml(exp.title)}</div>
    ${venue}
    <div style="font-size:13px;color:#334155;margin-top:6px">${when}</div>
    <a href="/locations/${exp.slug}" style="display:inline-block;margin-top:8px;font-size:13px;font-weight:700;color:#1f3a4d;text-decoration:underline">View details →</a>
  </div>`;
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

  // Live ref to the sessions map so marker click handlers (created once, when
  // the map loads) read the latest "next session" data without stale closures.
  const nextByItemRef = useRef(nextByItem);
  useEffect(() => {
    nextByItemRef.current = nextByItem;
  }, [nextByItem]);

  const cities = useMemo(
    () =>
      [...new Set(experiences.map((e) => e.city))].sort((a, b) =>
        a.localeCompare(b),
      ),
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

  const visible = useMemo(() => {
    let list = experiences.slice();
    if (selectedCity) list = list.filter((e) => e.city === selectedCity);

    list.sort((a, b) => {
      if (origin) {
        return (
          (distanceByItem.get(a.itemId) ?? Infinity) -
          (distanceByItem.get(b.itemId) ?? Infinity)
        );
      }
      // default: soonest next session first, venues without sessions last
      const an = nextByItem.get(a.itemId)?.startAt ?? "9999";
      const bn = nextByItem.get(b.itemId)?.startAt ?? "9999";
      return an.localeCompare(bn);
    });
    return list;
  }, [selectedCity, origin, distanceByItem, nextByItem]);

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
          alt="Evening floating soundbath at a resort pool, with guests floating on the water by candlelight"
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 via-brand-dark/45 to-brand-dark/15" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
            Floating soundbaths · water wellness · Arizona
          </p>
          <h1 className="mt-2 max-w-[18ch] text-4xl italic leading-[1.05] text-white md:text-5xl">
            Naps just got a live band.
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
              empty grey box; the search + list still work without it. */}
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

          {/* Venue list */}
          <div className="space-y-4">
            {visible.map((exp) => (
              <VenueCard
                key={exp.slug}
                exp={exp}
                next={nextByItem.get(exp.itemId)}
                distanceMi={distanceByItem.get(exp.itemId)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function VenueCard({
  exp,
  next,
  distanceMi,
}: {
  exp: Experience;
  next?: UpcomingSession;
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
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            {exp.city}, {exp.state}
          </p>
          {typeof distanceMi === "number" ? (
            <span className="whitespace-nowrap rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-dark">
              {distanceMi < 1 ? "<1" : Math.round(distanceMi)} mi away
            </span>
          ) : null}
        </div>
        <Link to={`/locations/${exp.slug}`}>
          <h3 className="cursor-pointer text-base font-bold leading-snug hover:text-brand-dark">
            {exp.title}
          </h3>
        </Link>
        {exp.venue ? (
          <p className="truncate text-sm text-muted-foreground">{exp.venue}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm">
            {next ? (
              <span className="text-foreground">
                Next: <span className="font-medium">{fmtDate(next.startAt)}</span>{" "}
                · {fmtTime(next.startAt)}
                {typeof next.spotsLeft === "number" && next.spotsLeft > 0 ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {next.spotsLeft} spots
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-muted-foreground">See calendar for dates</span>
            )}
          </div>
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
