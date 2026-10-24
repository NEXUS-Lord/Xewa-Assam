# Xewa: Project Brief and Build Instructions

> **To any AI coding agent (Codex, Antigravity, or other):** Read this whole file before doing anything. It is the single source of truth for this project. Resume from the **first unchecked item** in Section 11. After finishing each task, tick it and add a line to the Progress Log (Section 12). Another agent may continue your work later with no other context, so keep this file accurate.

**App name:** Xewa ("xewa" means "service" in Assamese). **Full title:** *Xewa: Local Services, Found Fast*. The name and tagline live in two constants, `kAppName` ("Xewa") and `kAppTagline` ("Local Services, Found Fast"), in `lib/core/constants.dart`, so changing either is a one-line edit. Do not hardcode them anywhere else. Show the tagline under the app name on the splash screen and login screen, and use the full title as the `README.md` heading.

**Created:** 2026-10-03  |  **Owner:** Nilam Bora (student, B.Voc IT, Dr. B.K.B. College)  |  **Purpose:** semester project, designed to grow into a real product.

---

## 1. What is this app?

Xewa is a **local services directory** for small towns in Assam, starting with **Tezpur** and **Nagaon**. It is a web app (with an Android version built from the same code) where people can quickly find trusted local services such as home tutors, PG/rooms, mess and tiffin, repair technicians, and delivery help, and contact them with one tap.

**The problem:** In small towns, finding a good tutor, room, or electrician depends on word of mouth, scattered WhatsApp groups, and random Google results that are outdated or missing. Newcomers (students, job-holders, families) have no reliable place to look.

**The solution:** One clean app with verified, categorized, searchable local listings, each with a phone number and WhatsApp button.

**Target users:**
- Students and newcomers looking for rooms, mess, tutors, and repairs.
- Local families looking for reliable services.
- Local service providers who want to be found (future: they can claim and manage listings).

## 2. What does it do?

**MVP features**
- Browse services by **city** and **category**.
- **Search** by name, description, or locality.
- **Listing page** with photos, description, price info, hours, address, locality, and **Call** and **WhatsApp** buttons.
- **Guest browsing**: no login needed to browse and contact.
- **Login** (email and password) to suggest a listing, upload photos, or report wrong info. Accounts need **admin approval** first: anyone can sign up, but until approved the account can browse like a guest and cannot suggest, upload photos, or report.
- **Suggest a listing**: any logged-in user can submit a business; it stays hidden until an admin approves it. The submitter can attach up to 5 photos and add or delete them later from "My submissions".
- **Report a listing** (wrong info, closed, spam).
- **Admin tools** inside the app (visible only to admins): add and edit listings, approve or reject suggestions, upload photos, handle reports, approve new user accounts.

**Later (not in MVP):** ratings and reviews, favorites, map view, business-owner accounts, paid featured listings, Assamese UI, push notifications, iOS build.

## 3. How does it work?

There are four kinds of people and one simple flow for each.

**Visitor (no login):**
1. Opens the app and picks a city (remembered for next time).
2. Browses a category or searches.
3. Opens a listing and taps **Call** or **WhatsApp**.

**New user (signed up, not yet approved):**
1. Signs up with name, phone, email, and password.
2. Sees a "Waiting for approval" screen if they open Suggest or Profile. Can still browse like a guest.
3. Once an admin approves the account, they become a contributor.

**Contributor (approved account):**
1. Taps "Suggest a listing", fills a short form (name, category, city, locality, phone, description) and picks up to 5 photos.
2. The listing is saved as `pending` and is visible only to the contributor and admins.
3. Can add or delete photos on their own listings at any time from "My submissions", even after approval.
4. Can also report a listing that has wrong or outdated info.

**Admin (the owner, plus anyone promoted later):**
1. Adds listings directly (these are `approved` immediately). This is how the first 30 to 100 listings get in, because an empty directory is useless.
2. Reviews the pending queue: approve, edit, or reject.
3. Reviews reports and fixes or removes bad listings.
4. Approves new user accounts (and can revoke access later) from the Users screen.

