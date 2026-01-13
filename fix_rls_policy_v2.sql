-- Force Enable RLS
alter table public.collections enable row level security;
alter table public.items enable row level security;
alter table public.profiles enable row level security;

-- Drop ALL existing policies to avoid conflicts (Fixes "policy already exists" error)
drop policy if exists "Users can view their own collections" on public.collections;
drop policy if exists "Users can insert their own collections" on public.collections;
drop policy if exists "Users can update their own collections" on public.collections;
drop policy if exists "Users can delete their own collections" on public.collections;

drop policy if exists "Users can view their own items" on public.items;
drop policy if exists "Users can insert their own items" on public.items;
drop policy if exists "Users can update their own items" on public.items;
drop policy if exists "Users can delete their own items" on public.items;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- Re-create Policies

-- COLLECTIONS
create policy "Users can view their own collections" on public.collections
  for select using (auth.uid() = user_id);

create policy "Users can insert their own collections" on public.collections
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own collections" on public.collections
  for update using (auth.uid() = user_id);

create policy "Users can delete their own collections" on public.collections
  for delete using (auth.uid() = user_id);

-- ITEMS
create policy "Users can view their own items" on public.items
  for select using (auth.uid() = user_id);

create policy "Users can insert their own items" on public.items
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own items" on public.items
  for update using (auth.uid() = user_id);

create policy "Users can delete their own items" on public.items
  for delete using (auth.uid() = user_id);

-- PROFILES
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
