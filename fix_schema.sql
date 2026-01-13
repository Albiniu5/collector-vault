-- Run this in your Supabase SQL Editor to fix the "Failed to save" error

-- 1. Add the missing column
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS price_alert_threshold numeric DEFAULT NULL;

-- 2. Add the last check column (for the background job)
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS last_price_check timestamptz DEFAULT NULL;

-- 3. Force Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';
