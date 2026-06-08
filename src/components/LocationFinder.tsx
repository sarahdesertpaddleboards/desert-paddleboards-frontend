/// <reference types="@types/google.maps" />
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapView } from "@/components/Map";
import FareHarborButton from "@/components/FareHarborButton";
import { experiences, type Experience } from "@/data/locations";
import { getUpcomingSessions, type UpcomingSession } from "@/lib/experiencesApi";

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

export default function LocationFinder() {
  const [sessions, setSessions] = useState<UpcomingSession[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [geoError, setGeoError] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const originMarkerRef = useRef<any>(null);

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
    const bounds = new g.maps.LatLngBounds();
    for (const e of experiences) {
      new g.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: e.lat, lng: e.lng },
        title: `${e.title}${e.venue ? ` — ${e.venue}` : ""}, ${e.city}`,
      });
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
          map.setCenter(next);
          map.setZoom(10);
          if (originMarkerRef.current) originMarkerRef.current.map = null;
          originMarkerRef.current = new g.maps.marker.AdvancedMarkerElement({
            map,
            position: next,
            title: "You",
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
    <section id="finder" className="space-y-6">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
          Find a session near you
        </p>
        <h2 className="text-3xl font-bold leading-tight">
          Floating soundbaths across the Valley
        </h2>
        <p className="text-muted-foreground">
          See where every experience is on the map, find what&apos;s closest to
          you, and book the date that suits — all in one place.
        </p>
      </div>

      {/* City / ZIP distance search */}
      <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your city or ZIP to sort by distance"
          className="w-full max-w-sm rounded-full border border-border bg-background px-5 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-600"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Find nearest
        </button>
        {origin ? (
          <button
            type="button"
            onClick={clearOrigin}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        ) : null}
      </form>
      {originLabel ? (
        <p className="-mt-2 text-sm text-muted-foreground">
          Showing distance from <span className="font-medium">{originLabel}</span>
        </p>
      ) : null}
      {geoError ? <p className="-mt-2 text-sm text-red-600">{geoError}</p> : null}

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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Map */}
        <div className="lg:sticky lg:top-24 lg:h-[560px]">
          <MapView
            initialCenter={PHOENIX_CENTER}
            initialZoom={9}
            onMapReady={handleMapReady}
            className="h-[360px] w-full overflow-hidden rounded-2xl border border-border lg:h-[560px]"
          />
        </div>

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
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
            {exp.city}, {exp.state}
          </p>
          {typeof distanceMi === "number" ? (
            <span className="whitespace-nowrap rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
              {distanceMi < 1 ? "<1" : Math.round(distanceMi)} mi away
            </span>
          ) : null}
        </div>
        <Link to={`/locations/${exp.slug}`}>
          <h3 className="cursor-pointer text-base font-bold leading-snug hover:text-cyan-800">
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
