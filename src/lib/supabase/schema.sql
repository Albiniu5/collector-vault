-- Enable RLS

-- PROFILES
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  bricklink_consumer_key text,
  bricklink_consumer_secret text,
  bricklink_token_value text,
  bricklink_token_secret text,
  currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Handle new user signup automatically
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- COLLECTIONS
create table public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  type text not null default 'generic', -- 'lego', 'coins', 'memorabilia', 'generic'
  icon text,
  created_at timestamptz default now()
);

alter table public.collections enable row level security;

create policy "Users can view their own collections" on public.collections
  for select using (auth.uid() = user_id);

create policy "Users can insert their own collections" on public.collections
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own collections" on public.collections
  for update using (auth.uid() = user_id);

create policy "Users can delete their own collections" on public.collections
  for delete using (auth.uid() = user_id);


-- ITEMS
create table public.items (
  id uuid default gen_random_uuid() primary key,
  collection_id uuid not null references public.collections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Core Fields
  name text not null,
  description text,
  image_url text,
  thumbnail_url text,
  
  -- Valuation
  purchase_price numeric,
  current_value numeric,
  currency text default 'USD',
  acquired_date date,
  condition text, -- 'New', 'Mint', 'Used', etc.
  
  -- Automation / tracking
  external_id text, -- e.g. "31131"
  source text default 'manual', -- 'auto:lego', 'manual'
  
  -- Flexible Data (Specific specs)
  metadata jsonb default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index items_collection_id_idx on public.items(collection_id);
create index items_user_id_idx on public.items(user_id);
create index items_metadata_gin_idx on public.items using gin (metadata);

alter table public.items enable row level security;

create policy "Users can manage their own items" on public.items
  for all using (auth.uid() = user_id);
