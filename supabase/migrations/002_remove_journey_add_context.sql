-- ============================================
-- Migration 002: Companion Change Request April 2026
-- Removes journey dependency, adds context_detected
-- ============================================

-- 1. Add context_detected to session_summaries
--    Stores the AI-detected context per session: building / leading / transitioning / unclear
ALTER TABLE session_summaries
  ADD COLUMN IF NOT EXISTS context_detected TEXT;

-- 2. Make journey nullable in session_summaries
--    Context detection replaces journey. Existing rows keep their value.
--    New rows will have journey = NULL and context_detected populated instead.
ALTER TABLE session_summaries
  ALTER COLUMN journey DROP NOT NULL;

-- ============================================
-- Optional: remove the journey column from users
-- The app no longer reads or writes users.journey.
-- Run this when you're ready to clean up.
-- ============================================
-- ALTER TABLE users DROP COLUMN journey;
