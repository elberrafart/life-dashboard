-- Singleton table holding shared Knowledge Hub content (videos, books,
-- intro, podcast). Same row is shown to every user. Writes go through the
-- service-role client (adminSetKnowledgeHub) and bypass RLS; any signed-in
-- user can read the single row.

CREATE TABLE IF NOT EXISTS knowledge_hub (
  id         text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  content    jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE knowledge_hub ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_hub: authenticated read"
  ON knowledge_hub
  FOR SELECT
  TO authenticated
  USING (true);
