-- Sample data for demoing the staff tool (preview database only).
--
--   pnpm cf d1 execute dpb-staff-preview --remote --env preview --file scripts/staff-demo/seed.sql
--
-- Adds five made-up staff (…@demo.invalid, 555-01xx numbers: the app never
-- emails or texts them), applications on the next real soundbath and fitness
-- shifts from the calendar, and three past "Private Floating Soundbath"
-- shifts so Payroll has people to pay and a paid history.
-- Safe to re-run: it clears the previous sample data first. Remove it all
-- with reset.sql. Needs at least one admin on the roster (Sarah or Nick).
-- (D1 allows only a few UNIONs per statement, hence plain VALUES rows.)

DELETE FROM email_log WHERE to_email LIKE '%@demo.invalid';
DELETE FROM sms_log WHERE to_phone LIKE '+1___55501__';
DELETE FROM staff WHERE id LIKE 'demo_%';
DELETE FROM events WHERE id LIKE 'demo_%';

-- People ------------------------------------------------------------------
INSERT INTO staff (id, email, name, phone, payout_method, payout_handle, role, status, skills, sms_opt_in, sms_consent_at,
                   invited_at, first_login_at, last_login_at, notes) VALUES
  ('demo_stf_maya', 'maya.lopez@demo.invalid', 'Maya Lopez', '(602) 555-0141', 'venmo', '@maya-lopez', 'staff', 'active',
   'lead,general,trailer', 1, '2026-10-20T16:00:00Z', '2026-10-18T16:00:00Z', '2026-10-20T16:00:00Z', '2026-11-17T02:00:00Z',
   'Sample person for the demo. Has a truck with a hitch.'),
  ('demo_stf_jordan', 'jordan.reyes@demo.invalid', 'Jordan Reyes', '(480) 555-0172', 'zelle', 'jordan.reyes@demo.invalid', 'staff', 'active',
   'artist,general', 0, NULL, '2026-10-18T16:00:00Z', '2026-10-21T16:00:00Z', '2026-11-15T02:00:00Z',
   'Sample person for the demo. Crystal bowls + handpan.'),
  ('demo_stf_priya', 'priya.shah@demo.invalid', 'Priya Shah', '(602) 555-0118', 'venmo', '@priya-flows', 'staff', 'active',
   'teacher,general', 1, '2026-10-22T16:00:00Z', '2026-10-18T16:00:00Z', '2026-10-22T16:00:00Z', '2026-11-18T02:00:00Z',
   'Sample person for the demo. Certified yoga + aqua fitness.'),
  ('demo_stf_ben', 'ben.carter@demo.invalid', 'Ben Carter', '(480) 555-0190', 'cashapp', '$bencarter', 'staff', 'active',
   'general,trailer', 0, NULL, '2026-10-25T16:00:00Z', '2026-10-25T18:00:00Z', '2026-11-16T02:00:00Z',
   'Sample person for the demo.'),
  ('demo_stf_alex', 'alex.kim@demo.invalid', 'Alex Kim', NULL, NULL, NULL, 'staff', 'invited',
   NULL, 0, NULL, '2026-11-16T18:00:00Z', NULL, NULL,
   'Sample person for the demo. Invited, hasn''t signed in yet.');

UPDATE staff SET invited_by = (SELECT id FROM staff WHERE role = 'admin' ORDER BY created_at LIMIT 1) WHERE id LIKE 'demo_%';

-- Past shifts (made up) -----------------------------------------------------
INSERT INTO events (id, title, venue, city, start_at, end_at, source, staff_needed, trailer_needed, notes, status) VALUES
  ('demo_ev_nov1',  'Private Floating Soundbath', 'Demo venue', 'Mesa', '2026-11-01T09:00:00-07:00', '2026-11-01T10:30:00-07:00', 'manual', 2, 0, 'Sample shift for the demo.', 'open'),
  ('demo_ev_nov8',  'Private Floating Soundbath', 'Demo venue', 'Mesa', '2026-11-08T17:30:00-07:00', '2026-11-08T19:00:00-07:00', 'manual', 3, 1, 'Sample shift for the demo.', 'open'),
  ('demo_ev_nov14', 'Private Floating Soundbath', 'Demo venue', 'Mesa', '2026-11-14T17:30:00-07:00', '2026-11-14T19:00:00-07:00', 'manual', 3, 0, 'Sample shift for the demo.', 'open');

UPDATE events SET created_by = (SELECT id FROM staff WHERE role = 'admin' ORDER BY created_at LIMIT 1) WHERE id LIKE 'demo_%';

INSERT INTO event_roles (event_id, role, needed) VALUES
  ('demo_ev_nov1', 'lead', 1), ('demo_ev_nov1', 'artist', 1),
  ('demo_ev_nov8', 'lead', 1), ('demo_ev_nov8', 'artist', 1), ('demo_ev_nov8', 'general', 1),
  ('demo_ev_nov14', 'lead', 1), ('demo_ev_nov14', 'general', 2);

