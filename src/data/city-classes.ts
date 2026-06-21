/**
 * CITY-RUN CLASSES — soundbath / water-fitness sessions that book through the
 * cities' OWN registration systems (Queen Creek, Sedona, Avondale, …), NOT
 * FareHarbor. They can't come from the FareHarbor feed, so they're maintained
 * here by hand and merged with the live FareHarbor sessions in the homepage
 * "Upcoming Sessions" calendar (see src/components/UpcomingSessions.tsx).
 *
 * ──────────────────────────────────────────────────────────────────────────
 * TO ADD / UPDATE DATES (the only thing that needs regular upkeep):
 *   Edit each program's `sessions` array. Use Arizona local time with the
 *   -07:00 offset (AZ doesn't observe daylight saving), e.g.
 *       { startAt: "2026-07-10T20:00:00-07:00" }
 *   Past sessions drop off the calendar automatically — no need to delete them,
 *   but tidy them up occasionally.
 * ──────────────────────────────────────────────────────────────────────────
 */

export interface CityClassSession {
  /** ISO datetime, Arizona local (offset -07:00). */
  startAt: string;
  /** Optional ISO end datetime. */
  endAt?: string;
}

export interface CityClass {
  id: string;
  /** Session name shown in the calendar. */
  title: string;
  venue: string;
  city: string;
  state: string;
  address?: string;
  /** External city registration URL (where people actually book). */
  bookingUrl: string;
  /** Button label, e.g. "Register with Queen Creek". */
  bookingLabel: string;
  /** Short note shown under the title (optional). */
  note?: string;
  /** Upcoming dates — maintained by hand (see header). */
  sessions: CityClassSession[];
}

export const cityClasses: CityClass[] = [
  {
    id: "queen-creek-friday-floats",
    title: "Friday Night Floating Soundbath",
    venue: "Queen Creek Recreation Pool",
    city: "Queen Creek",
    state: "AZ",
    address: "22343 E Ryan Rd, Queen Creek, AZ 85142",
    bookingUrl: "https://secure.rec1.com/AZ/queen-creek-az/catalog",
    bookingLabel: "Register with Queen Creek",
    note: "Booked through the Town of Queen Creek — search “swimming” activities.",
    sessions: [
      // EXAMPLE dates (placeholders) — Sarah: replace with the real schedule.
      { startAt: "2026-07-10T20:00:00-07:00" },
      { startAt: "2026-07-24T20:00:00-07:00" },
    ],
  },
  {
    id: "sedona-soundbath",
    title: "Sedona Floating Soundbath",
    venue: "Sedona Community Pool",
    city: "Sedona",
    state: "AZ",
    address: "570 Posse Ground Rd, Sedona, AZ 86336",
    bookingUrl: "https://sedonarecreation.activityreg.com/selectActivity",
    bookingLabel: "Register with City of Sedona",
    note: "Booked through the City of Sedona — search “swimming” activities.",
    sessions: [
      // EXAMPLE date (placeholder) — Sarah: replace with the real schedule.
      { startAt: "2026-07-11T19:30:00-07:00" },
    ],
  },
  {
    id: "avondale-soundbath",
    title: "Avondale Floating Soundbath",
    venue: "Avondale Aquatic Center", // TODO: confirm venue with Sarah
    city: "Avondale",
    state: "AZ",
    // TODO: Sarah — add the City of Avondale registration URL.
    bookingUrl: "",
    bookingLabel: "Register with City of Avondale",
    sessions: [], // TODO: Sarah — add Avondale dates once the URL is set.
  },
];
