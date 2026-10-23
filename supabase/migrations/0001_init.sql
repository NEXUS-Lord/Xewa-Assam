-- ============ TABLES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table public.cities (
  id serial primary key,
  name text not null unique
);

create table public.categories (
  id serial primary key,
  slug text not null unique,
  name text not null,
  icon text not null default 'category',   -- Material/Lucide icon name
  sort_order int not null default 0
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,  -- who added or suggested it
  category_id int not null references public.categories(id),
  city_id int not null references public.cities(id),
  name text not null,
  description text not null default '',
  phone text not null,
  whatsapp text,
  locality text not null default '',
  address text not null default '',
  price_info text not null default '',
  opening_hours text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_verified boolean not null default false,
  avg_rating numeric(2,1) not null default 0,   -- used in the optional reviews phase
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_browse_idx on public.listings (status, city_id, category_id);
create index listings_name_idx on public.listings (lower(name));

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  reason text not null check (reason in ('wrong_info','closed','spam','other')),
  details text not null default '',
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);

-- ============ HELPERS ============
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;
create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles       enable row level security;
alter table public.cities         enable row level security;
alter table public.categories     enable row level security;
alter table public.listings       enable row level security;
alter table public.listing_photos enable row level security;
alter table public.reviews        enable row level security;
alter table public.reports        enable row level security;

-- profiles: read own (or admin); users may update ONLY full_name (role is protected)
create policy "profiles read" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- cities and categories: public read, admin write
create policy "cities read" on public.cities for select using (true);
create policy "cities admin write" on public.cities for all
  using (public.is_admin()) with check (public.is_admin());
create policy "categories read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- listings: public sees approved; owner sees own; admin sees all
create policy "listings read" on public.listings for select
  using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "listings insert" on public.listings for insert to authenticated
  with check (
    public.is_admin()
    or (owner_id = auth.uid() and status = 'pending'
        and is_verified = false and avg_rating = 0 and review_count = 0)
  );
create policy "listings admin update" on public.listings for update
  using (public.is_admin()) with check (public.is_admin());
create policy "listings admin delete" on public.listings for delete
  using (public.is_admin());

-- photos: visible when the parent listing is visible; admin manages
create policy "photos read" on public.listing_photos for select using (
  exists (select 1 from public.listings l where l.id = listing_id
          and (l.status = 'approved' or l.owner_id = auth.uid() or public.is_admin()))
);
create policy "photos admin write" on public.listing_photos for all
  using (public.is_admin()) with check (public.is_admin());

-- reviews: public sees approved; author sees own; admin moderates
create policy "reviews read" on public.reviews for select
  using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "reviews insert" on public.reviews for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy "reviews admin update" on public.reviews for update
  using (public.is_admin()) with check (public.is_admin());
create policy "reviews admin delete" on public.reviews for delete
  using (public.is_admin());

-- reports: any logged-in user can file; only admin can read or update
create policy "reports insert" on public.reports for insert to authenticated
  with check (user_id = auth.uid());
create policy "reports admin read" on public.reports for select using (public.is_admin());
create policy "reports admin update" on public.reports for update
  using (public.is_admin()) with check (public.is_admin());

-- ============ STORAGE ============
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "photos bucket read" on storage.objects for select
  using (bucket_id = 'listing-photos');
create policy "photos bucket admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and public.is_admin());
create policy "photos bucket admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and public.is_admin());

-- ============ SEED ============
insert into public.cities (name) values ('Tezpur'), ('Nagaon');

insert into public.categories (slug, name, icon, sort_order) values
  ('tutors',    'Tutors & Coaching',  'GraduationCap', 1),
  ('pg-rooms',  'PG & Rooms',         'Home',          2),
  ('mess-food', 'Mess & Food',        'Utensils',      3),
  ('repair',    'Repair Services',    'Wrench',        4),
  ('delivery',  'Delivery & Errands', 'Truck',         5),
  ('other',     'Other',              'MoreHorizontal',99);
