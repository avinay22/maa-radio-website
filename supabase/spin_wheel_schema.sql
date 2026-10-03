-- ==============================================================================
-- SPIN WHEEL SYSTEM SCHEMA & PRE-ASSIGNED 101 CODES (Supabase SQL)
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. spin_settings table (stores global toggle ON/OFF)
CREATE TABLE IF NOT EXISTS public.spin_settings (
  id text PRIMARY KEY DEFAULT 'global',
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.spin_settings (id, is_active)
VALUES ('global', true)
ON CONFLICT (id) DO NOTHING;

-- 2. spin_stats table (tracks total spins across the platform)
CREATE TABLE IF NOT EXISTS public.spin_stats (
  id text PRIMARY KEY DEFAULT 'global',
  total_spins integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.spin_stats (id, total_spins)
VALUES ('global', 0)
ON CONFLICT (id) DO NOTHING;

-- 3. spin_rewards table (stores the 8 slices on the wheel)
CREATE TABLE IF NOT EXISTS public.spin_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_name text NOT NULL,
  milestone integer DEFAULT NULL,
  type text NOT NULL DEFAULT 'random',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DELETE FROM public.spin_rewards;
INSERT INTO public.spin_rewards (reward_name, milestone, type, enabled)
VALUES
  ('TV', 101, 'milestone', true),
  ('Special Gift', 30, 'milestone', true),
  ('BT Speaker', 20, 'milestone', true),
  ('Headphone', 15, 'milestone', true),
  ('Earbuds', 5, 'milestone', true),
  ('Cup', NULL, 'random', true),
  ('Neckband', NULL, 'random', true),
  ('Data Cable', NULL, 'random', true);

-- 4. spin_codes table with card_number, code, assigned prize, and used flag
CREATE TABLE IF NOT EXISTS public.spin_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number integer,
  code text UNIQUE NOT NULL,
  prize text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  used_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure card_number column exists if table was created previously
ALTER TABLE public.spin_codes ADD COLUMN IF NOT EXISTS card_number integer;

-- Insert or update the full 101 pre-assigned codes
INSERT INTO public.spin_codes (card_number, code, prize, used)
VALUES
  (1, 'MR-48291', 'Cup', false),
  (2, 'MR-73915', 'Data Cable', false),
  (3, 'MR-19537', 'Neckband', false),
  (4, 'MR-86420', 'Cup', false),
  (5, 'MR-53912', 'Earbuds', false),
  (6, 'MR-67281', 'Data Cable', false),
  (7, 'MR-91834', 'Cup', false),
  (8, 'MR-25479', 'Neckband', false),
  (9, 'MR-38105', 'Data Cable', false),
  (10, 'MR-74029', 'Cup', false),
  (11, 'MR-66391', 'Neckband', false),
  (12, 'MR-19483', 'Data Cable', false),
  (13, 'MR-82015', 'Cup', false),
  (14, 'MR-59104', 'Neckband', false),
  (15, 'MR-81429', 'Headphone', false),
  (16, 'MR-32781', 'Data Cable', false),
  (17, 'MR-95370', 'Cup', false),
  (18, 'MR-28519', 'Neckband', false),
  (19, 'MR-74821', 'Data Cable', false),
  (20, 'MR-39014', 'BT Speaker', false),
  (21, 'MR-56729', 'Cup', false),
  (22, 'MR-13895', 'Data Cable', false),
  (23, 'MR-88421', 'Neckband', false),
  (24, 'MR-76102', 'Cup', false),
  (25, 'MR-20938', 'Data Cable', false),
  (26, 'MR-67420', 'Neckband', false),
  (27, 'MR-94312', 'Cup', false),
  (28, 'MR-15683', 'Data Cable', false),
  (29, 'MR-72015', 'Neckband', false),
  (30, 'MR-72851', 'Special Gift', false),
  (31, 'MR-83920', 'Cup', false),
  (32, 'MR-28410', 'Data Cable', false),
  (33, 'MR-65021', 'Neckband', false),
  (34, 'MR-99812', 'Cup', false),
  (35, 'MR-47190', 'Data Cable', false),
  (36, 'MR-18023', 'Neckband', false),
  (37, 'MR-71902', 'Cup', false),
  (38, 'MR-58210', 'Data Cable', false),
  (39, 'MR-90321', 'Neckband', false),
  (40, 'MR-42789', 'Cup', false),
  (41, 'MR-11092', 'Data Cable', false),
  (42, 'MR-67891', 'Neckband', false),
  (43, 'MR-93420', 'Cup', false),
  (44, 'MR-29013', 'Data Cable', false),
  (45, 'MR-51283', 'Earbuds', false),
  (46, 'MR-83102', 'Neckband', false),
  (47, 'MR-72194', 'Cup', false),
  (48, 'MR-66421', 'Data Cable', false),
  (49, 'MR-19384', 'Neckband', false),
  (50, 'MR-57012', 'Cup', false),
  (51, 'MR-40218', 'Data Cable', false),
  (52, 'MR-90314', 'Neckband', false),
  (53, 'MR-61298', 'Cup', false),
  (54, 'MR-20814', 'Data Cable', false),
  (55, 'MR-89102', 'Headphone', false),
  (56, 'MR-33120', 'Neckband', false),
  (57, 'MR-74091', 'Cup', false),
  (58, 'MR-12673', 'Data Cable', false),
  (59, 'MR-90812', 'Neckband', false),
  (60, 'MR-44218', 'Cup', false),
  (61, 'MR-28390', 'Data Cable', false),
  (62, 'MR-71983', 'Neckband', false),
  (63, 'MR-56021', 'Cup', false),
  (64, 'MR-83210', 'Data Cable', false),
  (65, 'MR-77421', 'BT Speaker', false),
  (66, 'MR-91230', 'Neckband', false),
  (67, 'MR-28563', 'Cup', false),
  (68, 'MR-19382', 'Data Cable', false),
  (69, 'MR-67102', 'Neckband', false),
  (70, 'MR-84519', 'Special Gift', false),
  (71, 'MR-30921', 'Cup', false),
  (72, 'MR-92013', 'Data Cable', false),
  (73, 'MR-11829', 'Neckband', false),
  (74, 'MR-44291', 'Cup', false),
  (75, 'MR-60821', 'Data Cable', false),
  (76, 'MR-29183', 'Neckband', false),
  (77, 'MR-78012', 'Cup', false),
  (78, 'MR-67182', 'Data Cable', false),
  (79, 'MR-11028', 'Neckband', false),
  (80, 'MR-39021', 'Cup', false),
  (81, 'MR-57218', 'Data Cable', false),
  (82, 'MR-99123', 'Neckband', false),
  (83, 'MR-12893', 'Cup', false),
  (84, 'MR-45021', 'Data Cable', false),
  (85, 'MR-88213', 'Headphone', false),
  (86, 'MR-19283', 'Neckband', false),
  (87, 'MR-56210', 'Cup', false),
  (88, 'MR-90821', 'Data Cable', false),
  (89, 'MR-37481', 'Neckband', false),
  (90, 'MR-66021', 'Cup', false),
  (91, 'MR-20839', 'Data Cable', false),
  (92, 'MR-74910', 'Neckband', false),
  (93, 'MR-58102', 'Cup', false),
  (94, 'MR-99321', 'Data Cable', false),
  (95, 'MR-73182', 'Earbuds', false),
  (96, 'MR-12983', 'Neckband', false),
  (97, 'MR-82093', 'Cup', false),
  (98, 'MR-39201', 'Data Cable', false),
  (99, 'MR-66192', 'Neckband', false),
  (100, 'MR-10928', 'Cup', false),
  (101, 'MR-94816', 'TV', false)
ON CONFLICT (code) DO UPDATE
SET card_number = EXCLUDED.card_number,
    prize = EXCLUDED.prize;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.spin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_codes ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies:
DROP POLICY IF EXISTS "Public read spin_settings" ON public.spin_settings;
CREATE POLICY "Public read spin_settings" ON public.spin_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read spin_rewards" ON public.spin_rewards;
CREATE POLICY "Public read spin_rewards" ON public.spin_rewards FOR SELECT USING (enabled = true);

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
