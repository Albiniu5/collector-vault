-- Add image_url column to collections table
ALTER TABLE public.collections ADD COLUMN image_url text;

-- Optional: Add a comment
COMMENT ON COLUMN public.collections.image_url IS 'Custom cover image URL for the collection';
