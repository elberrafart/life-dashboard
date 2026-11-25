-- Admin-built content modules. Each module is a page made of ordered blocks
-- (stored as JSON) that can be placed in the sidebar, on the dashboard, and/or
-- appended to /start-here.
--
-- Writes go through the service-role client (adminSaveModule etc.) and bypass
-- RLS. Signed-in users can only read published modules; admins read drafts via
-- the service-role client.

CREATE TABLE IF NOT EXISTS modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 60),
  title       text NOT NULL CHECK (length(title) BETWEEN 1 AND 80),
  subtitle    text NOT NULL DEFAULT '' CHECK (length(subtitle) <= 200),
  icon        text NOT NULL DEFAULT '📄',
  status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  placements  text[] NOT NULL DEFAULT '{sidebar}',
  sort_order  integer NOT NULL DEFAULT 0,
  blocks      jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS modules_status_sort_idx ON modules (status, sort_order);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules: authenticated read published"
  ON modules
  FOR SELECT
  TO authenticated
  USING (status = 'published');
