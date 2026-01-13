-- Add BrickSet API Key to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS brickset_api_key text;
