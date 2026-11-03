/** Labels for shift roles and staff skills. Keep in step with server/staff/roles.js. */
import type { Application, Role, Skill } from "./api";

export const ROLES: Role[] = ["lead", "teacher", "artist", "general"];
export const SKILLS: Skill[] = [...ROLES, "trailer"];

export const ROLE_LABELS: Record<Role, string> = {
  lead: "Event team leader",
  teacher: "Teacher",
  artist: "Artist",
  general: "General staff",
};

/** Short labels for chips and tight rows. */
export const ROLE_SHORT: Record<Role, string> = {
  lead: "Lead",
  teacher: "Teacher",
  artist: "Artist",
  general: "General",
};

export const SKILL_LABELS: Record<Skill, string> = { ...ROLE_LABELS, trailer: "Trailer driver" };

export const SKILL_HINTS: Record<Skill, string> = {
  lead: "Runs the event on the day",
  teacher: "Yoga, pilates or aerobics",
  artist: "Sound bowls or music",
  general: "Set-up, boards, guests",
  trailer: "Tows the boards to and from events",
};

/** "Artist + trailer" */
export function applicationRoleLabel(a: Pick<Application, "role" | "trailer">, short = false): string {
  const base = (short ? ROLE_SHORT : ROLE_LABELS)[a.role] ?? a.role;
  return a.trailer ? `${base} + trailer` : base;
}