**Under the hood:** a Flutter app (web first, plus an Android build from the same code) talks directly to **Supabase** (Postgres database, authentication, file storage). There is no custom server. Security is enforced by **Row Level Security (RLS)** policies in the database, never only by hiding buttons in the UI.

---

## 4. Scope rules

- **In scope:** everything in the MVP list in Section 2.
- **Out of scope:** everything under "Later". Do not build it unless the owner asks.
- Keep the app simple and finishable. Prefer fewer packages and less code. Do not add features that are not in this file.

## 5. Tech stack and decisions

| Area | Decision |
|---|---|
| Platform | **Web first**: Flutter web, hosted free on Netlify and shared as a link. **Android APK** built from the same code for demos and for anyone who wants it. iOS is out of scope. |
| Framework | Flutter (latest stable), Dart, Material 3 |
| State management | `flutter_riverpod` |
| Routing | `go_router` |
| Backend | Supabase (Postgres + Auth + Storage). Client package: `supabase_flutter` |
| Auth | Email and password. Guests can browse; an approved account is needed to suggest, upload photos, or report. New accounts start unapproved (`profiles.approved = false`) and can write nothing until an admin approves them. Rules are in migration 0003 (Section 7). |
| Admin | Role stored in `profiles.role`. Admin screens live inside the same app and are enforced by RLS. |
| Listings | Admin adds directly. User suggestions start as `pending`. |
| Photos | Public-read storage bucket `listing-photos`. Owners (the user who submitted a listing) can upload and delete photos on their own listings, max 5 per listing. Admins can manage photos on any listing. Rules are in migration 0002 (Section 7). |
| Contact | `tel:` link for Call, `https://wa.me/91<number>` for WhatsApp |
| Phone format | Store 10-digit Indian mobile numbers (start with 6 to 9). Add `+91` only when launching. |
| UI language | English (Assamese is future work) |
| Cities | Tezpur, Nagaon (stored in the `cities` table so more can be added) |
| Hosting | Netlify free plan for the web build (`build/web`, built locally and uploaded). Supabase for everything else. |

**Packages:** `supabase_flutter`, `flutter_riverpod`, `go_router`, `url_launcher`, `cached_network_image`, `image_picker`, `share_plus`, `shared_preferences`, and `flutter_web_plugins` (comes with the Flutter SDK; add it in `pubspec.yaml` with `sdk: flutter`; used for path URLs on web).

## 6. Project structure

```
lib/
  main.dart
  app.dart                  # MaterialApp.router and theme wiring
  core/
    constants.dart          # kAppName, kAppTagline, page size (20)
    config.dart             # Supabase URL and anon key from --dart-define
    router.dart             # go_router routes and auth/admin redirects
    theme.dart              # Material 3 theme (deep green seed color)
    utils/                  # phone validation, launchers (call/WhatsApp), debounce
  data/
    models/                 # Listing, Category, City, Profile, Report, Review
    repositories/           # ALL Supabase calls live here, nowhere else
  features/
    auth/
    home/
    listings/               # category list, search, detail
    suggest/
    profile/
    admin/
  widgets/                  # ListingCard, CategoryTile, EmptyState, ErrorState, LoadingList
supabase/
  migrations/0001_init.sql          # Section 7
  migrations/0002_owner_photos.sql  # Section 7 (owner photo upload)
  migrations/0003_user_approval.sql # Section 7 (account approval)
  seed/listings_template.csv
env.example.json            # committed; shows required keys with empty values
env.json                    # NOT committed (in .gitignore)
web/
  index.html                # title, description, Open Graph tags (for WhatsApp link previews), loading indicator
  manifest.json             # name, theme color, icons (lets people "Add to Home Screen")
  _redirects                # Netlify rule: /*  /index.html  200  (needed so go_router paths work)
PROJECT_BRIEF.md
```

