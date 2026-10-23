-- ============ MIGRATION 0002: OWNER PHOTO UPLOADS ============

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
