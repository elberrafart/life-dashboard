-- Row Level Security policies for user data isolation.
-- Run this in the Supabase dashboard SQL editor (or via supabase db push).
--
-- NOTE: These policies protect against direct anon-key access.
-- Admin operations use the service role key and always bypass RLS by design.

-- ── user_profiles ──────────────────────────────────────────────────────────────

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and write only their own profile row
CREATE POLICY "user_profiles: own row access"
  ON user_profiles
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── check_ins ──────────────────────────────────────────────────────────────────

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Users can read and write only their own check-ins
CREATE POLICY "check_ins: own row access"
  ON check_ins
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── app_admins ─────────────────────────────────────────────────────────────────

ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;

-- Only the service role (server-side admin client) can manage this table.
-- No anon/authenticated access needed — all admin checks go through the service role.
-- (No policies added intentionally; all direct access is blocked.)