-- Who worked them. Nov 1 is already paid; Nov 8 and Nov 14 are owed.
-- Nov 14 keeps one general spot open, for adding the demo staffer during the demo.
INSERT INTO applications (id, event_id, staff_id, status, role, trailer, pay_cents, confirmed_at, paid_at, paid_note) VALUES
  ('demo_app_nov1_maya',   'demo_ev_nov1',  'demo_stf_maya',   'confirmed', 'lead',    0,  6000, '2026-10-28T18:00:00Z', '2026-11-03T18:00:00Z', 'Venmo Nov 3'),
  ('demo_app_nov1_jordan', 'demo_ev_nov1',  'demo_stf_jordan', 'confirmed', 'artist',  0,  8500, '2026-10-28T18:00:00Z', '2026-11-03T18:00:00Z', 'Zelle Nov 3'),
  ('demo_app_nov8_maya',   'demo_ev_nov8',  'demo_stf_maya',   'confirmed', 'lead',    1, 11000, '2026-11-02T18:00:00Z', NULL, NULL),
  ('demo_app_nov8_jordan', 'demo_ev_nov8',  'demo_stf_jordan', 'confirmed', 'artist',  0,  8500, '2026-11-02T18:00:00Z', NULL, NULL),
  ('demo_app_nov8_ben',    'demo_ev_nov8',  'demo_stf_ben',    'confirmed', 'general', 0,  6000, '2026-11-02T18:00:00Z', NULL, NULL),
  ('demo_app_nov14_priya', 'demo_ev_nov14', 'demo_stf_priya',  'confirmed', 'lead',    0,  7000, '2026-11-09T18:00:00Z', NULL, NULL),
  ('demo_app_nov14_ben',   'demo_ev_nov14', 'demo_stf_ben',    'confirmed', 'general', 0,  6000, '2026-11-09T18:00:00Z', NULL, NULL);

UPDATE applications
   SET confirmed_by = (SELECT id FROM staff WHERE role = 'admin' ORDER BY created_at LIMIT 1),
       paid_by = CASE WHEN paid_at IS NOT NULL THEN (SELECT id FROM staff WHERE role = 'admin' ORDER BY created_at LIMIT 1) END
 WHERE id LIKE 'demo_app_nov%';

-- Upcoming: applicants on real calendar shifts ------------------------------
-- The next soundbath (2+ days out): three people applied, nobody confirmed yet.
-- Staff apply as event staff or artist; Sarah picks the lead + trailer at confirm.
INSERT INTO applications (id, event_id, staff_id, status, role, trailer, staff_note)
SELECT v.column1, ev.id, v.column2, 'applied', v.column3, v.column4, v.column5
FROM (VALUES
  ('demo_app_up_maya',   'demo_stf_maya',   'general', 0, 'Happy to lead, and I can bring the trailer.'),
  ('demo_app_up_jordan', 'demo_stf_jordan', 'artist',  0, NULL),
  ('demo_app_up_ben',    'demo_stf_ben',    'general', 0, 'Can get there by 4:30 to set up.')) v,
(SELECT id FROM events
  WHERE status = 'open' AND auto_posted = 1 AND lower(title) LIKE '%soundbath%' AND datetime(start_at) > datetime('now', '+2 days')
    AND id IN (SELECT event_id FROM event_roles WHERE role = 'artist')
    AND id IN (SELECT event_id FROM event_roles WHERE role = 'general')
  ORDER BY datetime(start_at) LIMIT 1) ev;

-- The next fitness / yoga shift: Maya already confirmed as lead, Priya applied to teach.
INSERT INTO applications (id, event_id, staff_id, status, role, trailer, pay_cents, confirmed_at)
SELECT v.column1, ev.id, v.column2, v.column3, v.column4, 0, v.column5, v.column6
FROM (VALUES
  ('demo_app_fit_maya',  'demo_stf_maya',  'confirmed', 'lead',    6000, '2026-11-16T18:00:00Z'),
  ('demo_app_fit_priya', 'demo_stf_priya', 'applied',   'teacher', NULL, NULL)) v,
(SELECT id FROM events
  WHERE status = 'open' AND auto_posted = 1 AND datetime(start_at) > datetime('now', '+2 days')
    AND id IN (SELECT event_id FROM event_roles WHERE role = 'teacher')
  ORDER BY datetime(start_at) LIMIT 1) ev;

-- Alex (invited, never signed in) already confirmed as artist on the soundbath after that.
INSERT INTO applications (id, event_id, staff_id, status, role, trailer, pay_cents, confirmed_at)
SELECT 'demo_app_up2_alex', ev.id, 'demo_stf_alex', 'confirmed', 'artist', 0, 8500, '2026-11-16T18:00:00Z'
FROM (SELECT id FROM events
  WHERE status = 'open' AND auto_posted = 1 AND lower(title) LIKE '%soundbath%' AND datetime(start_at) > datetime('now', '+2 days')
    AND id IN (SELECT event_id FROM event_roles WHERE role = 'artist')
  ORDER BY datetime(start_at) LIMIT 1 OFFSET 1) ev;

UPDATE applications SET confirmed_by = (SELECT id FROM staff WHERE role = 'admin' ORDER BY created_at LIMIT 1)
 WHERE id IN ('demo_app_fit_maya', 'demo_app_up2_alex');
