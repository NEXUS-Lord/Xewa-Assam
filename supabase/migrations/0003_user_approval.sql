-- ============ MIGRATION 0003: USER APPROVAL GATE ============

-- 1. New columns on profiles
alter table public.profiles add column if not exists approved boolean not null default false;
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists phone text not null default '';

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
