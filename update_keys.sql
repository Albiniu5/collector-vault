-- Run this in Supabase SQL Editor
-- This will update ALL profiles (assuming single user) or you can add WHERE email = 'your@email.com'

UPDATE public.profiles
SET 
    bricklink_consumer_key = 'C0103A74F6A24067810DA66AB7DCDDCF',
    bricklink_consumer_secret = '3D58F16F8E4742439B0D45967BD0329D',
    bricklink_token_value = 'F3F9F839F13E4CB9A70381EA9D29D0CD',
    bricklink_token_secret = '09E792764C364A1ABC20C2D723BF4331';
