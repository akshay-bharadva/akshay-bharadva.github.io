-- db/schema.sql
--
-- Full database schema for the Personal Portfolio + Admin OS.
-- This script is IDEMPOTENT — safe to run multiple times.
-- Run this in the Supabase SQL Editor to set up or reset your database.

-- =========================================================
-- 1. HELPER FUNCTIONS
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if any admin user has been created (used on the signup page).
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT count(*) INTO user_count FROM auth.users;
  RETURN user_count > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION check_admin_exists() TO anon;
GRANT EXECUTE ON FUNCTION check_admin_exists() TO authenticated;


-- =========================================================
-- 2. CUSTOM ENUM TYPES (idempotent)
-- =========================================================

DO $$ BEGIN CREATE TYPE task_status AS ENUM ('todo', 'inprogress', 'done'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transaction_type AS ENUM ('earning', 'expense'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transaction_frequency AS ENUM ('daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE learning_status AS ENUM ('To Learn', 'Learning', 'Practicing', 'Mastered'); EXCEPTION WHEN duplicate_object THEN null; END $$;


-- =========================================================
-- 3. SITE CONFIGURATION & IDENTITY
-- =========================================================

-- Single-row table for global site identity.
-- Uses auth.role() RLS because the seed row has no user_id (inserted from SQL editor).
CREATE TABLE IF NOT EXISTS site_identity (
  id INT PRIMARY KEY DEFAULT 1,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data JSONB,
  social_links JSONB,
  footer_data JSONB,
  portfolio_mode TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row_enforcement CHECK (id = 1)
);
ALTER TABLE site_identity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site identity" ON site_identity;
CREATE POLICY "Public read site identity" ON site_identity FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage site identity" ON site_identity;
CREATE POLICY "Admin manage site identity" ON site_identity FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP TRIGGER IF EXISTS update_site_identity_updated_at ON site_identity;
CREATE TRIGGER update_site_identity_updated_at BEFORE UPDATE ON site_identity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Navigation Links
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  display_order INT4 DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read visible navigation" ON navigation_links;
CREATE POLICY "Public read visible navigation" ON navigation_links FOR SELECT USING (is_visible = true);
DROP POLICY IF EXISTS "Admin manage navigation" ON navigation_links;
CREATE POLICY "Admin manage navigation" ON navigation_links FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Security Settings (single-row, lockdown/kill-switch)
CREATE TABLE IF NOT EXISTS security_settings (
  id INT PRIMARY KEY DEFAULT 1,
  lockdown_level INT DEFAULT 0 CHECK (lockdown_level BETWEEN 0 AND 3),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row_check CHECK (id = 1)
);
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read security" ON security_settings;
CREATE POLICY "Public read security" ON security_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage security" ON security_settings;
CREATE POLICY "Admin manage security" ON security_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- =========================================================
-- 4. CONTENT TABLES (Portfolio, Blog)
-- =========================================================

-- Portfolio Sections
CREATE TABLE IF NOT EXISTS portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('markdown', 'list_items', 'gallery')),
  content TEXT,
  display_order INT4 DEFAULT 0,
  page_path TEXT NOT NULL DEFAULT '/',
  layout_style TEXT NOT NULL DEFAULT 'default',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read sections" ON portfolio_sections;
CREATE POLICY "Public read sections" ON portfolio_sections FOR SELECT USING (is_visible = true);
DROP POLICY IF EXISTS "Admin manage sections" ON portfolio_sections;
CREATE POLICY "Admin manage sections" ON portfolio_sections FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP TRIGGER IF EXISTS update_portfolio_sections_updated_at ON portfolio_sections;
CREATE TRIGGER update_portfolio_sections_updated_at BEFORE UPDATE ON portfolio_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Portfolio Items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES portfolio_sections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  date_from TEXT,
  date_to TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  tags TEXT[],
  internal_notes TEXT,
  display_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read items" ON portfolio_items;
CREATE POLICY "Public read items" ON portfolio_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage items" ON portfolio_items;
CREATE POLICY "Admin manage items" ON portfolio_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  show_toc BOOLEAN DEFAULT true,
  tags TEXT[],
  views BIGINT DEFAULT 0,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read posts" ON blog_posts;
CREATE POLICY "Public read posts" ON blog_posts FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Admin manage posts" ON blog_posts;
CREATE POLICY "Admin manage posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =========================================================
-- 5. ADMIN TOOLS — Tasks, Notes, Events
-- =========================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  status task_status DEFAULT 'todo',
  due_date DATE,
  priority task_priority DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage tasks" ON tasks;
CREATE POLICY "Admin manage tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS sub_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage subtasks" ON sub_tasks;
CREATE POLICY "Admin manage subtasks" ON sub_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT,
  content TEXT,
  color TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage notes" ON notes;
CREATE POLICY "Admin manage notes" ON notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage events" ON events;
CREATE POLICY "Admin manage events" ON events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =========================================================
-- 6. FINANCE
-- =========================================================

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type transaction_type NOT NULL,
  category TEXT,
  frequency transaction_frequency NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  occurrence_day INT,
  last_processed_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage recurring" ON recurring_transactions;
CREATE POLICY "Admin manage recurring" ON recurring_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_recurring_transactions_updated_at ON recurring_transactions;
CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type transaction_type NOT NULL,
  category TEXT,
  recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage transactions" ON transactions;
CREATE POLICY "Admin manage transactions" ON transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage goals" ON financial_goals;
CREATE POLICY "Admin manage goals" ON financial_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON financial_goals;
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =========================================================
-- 7. LEARNING HUB
-- =========================================================

CREATE TABLE IF NOT EXISTS learning_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE learning_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage subjects" ON learning_subjects;
CREATE POLICY "Admin manage subjects" ON learning_subjects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_learning_subjects_updated_at ON learning_subjects;
CREATE TRIGGER update_learning_subjects_updated_at BEFORE UPDATE ON learning_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS learning_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  subject_id UUID REFERENCES learning_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status learning_status DEFAULT 'To Learn',
  core_notes TEXT,
  resources JSONB,
  confidence_score INT2 CHECK (confidence_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE learning_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage topics" ON learning_topics;
CREATE POLICY "Admin manage topics" ON learning_topics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_learning_topics_updated_at ON learning_topics;
CREATE TRIGGER update_learning_topics_updated_at BEFORE UPDATE ON learning_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  topic_id UUID NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INT,
  journal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage sessions" ON learning_sessions;
CREATE POLICY "Admin manage sessions" ON learning_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- =========================================================
-- 8. LIFESTYLE — Habits, Focus, Inventory
-- =========================================================

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  color TEXT DEFAULT '#0ea5e9',
  target_per_week INT DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage habits" ON habits;
CREATE POLICY "Admin manage habits" ON habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, completed_date)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage habit logs" ON habit_logs;
CREATE POLICY "Admin manage habit logs" ON habit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM habits WHERE id = habit_logs.habit_id AND user_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS focus_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  completed BOOLEAN DEFAULT false,
  mode TEXT CHECK (mode IN ('work', 'break')) DEFAULT 'work',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE focus_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage focus" ON focus_logs;
CREATE POLICY "Admin manage focus" ON focus_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  category TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_expiry DATE,
  purchase_price NUMERIC(10, 2),
  current_value NUMERIC(10, 2),
  image_url TEXT,
  notes TEXT,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage inventory" ON inventory_items;
CREATE POLICY "Admin manage inventory" ON inventory_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage Assets Metadata
CREATE TABLE IF NOT EXISTS storage_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  size_kb NUMERIC,
  alt_text TEXT,
  used_in JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE storage_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage assets" ON storage_assets;
CREATE POLICY "Admin manage assets" ON storage_assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- =========================================================
-- 9. PUBLIC NOTES (Life Updates)
-- =========================================================

CREATE TABLE IF NOT EXISTS public_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT,
  content TEXT,
  category TEXT CHECK (category IN ('watching', 'activity', 'photo', 'thought', 'milestone')) DEFAULT 'thought',
  image_url TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published notes" ON public_notes;
CREATE POLICY "Public read published notes" ON public_notes FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admin manage public notes" ON public_notes;
CREATE POLICY "Admin manage public notes" ON public_notes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP TRIGGER IF EXISTS update_public_notes_updated_at ON public_notes;
CREATE TRIGGER update_public_notes_updated_at BEFORE UPDATE ON public_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =========================================================
-- 10. CONTACT SUBMISSIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert contact" ON contact_submissions;
CREATE POLICY "Public insert contact" ON contact_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin read contact" ON contact_submissions;
CREATE POLICY "Admin read contact" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin delete contact" ON contact_submissions;
CREATE POLICY "Admin delete contact" ON contact_submissions FOR DELETE USING (auth.role() = 'authenticated');


-- =========================================================
-- 11. RPC FUNCTIONS
-- =========================================================

-- Ping (health check)
CREATE OR REPLACE FUNCTION ping() RETURNS text AS $$ BEGIN RETURN 'pong'; END; $$ LANGUAGE plpgsql;

-- Blog View Counter
CREATE OR REPLACE FUNCTION increment_blog_post_view(post_id_to_increment UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE blog_posts SET views = views + 1 WHERE id = post_id_to_increment AND published = true;
END;
$$;
GRANT EXECUTE ON FUNCTION increment_blog_post_view(UUID) TO anon, authenticated;

-- Section Reordering
CREATE OR REPLACE FUNCTION update_section_order(section_ids UUID[])
RETURNS void AS $$
BEGIN
  FOR i IN 1..array_length(section_ids, 1) LOOP
    UPDATE portfolio_sections SET display_order = i WHERE id = section_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Total Blog Views
CREATE OR REPLACE FUNCTION get_total_blog_views()
RETURNS BIGINT AS $$
DECLARE total_views BIGINT;
BEGIN
  SELECT SUM(views) INTO total_views FROM blog_posts WHERE published = true;
  RETURN COALESCE(total_views, 0);
END;
$$ LANGUAGE plpgsql;

-- Learning Heatmap
CREATE OR REPLACE FUNCTION get_learning_heatmap_data(start_date DATE, end_date DATE)
RETURNS TABLE(day DATE, total_minutes INT) AS $$
BEGIN
  RETURN QUERY
  SELECT DATE(s.start_time AT TIME ZONE 'UTC') AS day, COALESCE(SUM(s.duration_minutes), 0)::INT AS total_minutes
  FROM learning_sessions s
  WHERE s.user_id = auth.uid()
    AND s.start_time AT TIME ZONE 'UTC' >= start_date
    AND s.start_time AT TIME ZONE 'UTC' <= end_date
  GROUP BY day ORDER BY day;
END;
$$ LANGUAGE plpgsql;

-- Calendar Data (aggregated view of events, tasks, habits, finance)
CREATE OR REPLACE FUNCTION get_calendar_data(start_date_param date, end_date_param date)
RETURNS TABLE(item_id UUID, title TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, item_type TEXT, data JSONB) AS $$
BEGIN
  RETURN QUERY
  -- Events
  SELECT e.id, e.title, e.start_time, e.end_time, 'event' AS item_type,
    jsonb_build_object('description', e.description, 'is_all_day', e.is_all_day)
  FROM events e WHERE e.user_id = auth.uid() AND e.start_time::date BETWEEN start_date_param AND end_date_param
  UNION ALL
  -- Tasks
  SELECT t.id, t.title, (t.due_date + interval '9 hour')::timestamptz, NULL::timestamptz, 'task' AS item_type,
    jsonb_build_object('status', t.status, 'priority', t.priority)
  FROM tasks t WHERE t.user_id = auth.uid() AND t.due_date BETWEEN start_date_param AND end_date_param
  UNION ALL
  -- Habit Summary (grouped per day)
  SELECT gen_random_uuid(), 'Habits Completed', (hl.completed_date + interval '7 hour')::timestamptz, NULL::timestamptz, 'habit_summary' AS item_type,
    jsonb_build_object('count', COUNT(*), 'completed_habits', jsonb_agg(jsonb_build_object('title', h.title, 'color', h.color)))
  FROM habit_logs hl JOIN habits h ON hl.habit_id = h.id
  WHERE h.user_id = auth.uid() AND hl.completed_date BETWEEN start_date_param AND end_date_param
  GROUP BY hl.completed_date
  UNION ALL
  -- Transaction Summary (grouped per day)
  SELECT gen_random_uuid(), 'Daily Finance', (tr.date + interval '12 hour')::timestamptz, NULL::timestamptz, 'transaction_summary' AS item_type,
    jsonb_build_object(
      'count', COUNT(*),
      'total_earning', COALESCE(SUM(CASE WHEN tr.type = 'earning' THEN tr.amount ELSE 0 END), 0),
      'total_expense', COALESCE(SUM(CASE WHEN tr.type = 'expense' THEN tr.amount ELSE 0 END), 0),
      'transactions', jsonb_agg(jsonb_build_object('description', tr.description, 'amount', tr.amount, 'type', tr.type, 'category', tr.category))
    )
  FROM transactions tr WHERE tr.user_id = auth.uid() AND tr.date BETWEEN start_date_param AND end_date_param
  GROUP BY tr.date;
END;
$$ LANGUAGE plpgsql;

-- Analytics Overview
CREATE OR REPLACE FUNCTION get_analytics_overview()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_data JSONB;
  current_user_id UUID := auth.uid();
BEGIN
  WITH
  task_stats AS (
    SELECT status, count(*) AS count FROM tasks WHERE user_id = current_user_id GROUP BY status
  ),
  tasks_completed_weekly AS (
    SELECT date_trunc('week', updated_at)::date AS week_start, count(*) AS completed_count
    FROM tasks WHERE user_id = current_user_id AND status = 'done' AND updated_at > now() - interval '8 weeks'
    GROUP BY week_start ORDER BY week_start
  ),
  productivity_heatmap AS (
    SELECT (updated_at AT TIME ZONE 'UTC')::date AS day, count(*)::INT AS count
    FROM tasks WHERE user_id = current_user_id AND status = 'done' GROUP BY day
  ),
  blog_stats AS (
    SELECT id, title, slug, views FROM blog_posts WHERE user_id = current_user_id AND published = true ORDER BY views DESC LIMIT 5
  ),
  learning_stats AS (
    SELECT ls.name AS subject_name, SUM(lse.duration_minutes)::INT AS total_minutes
    FROM learning_sessions lse
    JOIN learning_topics lt ON lse.topic_id = lt.id
    JOIN learning_subjects ls ON lt.subject_id = ls.id
    WHERE lse.user_id = current_user_id GROUP BY ls.name
  )
  SELECT jsonb_build_object(
    'task_status_distribution', (SELECT jsonb_agg(jsonb_build_object('name', status, 'value', count)) FROM task_stats),
    'tasks_completed_weekly', (SELECT jsonb_agg(jsonb_build_object('week', to_char(week_start, 'Mon DD'), 'completed', completed_count)) FROM tasks_completed_weekly),
    'productivity_heatmap', (SELECT jsonb_agg(jsonb_build_object('date', day, 'count', count)) FROM productivity_heatmap),
    'top_blog_posts', (SELECT jsonb_agg(jsonb_build_object('id', id, 'title', title, 'slug', slug, 'views', views)) FROM blog_stats),
    'learning_time_by_subject', (SELECT jsonb_agg(jsonb_build_object('name', subject_name, 'value', total_minutes)) FROM learning_stats)
  ) INTO analytics_data;
  RETURN analytics_data;
END;
$$;

-- Asset Usage Tracker
CREATE OR REPLACE FUNCTION update_asset_usage()
RETURNS void AS $$
DECLARE asset RECORD; usage JSONB;
BEGIN
  FOR asset IN SELECT id, file_path FROM storage_assets LOOP
    usage := '[]'::jsonb;
    IF EXISTS (SELECT 1 FROM blog_posts WHERE cover_image_url LIKE '%' || asset.file_path || '%') THEN
      usage := usage || jsonb_build_object('type', 'Blog Cover', 'id', (SELECT id FROM blog_posts WHERE cover_image_url LIKE '%' || asset.file_path || '%' LIMIT 1));
    END IF;
    IF EXISTS (SELECT 1 FROM blog_posts WHERE content LIKE '%' || asset.file_path || '%') THEN
      usage := usage || jsonb_build_object('type', 'Blog Content', 'id', (SELECT id FROM blog_posts WHERE content LIKE '%' || asset.file_path || '%' LIMIT 1));
    END IF;
    IF EXISTS (SELECT 1 FROM portfolio_items WHERE image_url LIKE '%' || asset.file_path || '%') THEN
      usage := usage || jsonb_build_object('type', 'Portfolio Item', 'id', (SELECT id FROM portfolio_items WHERE image_url LIKE '%' || asset.file_path || '%' LIMIT 1));
    END IF;
    UPDATE storage_assets SET used_in = usage WHERE id = asset.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Transaction Category Management
CREATE OR REPLACE FUNCTION rename_transaction_category(old_name TEXT, new_name TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE transactions SET category = new_name WHERE user_id = auth.uid() AND category = old_name;
  UPDATE recurring_transactions SET category = new_name WHERE user_id = auth.uid() AND category = old_name;
END;
$$;

CREATE OR REPLACE FUNCTION merge_transaction_categories(source_name TEXT, target_name TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE transactions SET category = target_name WHERE user_id = auth.uid() AND category = source_name;
  UPDATE recurring_transactions SET category = target_name WHERE user_id = auth.uid() AND category = source_name;
END;
$$;

CREATE OR REPLACE FUNCTION delete_transaction_category(category_name TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE transactions SET category = NULL WHERE user_id = auth.uid() AND category = category_name;
  UPDATE recurring_transactions SET category = NULL WHERE user_id = auth.uid() AND category = category_name;
END;
$$;


-- =========================================================
-- 12. STORAGE BUCKET & POLICIES
-- =========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read access assets" ON storage.objects;
CREATE POLICY "Public read access assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "Admin upload access assets" ON storage.objects;
CREATE POLICY "Admin upload access assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin update access assets" ON storage.objects;
CREATE POLICY "Admin update access assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin delete access assets" ON storage.objects;
CREATE POLICY "Admin delete access assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'assets' AND auth.role() = 'authenticated');


-- =========================================================
-- 13. SEED DATA
-- =========================================================

-- Site Identity (required for the portfolio to render on first load)
INSERT INTO site_identity (id, profile_data, social_links, footer_data, portfolio_mode)
VALUES (1,
  '{
    "name": "Your Name",
    "title": "Your Professional Title",
    "description": "A brief, compelling description about who you are and what you do. This will appear on your homepage.",
    "profile_picture_url": "",
    "show_profile_picture": false,
    "default_theme": "theme-blueprint",
    "logo": { "main": "YOUR", "highlight": ".DEV" },
    "status_panel": {
      "show": true,
      "design": "minimal",
      "title": "status.panel",
      "availability": "Open for new opportunities",
      "currently_exploring": { "title": "Exploring", "items": ["New Tech 1", "New Tech 2"] },
      "latestProject": { "name": "My Latest Project", "linkText": "View all projects", "href": "/projects" }
    },
    "bio": [
      "This is the first paragraph of your bio on the About page. Share your story, your passion for your work, and what drives you.",
      "This is the second paragraph. You can talk about your philosophy, interests outside of work, or your long-term goals."
    ],
    "github_projects_config": {
      "username": "your-github-username",
      "show": true,
      "sort_by": "pushed",
      "exclude_forks": true,
      "exclude_archived": true,
      "exclude_profile_repo": true,
      "min_stars": 0,
      "projects_per_page": 9
    },
    "contact_page": {
      "show_contact_form": true,
      "show_availability_badge": true,
      "show_services": true
    }
  }',
  '[
    {"id": "github", "label": "GitHub", "url": "https://github.com/your-username", "is_visible": true},
    {"id": "linkedin", "label": "LinkedIn", "url": "https://linkedin.com/in/your-profile", "is_visible": true},
    {"id": "email", "label": "Email", "url": "mailto:your-email@example.com", "is_visible": true}
  ]',
  '{ "copyright_text": "Crafted with Next.js & Supabase. Deployed on GitHub Pages." }',
  'multi-page'
) ON CONFLICT (id) DO NOTHING;

-- Security Settings (default: no lockdown)
INSERT INTO security_settings (id, lockdown_level) VALUES (1, 0) ON CONFLICT DO NOTHING;

-- Default Navigation Links
INSERT INTO navigation_links (label, href, display_order, is_visible) VALUES
  ('Home',     '/',         0, true),
  ('Showcase', '/showcase', 1, true),
  ('About',    '/about',    2, true),
  ('Projects', '/projects', 3, true),
  ('Blog',     '/blog',     4, true),
  ('Updates',     '/updates',     5, true),
  ('Contact',  '/contact',  6, true)
ON CONFLICT DO NOTHING;
