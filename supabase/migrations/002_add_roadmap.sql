-- Per-user coaching roadmap. Admin-writable, user-readable.
--
-- Writes happen only through the service-role client (adminSetRoadmap),
-- which bypasses RLS. Reads by the owning user go through the existing
-- "user_profiles: own row access" policy from 001_add_rls.sql, so no new
-- policy is needed here.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS roadmap JSONB;
