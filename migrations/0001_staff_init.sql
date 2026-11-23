-- Staff scheduling tool: initial schema.
-- Timestamps are ISO-8601 strings (UTC, "Z" suffix) unless noted.
-- Event times keep their Arizona offset (-07:00) so they display correctly.

CREATE TABLE staff (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,            -- lower-cased
  name           TEXT,
  phone          TEXT,
  payout_method  TEXT,                            -- venmo | zelle | cashapp | paypal | check | other
  payout_handle  TEXT,                            -- e.g. @venmo-name or email/phone for Zelle
  notes          TEXT,                            -- admin-only
  role           TEXT NOT NULL DEFAULT 'staff'  CHECK (role IN ('staff','admin')),
  status         TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','inactive')),
  invited_by     TEXT REFERENCES staff(id),
  invited_at     TEXT,
  first_login_at TEXT,
  last_login_at  TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- One-time email links (login + invite). Only the SHA-256 of the token is stored.
CREATE TABLE login_tokens (
  id          TEXT PRIMARY KEY,
  token_hash  TEXT NOT NULL UNIQUE,
  staff_id    TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  purpose     TEXT NOT NULL CHECK (purpose IN ('login','invite')),
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_login_tokens_staff ON login_tokens(staff_id, created_at);

-- Browser sessions. id = SHA-256 of the cookie value.
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY,
  staff_id      TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  expires_at    TEXT NOT NULL,
  user_agent    TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_seen_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_sessions_staff ON sessions(staff_id);

-- Shifts Sarah needs staff for. Optionally linked to a FareHarbor session
-- (availability pk) or a city class so they stay in step with the public calendar.
CREATE TABLE events (
  id                          TEXT PRIMARY KEY,
  title                       TEXT NOT NULL,
  venue                       TEXT,
  city                        TEXT,
  start_at                    TEXT NOT NULL,     -- ISO with offset, e.g. 2026-11-02T18:30:00-07:00
  end_at                      TEXT,
  source                      TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','fareharbor','city')),
  fareharbor_item_id          INTEGER,
  fareharbor_availability_pk  INTEGER UNIQUE,
  staff_needed                INTEGER NOT NULL DEFAULT 1,
  default_pay_cents           INTEGER,           -- suggested pay, editable per confirmation
  notes                       TEXT,              -- shown to staff
  status                      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','filled','completed','cancelled')),
  created_by                  TEXT REFERENCES staff(id),
  created_at                  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at                  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_events_start ON events(start_at);

-- A staff member's application to work an event, and what happened to it.
-- pay_cents is locked in when Sarah confirms; paid_at when she marks it paid.
CREATE TABLE applications (
  id            TEXT PRIMARY KEY,
  event_id      TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  staff_id      TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied','confirmed','declined','withdrawn')),
  pay_cents     INTEGER,
  staff_note    TEXT,
  confirmed_at  TEXT,
  confirmed_by  TEXT REFERENCES staff(id),
  paid_at       TEXT,
  paid_by       TEXT REFERENCES staff(id),
  paid_note     TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (event_id, staff_id)
);
CREATE INDEX idx_applications_staff ON applications(staff_id, status);
CREATE INDEX idx_applications_event ON applications(event_id, status);

-- Every email we send, for support ("did my link arrive?").
CREATE TABLE email_log (
  id           TEXT PRIMARY KEY,
  staff_id     TEXT REFERENCES staff(id) ON DELETE SET NULL,
  to_email     TEXT NOT NULL,
  kind         TEXT NOT NULL,                     -- login_link | invite | confirmation | paid | ...
  subject      TEXT NOT NULL,
  provider_id  TEXT,
  status       TEXT NOT NULL,                     -- sent | failed | skipped
  error        TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
