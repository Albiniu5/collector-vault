-- Run this in your Supabase SQL Editor to update the profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bricklink_consumer_key text,
ADD COLUMN IF NOT EXISTS bricklink_consumer_secret text,
ADD COLUMN IF NOT EXISTS bricklink_token_value text,
ADD COLUMN IF NOT EXISTS bricklink_token_secret text;