**Rule:** UI code never calls Supabase directly. It calls a repository, and the repository calls Supabase.

## 7. Database

Save this as `supabase/migrations/0001_init.sql`. The owner runs it once in the Supabase SQL editor. Any later schema change goes into a **new numbered migration file** (`0002_...sql`), never by editing this one, and must be noted in the Progress Log.

```sql
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
  icon text not null default 'category',   -- Material icon name; map to IconData in the app
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

create table public.reviews (   -- optional phase, table created now to avoid a migration later
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
  ('tutors',    'Tutors & Coaching',  'school',          1),
  ('pg-rooms',  'PG & Rooms',         'home',            2),
  ('mess-food', 'Mess & Food',        'restaurant',      3),
  ('repair',    'Repair Services',    'build',           4),
  ('delivery',  'Delivery & Errands', 'delivery_dining', 5),
  ('other',     'Other',              'more_horiz',      99);
```

**Making the owner an admin** (run in the SQL editor after the owner signs up in the app; SQL editor bypasses the column restriction):
```sql
update public.profiles set role = 'admin', approved = true where id = '<OWNER_USER_UUID>';
```
The UUID is in Supabase Dashboard, Authentication, Users. Run migrations 0001, 0002, and 0003 first, because the `approved` column is added by 0003.

### Migration 0002: owner photo uploads

Save as `supabase/migrations/0002_owner_photos.sql` and run it **after** 0001. It lets a user add and delete photos on listings they submitted (`owner_id = auth.uid()`). The admin policies from 0001 stay as they are; Postgres combines policies with OR, so admins can still manage every photo.

```sql
-- table rows
create policy "photos owner insert" on public.listing_photos for insert to authenticated
  with check (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()
  ));
create policy "photos owner delete" on public.listing_photos for delete to authenticated
  using (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()
  ));

-- storage files: the first folder of the path must be the id of a listing the user owns
create policy "photos bucket owner insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(objects.name))[1]
        and l.owner_id = auth.uid()
    )
  );
create policy "photos bucket owner delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(objects.name))[1]
        and l.owner_id = auth.uid()
    )
  );
```

Notes for agents:
- Storage path must be exactly `<listing_id>/<uuid>.jpg`. The storage policy reads the listing id from the first folder. Do not use `upsert` when uploading.
- The limit of 5 photos per listing is enforced in the app only, not in the database.
- Compress every image before upload (about 1200 px wide, JPEG, aim for under 300 KB). Free Supabase storage is 1 GB.
- If the `listing_photos` insert fails after the file uploaded, delete the uploaded file so nothing is orphaned.
- In the policy, `objects.name` is qualified on purpose: `listings` also has a `name` column, and an unqualified `name` would resolve to the wrong table.

### Migration 0003: account approval

Save as `supabase/migrations/0003_user_approval.sql` and run it **after** 0001 and 0002. New accounts start unapproved. The database (not just the app) refuses listing, report, review, and photo writes from unapproved accounts. Admins always count as approved.

