-- Allow users to insert their own profile (fixes 'upsert' when profile is missing)
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure the update policy is robust
-- (This might already exist, but running it again or ensuring it's there is good practice)
-- Note: You cannot ALTER a policy to add WITH CHECK easily if it doesn't exist, better to just ensure INSERT exists.
