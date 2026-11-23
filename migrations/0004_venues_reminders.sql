-- Venue directory, private event contacts, and day-before reminders
-- (from Sarah's walkthrough, 19 Nov 2026).

-- One row per place Sarah works. Shifts link by venue name (case-insensitive),
-- so every auto-posted shift at a venue picks up its address and contact.
--   address        shown to staff (where to go)
--   contact_*      PRIVATE: admins only, and sent to the event lead in the
--                  day-before reminder (Sarah doesn't want staff poaching clients)
--   notes          private notes for admins
CREATE TABLE venues (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  name_key       TEXT NOT NULL UNIQUE,          -- lower(trim(name)), matches events.venue
  address        TEXT,
  contact_name   TEXT,
  contact_phone  TEXT,
  notes          TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Per-shift overrides (private events, or a different contact this time).
-- address is shown to staff; contact_* is private like the venue's.
ALTER TABLE events ADD COLUMN address TEXT;
ALTER TABLE events ADD COLUMN contact_name TEXT;
ALTER TABLE events ADD COLUMN contact_phone TEXT;

-- When this person got their day-before reminder (sent once).
ALTER TABLE applications ADD COLUMN reminded_at TEXT;

-- Sarah's bare minimum for a floating soundbath: one event lead (who also
-- tows the trailer) and one soundbath artist. She adds more as people sign up.
UPDATE shift_templates
   SET roles_json = '[{"role":"lead","needed":1,"payCents":null},{"role":"artist","needed":1,"payCents":null}]',
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
 WHERE id = 'tpl_soundbath';
