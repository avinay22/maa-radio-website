-- ==============================================================================
-- MAA RADIO SUPABASE MIGRATION: ADD DISCOUNT AND RICH PRODUCT COLUMNS
-- Copy and run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bwtphqpltuwlipnrbfea/sql
-- ==============================================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percentage text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS new_arrival boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS best_seller boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_status text DEFAULT 'In Stock';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warranty text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS emi_available boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS free_gift text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS combo_offer text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cashback_offer text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offers_and_promotions text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
