-- Add currency column to profiles table, default to USD
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Optional: Add constraint to only allow specific currencies if strictly enforced
-- ALTER TABLE public.profiles ADD CONSTRAINT check_currency CHECK (currency IN ('USD', 'EUR'));
