-- Remove all demo data from the preview staff database:
--   pnpm cf d1 execute dpb-staff-preview --remote --env preview --file scripts/staff-demo/reset.sql
--
-- Removes the sample people from seed.sql (…@demo.invalid), the made-up past
-- shifts, and the demo staffer created live during the demo (any email with
-- "+demo@" in it, e.g. yourname+demo@gmail.com), with all their applications,
-- logins and log rows. Real calendar shifts stay; only demo people come off them.

DELETE FROM email_log WHERE to_email LIKE '%@demo.invalid' OR to_email LIKE '%+demo@%';
DELETE FROM sms_log WHERE to_phone LIKE '+1___55501__'
   OR staff_id IN (SELECT id FROM staff WHERE email LIKE '%+demo@%');
DELETE FROM staff WHERE id LIKE 'demo_%' OR email LIKE '%@demo.invalid' OR email LIKE '%+demo@%';
DELETE FROM events WHERE id LIKE 'demo_%';
