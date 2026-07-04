-- Migration: Add is_recommended column to food_items table

ALTER TABLE public.food_items 
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false;

-- Optionally, you can set the first 4 existing items to be recommended as defaults:
-- UPDATE public.food_items 
-- SET is_recommended = true 
-- WHERE id IN (
--   SELECT id FROM public.food_items ORDER BY created_at ASC LIMIT 4
-- );
