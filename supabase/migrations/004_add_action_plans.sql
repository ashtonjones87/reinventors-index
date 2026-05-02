-- Migration 004: Action Plans table
-- Users can store up to 3 action plans (max enforced in application layer).
-- When a 4th session is saved the oldest plan is auto-deleted server-side.

CREATE TABLE IF NOT EXISTS action_plans (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  context_detected   text,
  framework_explored text,
  core_tension       text,
  practical_action   text        NOT NULL,
  open_questions     text,
  shift_observed     text
);

ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own action plans.
-- Server-side operations use the service role key and bypass RLS automatically.
CREATE POLICY action_plans_own ON action_plans
  FOR ALL
  USING (user_id = auth.uid()::text);
