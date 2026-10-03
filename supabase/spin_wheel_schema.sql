-- ==============================================================================
-- SPIN WHEEL SYSTEM SCHEMA (Supabase SQL)
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. spin_settings table (stores global toggle ON/OFF)
CREATE TABLE IF NOT EXISTS public.spin_settings (
  id text PRIMARY KEY DEFAULT 'global',
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure default setting row exists
INSERT INTO public.spin_settings (id, is_active)
VALUES ('global', true)
ON CONFLICT (id) DO NOTHING;

-- 2. spin_stats table (tracks total spins across the platform)
CREATE TABLE IF NOT EXISTS public.spin_stats (
  id text PRIMARY KEY DEFAULT 'global',
  total_spins integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure default stats row exists
INSERT INTO public.spin_stats (id, total_spins)
VALUES ('global', 0)
ON CONFLICT (id) DO NOTHING;

-- 3. spin_rewards table (stores all reward slices, types, milestones)
CREATE TABLE IF NOT EXISTS public.spin_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_name text NOT NULL,
  milestone integer DEFAULT NULL,
  type text NOT NULL DEFAULT 'random' CHECK (type IN ('random', 'milestone')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Populate the exact rewards:
-- Milestone: TV (101), Special Gift (30), BT Speaker (20), Headphone (15), Earbuds (5)
-- Random: Brand Cup, Neckband, Data Cable
DELETE FROM public.spin_rewards;
INSERT INTO public.spin_rewards (reward_name, milestone, type, enabled)
VALUES
  ('TV', 101, 'milestone', true),
  ('Special Gift', 30, 'milestone', true),
  ('BT Speaker', 20, 'milestone', true),
  ('Headphone', 15, 'milestone', true),
  ('Earbuds', 5, 'milestone', true),
  ('Brand Cup', NULL, 'random', true),
  ('Neckband', NULL, 'random', true),
  ('Data Cable', NULL, 'random', true);

-- 4. spin_codes table (stores unique access codes, status, and won prize)
CREATE TABLE IF NOT EXISTS public.spin_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  used boolean NOT NULL DEFAULT false,
  prize text DEFAULT NULL,
  used_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed sample codes for immediate testing
INSERT INTO public.spin_codes (code, used)
VALUES
  ('MAA100', false),
  ('LUCKY2026', false),
  ('VIPSPIN', false),
  ('TESTCODE', false)
ON CONFLICT (code) DO NOTHING;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.spin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_codes ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies:
-- Public can read spin_settings (to check if ON/OFF)
DROP POLICY IF EXISTS "Public read spin_settings" ON public.spin_settings;
CREATE POLICY "Public read spin_settings" ON public.spin_settings FOR SELECT USING (true);

-- Public can read active rewards (to render the wheel visually)
DROP POLICY IF EXISTS "Public read spin_rewards" ON public.spin_rewards;
CREATE POLICY "Public read spin_rewards" ON public.spin_rewards FOR SELECT USING (enabled = true);

-- Public can read spin_stats
DROP POLICY IF EXISTS "Public read spin_stats" ON public.spin_stats;
CREATE POLICY "Public read spin_stats" ON public.spin_stats FOR SELECT USING (true);

-- Authenticated (Admin) full access
DROP POLICY IF EXISTS "Admin manage spin_settings" ON public.spin_settings;
CREATE POLICY "Admin manage spin_settings" ON public.spin_settings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage spin_stats" ON public.spin_stats;
CREATE POLICY "Admin manage spin_stats" ON public.spin_stats FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage spin_rewards" ON public.spin_rewards;
CREATE POLICY "Admin manage spin_rewards" ON public.spin_rewards FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage spin_codes" ON public.spin_codes;
CREATE POLICY "Admin manage spin_codes" ON public.spin_codes FOR ALL USING (auth.role() = 'authenticated');
