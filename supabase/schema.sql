-- ==============================================================================
-- MAA RADIO SUPABASE SCHEMA
-- Run this script in your Supabase SQL Editor to set up the database and storage.
-- ==============================================================================

-- 1. Create tables
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  description text,
  images jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '[]'::jsonb,
  original_price text,
  discount_price text,
  discount_percentage text,
  featured boolean DEFAULT false,
  new_arrival boolean DEFAULT false,
  best_seller boolean DEFAULT false,
  stock_status text DEFAULT 'In Stock',
  warranty text,
  emi_available boolean DEFAULT false,
  free_gift text,
  combo_offer text,
  cashback_offer text,
  offers_and_promotions text,
  is_accessory_page_only boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Setup Storage for Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security (RLS) - Enable it
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Policies for site_content (Public can read, authenticated can insert/update)
CREATE POLICY "Public can read site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert site_content" ON public.site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update site_content" ON public.site_content FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Policies for products (Public can read, authenticated can manage)
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Storage Policies (Public read, authenticated upload)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 7. DATABASE MIGRATION SCRIPT (For existing databases)
-- Run these statements individually if your products table already exists.
-- ==============================================================================
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price text;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price text;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percentage text;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS new_arrival boolean DEFAULT false;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS best_seller boolean DEFAULT false;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_status text DEFAULT 'In Stock';
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warranty text;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS emi_available boolean DEFAULT false;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS free_gift text;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS combo_offer text;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cashback_offer text;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offers_and_promotions text;

