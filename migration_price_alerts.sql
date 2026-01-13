-- Add price_alert_threshold and last_price_check to items
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS price_alert_threshold numeric DEFAULT NULL, -- Percentage drop to alert on (e.g. 10 for 10%)
ADD COLUMN IF NOT EXISTS last_price_check timestamptz DEFAULT NULL;

-- Example: If user wants to be alerted when value drops by 5%, they set price_alert_threshold = 5
