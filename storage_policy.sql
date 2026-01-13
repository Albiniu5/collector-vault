-- Create a new bucket 'vault-images'
insert into storage.buckets (id, name, public)
values ('vault-images', 'vault-images', true);

-- Allow public access to view files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'vault-images' );

-- Allow authenticated users to upload files
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'vault-images' and auth.role() = 'authenticated' );

-- Allow users to update their own files (optional, good for overwrites)
create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'vault-images' and auth.role() = 'authenticated' );
