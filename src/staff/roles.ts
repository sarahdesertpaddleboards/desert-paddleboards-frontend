/** Labels for shift roles and staff skills. Keep in step with server/staff/roles.js. */
import type { Application, Role, Shift, Skill } from "./api";

export const ROLES: Role[] = ["lead", "teacher", "artist", "general"];
export const SKILLS: Skill[] = [...ROLES, "trailer"];

export const ROLE_LABELS: Record<Role, string> = {
  lead: "Event lead",
  teacher: "Teacher",
  artist: "Artist",
  general: "Event staff",
};

/** Short labels for chips and tight rows. */
export const ROLE_SHORT: Record<Role, string> = {
  lead: "Lead",
  teacher: "Teacher",
  artist: "Artist",
  general: "Event staff",
};

export const SKILL_LABELS: Record<Skill, string> = { ...ROLE_LABELS, trailer: "Trailer driver" };

/** Lower-case skill names for "(lead, trailer)" lists. */
export const SKILL_SHORT: Record<Skill, string> = {
  lead: "lead",
  teacher: "teacher",
  artist: "artist",
  general: "event staff",
  trailer: "trailer",
};

export const SKILL_HINTS: Record<Skill, string> = {
  lead: "Can run the event on the day. Sarah picks the lead for each shift",
  teacher: "Yoga, pilates or aerobics",
  artist: "Sound bowls or music",
  general: "Set-up, boards, guests",
  trailer: "Can tow the boards to and from events. Sarah picks the driver",
};

/**
 * "What's expected" for each role, shown on the profile (tap to expand).
 * Event lead is condensed from Sarah's Event Manager Playbook; the others are
 * drafts for Sarah to edit.
 */
export const ROLE_GUIDE: Record<Skill, string[]> = {
  lead: [
    "You're in charge on the day: lead the team, look after the guests, and keep the event safe and on time.",
    "Arrive first. Check the venue, plan where the boards, lane lines and musician go (think sunset, power, guest flow).",
    "Count the boards and check each has 2 bungees and 2 carabiners. Text Shellie if supplies are low.",
    "Set up check-in: roster, clipboard, bracelets, stickers, lavender eye masks. Kava only for guests who prepaid.",
    "Do the sound check, then brief the team: who does what, guest entry, anyone with limited mobility.",
    "During: watch guest safety, support the team, stay off your personal phone.",
    "After: thank every guest, show the Google review QR code and the tip jar, pack everything neatly, report anything damaged, upload photos to the shared album, and do a 5-minute debrief.",
    "Wear a Desert Paddleboards or Blue Wave polo and bring a swimsuit. You'll get the venue contact the day before.",
  ],
  teacher: [
    "Lead the class (yoga, pilates or water fitness) for the full booked time.",
    "Arrive early to check the space, the boards or mats, and the sound.",
    "Keep it safe and welcoming for every level, and check in with the event lead before you start.",
  ],
  artist: [
    "Create the soundbath: bring your instruments (bowls, drum, handpan…) and play for the agreed length.",
    "Set up where the event lead shows you and do a sound check before guests arrive.",
    "Check the shift notes for anything the client asked for (length, instruments, style).",
    "If you're the only one working a shift, you're the event lead for it too.",
  ],
  general: [
    "Help the event lead make it run smoothly: unload and inflate boards, set them out, welcome and check in guests.",
    "Help guests on and off the boards; you may be in the water, so bring a swimsuit.",
    "Wear a Desert Paddleboards or Blue Wave polo. At the end, help pack up neatly and dry.",
  ],
  trailer: [
    "Pick up the trailer and boards, tow them to the event, and bring them back afterwards.",
    "You need a valid driver's license and a vehicle that can tow. Allow extra time to get there early.",
    "Usually the trailer driver is also the event lead or event staff on that shift.",
  ],
};

/**
 * What staff pick when they put their name down (server: APPLY_ROLES in
 * server/staff/roles.js). Event staff covers the lead and general spots: Sarah
 * decides who leads, and who tows the trailer, when she confirms. Artists and
 * teachers are specialists and apply for those spots directly.
 */
export const APPLY_ROLES: Role[] = ["general", "artist", "teacher"];

const applyPool = (r: Role): Role[] => (r === "general" ? ["lead", "general"] : [r]);

/** The choices a shift offers staff right now, with the open spots for each. */
export function applyChoices(shift: Pick<Shift, "roles">): { role: Role; open: number }[] {
  return APPLY_ROLES.map((role) => {
    const spots = shift.roles.filter((r) => applyPool(role).includes(r.role));
    return { role, has: spots.length > 0, open: spots.reduce((t, r) => t + Math.max(0, r.needed - r.confirmed), 0) };
  })
    .filter((c) => c.has && c.open > 0)
    .map(({ role, open }) => ({ role, open }));
}

/** Is this a choice the person's profile skills match? (Leads count as event staff.) */
export function skillMatches(role: Role, skills: Skill[]): boolean {
  return applyPool(role).some((r) => skills.includes(r));
}

/** "Artist + trailer" */
export function applicationRoleLabel(a: Pick<Application, "role" | "trailer">, short = false): string {
  const base = (short ? ROLE_SHORT : ROLE_LABELS)[a.role] ?? a.role;
  return a.trailer ? `${base} + trailer` : base;
}
