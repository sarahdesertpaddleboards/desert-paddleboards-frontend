-- Roles per shift, the trailer add-on, staffing templates and calendar auto-posting.

-- How many people each shift needs per role, and the usual pay for that role
-- (pre-fills the confirm box; staff don't see it).
--   lead    = event team leader
--   teacher = yoga / pilates / aerobics teacher
--   artist  = sound bowls / musician
--   general = general staff
CREATE TABLE event_roles (
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('lead','teacher','artist','general')),
  needed     INTEGER NOT NULL DEFAULT 1,
  pay_cents  INTEGER,
  PRIMARY KEY (event_id, role)
);
-- Existing shifts become "general staff" with their old head count and pay.
INSERT INTO event_roles (event_id, role, needed, pay_cents)
  SELECT id, 'general', staff_needed, default_pay_cents FROM events;

-- Trailer driver is an add-on to someone's role on the shift (they always work
-- the event too), with its own extra pay. events.staff_needed stays the total
-- of event_roles.needed so the existing "x of y confirmed" counts keep working.
ALTER TABLE events ADD COLUMN trailer_needed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN trailer_pay_cents INTEGER;

-- Calendar auto-posting. calendar_key identifies the public-calendar session a
-- shift came from: fh:<availability pk> | fhx:<item id>:<start> | city:<slug>:<start>.
ALTER TABLE events ADD COLUMN calendar_key TEXT;
ALTER TABLE events ADD COLUMN auto_posted INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN calendar_missing_at TEXT;   -- set when the session left the public calendar
ALTER TABLE events ADD COLUMN times_edited INTEGER NOT NULL DEFAULT 0;  -- Sarah changed the times: sync leaves them alone
CREATE UNIQUE INDEX idx_events_calendar_key ON events(calendar_key);
UPDATE events SET calendar_key = 'fh:' || fareharbor_availability_pk WHERE fareharbor_availability_pk IS NOT NULL;

-- Calendar sessions Sarah deleted on purpose, so the sync doesn't re-post them.
CREATE TABLE calendar_dismissed (
  calendar_key  TEXT PRIMARY KEY,
  dismissed_by  TEXT REFERENCES staff(id) ON DELETE SET NULL,
  dismissed_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Which role someone applied for / is confirmed in, and whether they're also
-- driving the trailer. pay_cents stays the TOTAL locked in (role pay + trailer
-- pay); trailer_pay_cents is the trailer part of it, for display.
ALTER TABLE applications ADD COLUMN role TEXT NOT NULL DEFAULT 'general';
ALTER TABLE applications ADD COLUMN trailer INTEGER NOT NULL DEFAULT 0;
ALTER TABLE applications ADD COLUMN trailer_pay_cents INTEGER;

-- What each person can do: comma list of lead,teacher,artist,general,trailer.
ALTER TABLE staff ADD COLUMN skills TEXT;

-- Staffing templates: what an auto-posted (or new) shift needs. The first
-- template whose keywords appear in the session title wins; otherwise the
-- default one. auto_post = 0 keeps matching sessions off the staff list.
CREATE TABLE shift_templates (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  match_keywords     TEXT,                          -- comma list, case-insensitive
  roles_json         TEXT NOT NULL,                 -- [{"role":"lead","needed":1,"payCents":null}, ...]
  trailer_needed     INTEGER NOT NULL DEFAULT 0,
  trailer_pay_cents  INTEGER,
  notes              TEXT,
  auto_post          INTEGER NOT NULL DEFAULT 1,
  is_default         INTEGER NOT NULL DEFAULT 0,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO shift_templates (id, name, match_keywords, roles_json, trailer_needed, sort_order, is_default) VALUES
  ('tpl_soundbath', 'Floating soundbath', 'soundbath,sound bath',
   '[{"role":"lead","needed":1,"payCents":null},{"role":"artist","needed":1,"payCents":null},{"role":"general","needed":1,"payCents":null}]',
   1, 10, 0),
  ('tpl_fitness', 'Water fitness, yoga and pilates', 'yoga,pilates,aerobics,fitness',
   '[{"role":"lead","needed":1,"payCents":null},{"role":"teacher","needed":1,"payCents":null}]',
   1, 20, 0),
  ('tpl_default', 'Everything else', NULL,
   '[{"role":"lead","needed":1,"payCents":null},{"role":"general","needed":1,"payCents":null}]',
   1, 100, 1);

-- Small key/value store (e.g. when the calendar last synced).
CREATE TABLE staff_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