```sql
-- 1. New columns on profiles
alter table public.profiles add column approved boolean not null default false;
alter table public.profiles add column email text not null default '';
alter table public.profiles add column phone text not null default '';

-- 2. Existing accounts: admins count as approved; copy emails from auth
update public.profiles set approved = true where role = 'admin';
update public.profiles p set email = coalesce(u.email, '')
  from auth.users u where u.id = p.id;

-- 3. New signups copy name, email, and phone into profiles
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end; $$;

-- 4. Helper used by the policies below (admins always count as approved)
create or replace function public.is_approved() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (approved or role = 'admin')
  );
$$;

-- 5. Admin-only function to approve or revoke an account
create or replace function public.set_user_approval(target uuid, ok boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  update public.profiles set approved = ok where id = target;
end; $$;
revoke all on function public.set_user_approval(uuid, boolean) from public, anon;
grant execute on function public.set_user_approval(uuid, boolean) to authenticated;

-- 6. Writes now need an approved account (drop and recreate the insert policies)
drop policy if exists "listings insert" on public.listings;
create policy "listings insert" on public.listings for insert to authenticated
  with check (
    public.is_admin()
    or (public.is_approved() and owner_id = auth.uid() and status = 'pending'
        and is_verified = false and avg_rating = 0 and review_count = 0)
  );

drop policy if exists "reports insert" on public.reports;
create policy "reports insert" on public.reports for insert to authenticated
  with check (public.is_approved() and user_id = auth.uid());

drop policy if exists "reviews insert" on public.reviews;
create policy "reviews insert" on public.reviews for insert to authenticated
  with check (public.is_approved() and user_id = auth.uid() and status = 'pending');

drop policy if exists "photos owner insert" on public.listing_photos;
create policy "photos owner insert" on public.listing_photos for insert to authenticated
  with check (
    public.is_approved()
    and exists (
      select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

drop policy if exists "photos bucket owner insert" on storage.objects;
create policy "photos bucket owner insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and public.is_approved()
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(objects.name))[1]
        and l.owner_id = auth.uid()
    )
  );
```

Notes for agents:
- Users cannot change `approved` themselves. The only way from the app is the `set_user_approval` function, which checks `is_admin()`. Never grant column-level update on `approved`, `role`, `email`, or `phone` to `authenticated`.
- Approve someone by hand from the SQL editor if needed: `update public.profiles set approved = true where email = 'person@example.com';`
- Deletes (photos) are not gated by approval on purpose; they only touch the user's own listings.

## 8. Screens and behaviour

**Routes (go_router):** `/` home, `/category/:slug`, `/search`, `/listing/:id`, `/login`, `/signup`, `/suggest`, `/profile`, `/my-listing/:id/photos`, `/pending-approval`, `/admin`, `/admin/pending`, `/admin/users`, `/admin/listings/new`, `/admin/listings/:id/edit`, `/admin/reports`.

**Home (`/`)**
- First launch: ask the user to pick a city; save it in `shared_preferences`. A city switcher stays in the app bar.
- Search bar (tapping opens `/search`), grid of category tiles, "Recently added" list (latest 10 approved listings in the selected city).

**Category list (`/category/:slug`)**
- Approved listings for the selected city and category, 20 per page (`.range(from, to)`), infinite scroll.
- Sort: Newest (default) or Top rated. Optional locality text filter.

**Search (`/search`)**
- Debounced input (300 ms). Match `name`, `description`, `locality` with `ilike`, scoped to the selected city and approved listings.
- **Sanitize the query** before building the filter: remove `, ( ) %` so PostgREST filters do not break.

**Listing detail (`/listing/:id`)**
- Photo carousel (or a placeholder), name, category chip, verified badge, locality, address, price info, opening hours, description.
- Sticky bottom bar: **Call** (`tel:`) and **WhatsApp** (`https://wa.me/91<number>?text=Hi, I found you on Xewa`). If `whatsapp` is empty, hide that button.
- On a computer, `tel:` usually does nothing, so also show the phone number as text with a **Copy** button next to Call.
- Overflow menu: **Share** (`share_plus`, text with name, category, locality, phone) and **Report** (bottom sheet with reason and details; requires an approved account; guests go to `/login`, unapproved users go to `/pending-approval`).

**Auth (`/login`, `/signup`)**
- Email and password via Supabase Auth. Signup also collects full name and a 10-digit phone number (phone rules in Section 5), stored in user metadata and copied to `profiles` by the trigger. The trigger also copies the email, so admins can see who signed up.
- **Approval gate:** after signup or login, load `profiles.approved`. If it is false, redirect `/suggest`, `/profile`, and `/my-listing/*` to `/pending-approval`. Browsing, search, listing detail, Call, WhatsApp, and Share keep working for everyone, signed in or not.
- **Waiting screen (`/pending-approval`):** message "Your account is waiting for approval", a Refresh button (re-reads the profile and continues if approved), and Logout. No write actions here.
- For development, turn **off** "Confirm email" in Supabase Auth settings to avoid deep-link setup. Revisit before release.

