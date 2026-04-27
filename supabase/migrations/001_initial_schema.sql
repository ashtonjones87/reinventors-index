-- ============================================
-- TABLE 1: users
-- ============================================
CREATE TABLE users (
  id text PRIMARY KEY,
  email text NOT NULL,
  name text,
  journey text CHECK (journey IN ('founder', 'innovator', 'leader')),
  created_at timestamptz DEFAULT now(),
  invite_accepted_at timestamptz
);

-- Enable Row Level Security on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read/write their own row
CREATE POLICY users_own ON users
  USING (id = auth.uid()::text);


-- ============================================
-- TABLE 2: session_summaries
-- ============================================
CREATE TABLE session_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_date timestamptz DEFAULT now() NOT NULL,
  journey text NOT NULL,
  framework_explored text NOT NULL,
  core_tension text NOT NULL,
  practical_action text NOT NULL,
  open_questions text NOT NULL,
  shift_observed text NOT NULL,
  raw_transcript text NOT NULL
);

-- Enable Row Level Security on session_summaries
ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read/write their own session summaries
CREATE POLICY summaries_own ON session_summaries
  USING (user_id = auth.uid()::text);


-- ============================================
-- TABLE 3: diagnostics
-- ============================================
CREATE TABLE diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  taken_at timestamptz DEFAULT now() NOT NULL,
  intuitive numeric(4,2) NOT NULL,
  analytical numeric(4,2) NOT NULL,
  proactive numeric(4,2) NOT NULL,
  reactive numeric(4,2) NOT NULL,
  collaborative numeric(4,2) NOT NULL,
  directive numeric(4,2) NOT NULL,
  cognitive numeric(4,2) NOT NULL,
  spiritual_purpose numeric(4,2) NOT NULL,
  raw_responses jsonb NOT NULL
);

-- Enable Row Level Security on diagnostics
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read/write their own diagnostic results
CREATE POLICY diagnostics_own ON diagnostics
  USING (user_id = auth.uid()::text);


-- ============================================
-- TABLE 4: chat_usage
-- ============================================
CREATE TABLE chat_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message_count integer DEFAULT 0 NOT NULL,
  window_start timestamptz DEFAULT now() NOT NULL,
  is_authenticated_member boolean DEFAULT true NOT NULL
);

-- Enable Row Level Security on chat_usage
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read/write their own usage data
CREATE POLICY chat_usage_own ON chat_usage
  USING (user_id = auth.uid()::text);