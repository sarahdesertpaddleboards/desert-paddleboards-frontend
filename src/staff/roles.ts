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