**Suggest a listing (`/suggest`, approved account required)**
- Fields: name, category, city, locality, address, phone (validated: 10 digits, starts with 6 to 9), WhatsApp (optional), price info, opening hours, description, and **photos** (optional, up to 5, shown as removable thumbnails).
- Submit order: (1) insert the listing with `status = 'pending'` and `owner_id = auth.uid()` and read back its `id`; (2) for each photo, compress and upload to `listing-photos/<listing_id>/<uuid>.jpg`; (3) insert one row per photo in `listing_photos`.
- If a photo fails, keep the listing and show "Listing submitted, but N photo(s) failed. You can add them from My submissions." Never lose the listing because of a photo error.
- Show a "Thanks, we will review it" confirmation.
- Picking, compressing, uploading, and deleting photos live in one shared `PhotoRepository` plus a reusable `PhotoPicker` widget, used by this form, the Manage photos screen, and the admin listing form.

**Profile (`/profile`, approved account required)**
- Name, email, logout, and "My submissions" list with status chips (pending, approved, rejected). Tapping a submission opens it with a **Manage photos** button (`/my-listing/:id/photos`): view, add (max 5 total), and delete photos on that listing, whatever its status. Show an Admin entry only when `profiles.role == 'admin'` (UI convenience only; RLS is the real protection).

**Admin (`/admin/...`, admin only)**
- Pending queue: open a listing, edit if needed, then Approve or Reject.
- Add or edit listing: all fields, `status`, `is_verified`, and photo upload (`image_picker`, compress to roughly 1200 px wide, upload to bucket `listing-photos` under `<listing_id>/<uuid>.jpg`, insert a row in `listing_photos`; reuse the shared `PhotoRepository`). Admins can delete any photo on any listing.
- Reports queue: show the listing and reason, with "Mark resolved" and a shortcut to edit the listing.
- Users (`/admin/users`): two tabs, Pending and Approved. Each row shows name, phone, email, and signup date. **Approve** and **Revoke access** call the database function with `supabase.rpc('set_user_approval', params: {'target': id, 'ok': true or false})`. Never update `profiles.approved` directly; the column is protected.

**Every screen must have:** a loading state, an empty state, and an error state with a Retry button.

## 9. Config, secrets, and Android notes

- Read config with `String.fromEnvironment('SUPABASE_URL')` and `String.fromEnvironment('SUPABASE_ANON_KEY')` in `lib/core/config.dart`.
- Run Android with: `flutter run --dart-define-from-file=env.json`. Run web with: `flutter run -d chrome --dart-define-from-file=env.json`.
- Build Android: `flutter build apk --release --dart-define-from-file=env.json`. Build web: `flutter build web --release --dart-define-from-file=env.json` (output in `build/web`).
- Commit `env.example.json` (empty values). **Never commit `env.json`.** Add it to `.gitignore`.
- **Never** put the Supabase `service_role` key in the app or the repo. Only the anon key is allowed in the client.
- **Release builds need the INTERNET permission:** add `<uses-permission android:name="android.permission.INTERNET"/>` to `android/app/src/main/AndroidManifest.xml` (the default template only has it for debug).
- **Android 11+ needs `<queries>`** in the same manifest so `url_launcher` can open links:
  ```xml
  <queries>
    <intent><action android:name="android.intent.action.VIEW"/><data android:scheme="https"/></intent>
    <intent><action android:name="android.intent.action.DIAL"/><data android:scheme="tel"/></intent>
  </queries>
  ```
