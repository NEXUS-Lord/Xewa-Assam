-- ============ MIGRATION 0005: SEPARATE WHATSAPP NUMBER ============

-- 1. Add whatsapp column to profiles if not present
alter table public.profiles add column if not exists whatsapp text not null default '';

-- 2. Backfill existing records (if whatsapp is empty, copy phone)
update public.profiles
set whatsapp = phone
where whatsapp = '' and phone != '';

-- 3. Update the new user trigger function to persist both phone and whatsapp
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone, whatsapp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'whatsapp', coalesce(new.raw_user_meta_data->>'phone', ''))
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    whatsapp = excluded.whatsapp;
  return new;
end; $$;
