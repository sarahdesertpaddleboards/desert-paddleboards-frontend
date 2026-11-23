-- Text messages alongside email (Twilio).
-- sms_opt_in: the staff member ticked "Text me shift updates" (carriers
-- require explicit consent; it is never switched on for them).

ALTER TABLE staff ADD COLUMN sms_opt_in INTEGER NOT NULL DEFAULT 0;
ALTER TABLE staff ADD COLUMN sms_consent_at TEXT;      -- when they last opted in
ALTER TABLE staff ADD COLUMN sms_opted_out_at TEXT;    -- when they opted out (unticked or replied STOP)

CREATE TABLE sms_log (
  id           TEXT PRIMARY KEY,
  staff_id     TEXT REFERENCES staff(id) ON DELETE SET NULL,
  to_phone     TEXT NOT NULL,
  kind         TEXT NOT NULL,          -- welcome | login_link | confirmation | paid
  body         TEXT NOT NULL,
  provider_id  TEXT,                   -- Twilio message SID
  status       TEXT NOT NULL,          -- sent | failed | skipped
  error        TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_sms_log_staff ON sms_log(staff_id, created_at);