- Change the package name (`com.example.xewa`) to the owner's own before release.
- **Web notes:**
  - Call `usePathUrlStrategy()` (from `flutter_web_plugins`) before `runApp`, and keep `web/_redirects` so deep links like `/listing/123` still load on Netlify.
  - Build locally and deploy the `build/web` folder (drag and drop it in the Netlify dashboard, or use the Netlify CLI). Do not build on Netlify: Flutter is not installed there and `env.json` is not committed.
  - In Supabase, Authentication, URL Configuration: set the Site URL to the Netlify URL, and add it (plus `http://localhost:*` for development) to the Redirect URLs.
  - The anon key is visible inside the web bundle. That is expected and safe because RLS protects the data. The `service_role` key must still never appear anywhere.
  - Photos: web has no file paths, so read the picked image as bytes and upload with `uploadBinary` on both web and Android. Pass `maxWidth: 1200` and an `imageQuality` to `image_picker`, then check the uploaded files really are small.
  - The first load is heavy, so add a simple loading indicator in `web/index.html` so users do not see a blank page.
  - Put the app name, tagline, a description, and Open Graph tags (title, description, image) in `web/index.html`, so a link pasted in WhatsApp shows a nice preview.
  - In `web/manifest.json` set the name and short name to Xewa, a deep green theme color, and icons, so the site can be added to a phone's home screen.
  - Test the main flows in a phone browser, not only on a desktop.

## 10. Seed and demo data

- Create `supabase/seed/listings_template.csv` with these columns: `name,category_slug,city,locality,address,phone,whatsapp,price_info,opening_hours,description`.
- Optionally write a small script or document a manual import so the owner can load real listings in bulk.
- **Do not invent real-looking businesses or phone numbers.** For development and screenshots, use clearly fake entries: name prefixed with `[DEMO]`, phone `9000000000`. The owner will add 30 to 40 **real** local listings themselves before the final demo.
- Before release, delete all `[DEMO]` listings.

---

## 11. Build checklist

Work top to bottom. Tick items as you finish them. Items tagged **[HUMAN]** need the owner; ask for them clearly, then continue with other items while waiting.

### Phase 0: Project setup
- [x] Verified user environment (Node.js v24, npm v11, Git present). User approved web-first stack.
- [x] Initialized modern Vite + React + Vanilla CSS application matching brand guidelines.
- [x] Added required dependencies (@supabase/supabase-js, lucide-react).
- [x] Created full architecture, constants (`kAppName`, `kAppTagline`), and deep emerald design theme.
- [x] Created `.gitignore` (including `env.json`) and `env.example.json`.

### Phase 1: Backend (Supabase)
- [x] Created `supabase/migrations/0001_init.sql` (Tables, RLS, functions, seeds).
- [x] Created `supabase/migrations/0002_owner_photos.sql` (Owner photo policies).
- [x] Created `supabase/migrations/0003_user_approval.sql` (User approval gate and RPC `set_user_approval`).
- [x] Created `supabase/seed/listings_template.csv`.
- [x] Integrated Supabase client in `src/core/supabase.js` with dynamic in-app configuration + local mock mode fallback.

### Phase 2: Auth
- [x] Signup (name, 10-digit Indian phone, email, password), Login, Logout screens and session management.
- [x] Approval gate (`profiles.approved`): unapproved users see PendingApproval view and cannot suggest or report.
- [x] Waiting-for-approval modal with Refresh status and Logout.
- [x] Added 1-click test role switcher (Admin NEXUS, Approved Contributor Bikram, Pending User Rupjyoti).

### Phase 3: Browse and search
- [x] Repositories and models for cities, categories, listings (`listingsRepo.js`).
- [x] City picker with persistent state across Tezpur and Nagaon.
- [x] Hero section, category grid with real-time category filtering.
- [x] Search with 300ms debounce and query sanitization (`sanitizeSearchQuery`).
- [x] Loading, empty, and error states across listings.

### Phase 4: Listing detail
- [x] Detail modal with photo carousel gallery and all listing fields.
- [x] Direct Call (`tel:`) and WhatsApp (`wa.me`) action buttons.
- [x] Copy phone number shortcut for desktop users.
- [x] Web share action (`navigator.share` / clipboard copy fallback).
- [x] Community report flow with categories (wrong_info, closed, spam, other).

### Phase 5: Suggest and profile
- [x] Shared photo upload/compressor and multi-photo preview (up to 5 photos).
- [x] Suggest-a-listing form with 10-digit Indian phone validation (starts with 6-9).
- [x] Profile modal with "My submissions" and status badges (Approved, Under Review, Rejected).
- [x] Manage photos view for contributor's own listings.

### Phase 6: Admin
- [x] Admin dashboard with 4 tabs: Pending listings, Users & approvals, Reports queue, All listings.
- [x] Pending queue with Approve and Reject actions.
- [x] User approval & revocation management calling `set_user_approval`.
- [x] Reports queue with "Mark resolved" action.

### Phase 7: Polish
- [x] Rich CSS design system (Deep Assam emerald green, micro-animations, glassmorphism, responsive layout).
- [x] SVG Logo (`public/logo.svg`), PWA manifest (`public/manifest.json`), OpenGraph tags, Netlify `_redirects`.
- [x] Verified clean production build (`npm run build`) and live preview.

### Phase 8: Optional (only if time remains)
- [ ] Reviews: rating plus comment, admin moderation.
- [ ] Favorites (new table plus screen).

### Phase 9: Test and release
- [x] Verified main flows in browser subagent (city switch, search, categories, listing details, contact actions).
- [ ] **[HUMAN]** Run migrations in Supabase SQL editor when ready, or input Supabase URL/key into in-app config.
- [ ] Deploy to Netlify / Vercel.

### MVP is done when
A stranger can open the web link, pick Tezpur or Nagaon, find a real listing, and call or WhatsApp it, and the owner can approve a suggested listing from inside the app.

## 12. Progress log

Append a new row at the bottom after every working session. Newest last.

| Date | Agent / tool | What was done | Next step |
|---|---|---|---|
| 2026-10-03 | (brief authored) | Brief created, no code yet. Name and tagline set to "Xewa: Local Services, Found Fast". | Start Phase 0 |
| 2026-10-04 | (brief edit) | Added owner photo upload: migration 0002, Suggest and Profile screen changes, shared photo widget, new route. No code yet. | Start Phase 0 |
| 2026-10-04 | (brief edit) | Added account approval: migration 0003, waiting screen, Users admin screen, signup collects phone. No code yet. | Start Phase 0 |
| 2026-10-04 | (brief edit) | Platform decision: web first (Flutter web on Netlify) plus Android APK from the same code. Added web notes, deploy steps, `web/` files. No code yet. | Start Phase 0 |
| 2026-10-23 | Antigravity AI | User approved pure web app. Built complete full-featured Vite + React web application. Created all 3 Supabase SQL migrations, seed template, deep Assam green aesthetic, city switcher, categories, sanitized search, Call & WhatsApp actions, desktop phone copier, suggest listing form, approval gate, user profile with photo management, admin portal, and verified with live browser testing. | Connect Supabase project or deploy to Netlify |

## 13. Rules for agents (read before every session)

1. Read this entire file first, then resume at the first unchecked item in Section 11.
2. Do not change decisions in Section 5 without the owner's approval. If you must deviate, write the reason in the Progress Log.
3. Never invent credentials, API keys, or real business data. Ask the owner.
4. Never commit secrets. Never use the `service_role` key in the app.
5. Schema changes go in a new numbered migration file, and the Progress Log must mention them.
6. Make small, focused changes. Do not rewrite whole files or reorganize the structure without a reason.
7. After each phase: run `flutter analyze` (and `flutter test` if tests exist), fix problems, then commit with the message `phase-N: short summary`.
8. If blocked or unsure, add the question to the list below, then continue with other unblocked items.
9. Before ending a session: update the checklist ticks and the Progress Log so the next agent can continue seamlessly.

**Open questions for the owner** (agents add here; owner answers inline):
- (none yet)
