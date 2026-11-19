-- Review and apply to a development Supabase project before production.
-- Staff roles are trusted app_metadata set by an administrator, never user_metadata.
begin;
create or replace function public.cabinly_is_staff() returns boolean language sql stable as $$
 select coalesce(auth.jwt() -> 'app_metadata' ->> 'app_role', '') in ('staff', 'admin');
$$;

do $$
declare table_name text;
begin
 foreach table_name in array array['cabins', 'bookings', 'guests', 'settings'] loop
  execute format('alter table public.%I enable row level security', table_name);
  execute format('drop policy if exists cabinly_staff_guard on public.%I', table_name);
  execute format('drop policy if exists cabinly_staff_access on public.%I', table_name);
  -- Restrictive guard prevents older permissive policies from granting public access.
  execute format('create policy cabinly_staff_guard on public.%I as restrictive for all to anon, authenticated using (public.cabinly_is_staff()) with check (public.cabinly_is_staff())', table_name);
  execute format('create policy cabinly_staff_access on public.%I for all to authenticated using (public.cabinly_is_staff()) with check (public.cabinly_is_staff())', table_name);
 end loop;
end $$;

drop policy if exists cabinly_private_upload_guard on storage.objects;
create policy cabinly_private_upload_guard on storage.objects as restrictive for insert to anon, authenticated
 with check (bucket_id not in ('cabin-images', 'avatars') or (public.cabinly_is_staff() and (bucket_id = 'cabin-images' or (storage.foldername(name))[1] = auth.uid()::text)));
drop policy if exists cabinly_private_update_guard on storage.objects;
create policy cabinly_private_update_guard on storage.objects as restrictive for update to anon, authenticated
 using (bucket_id not in ('cabin-images', 'avatars') or (public.cabinly_is_staff() and (bucket_id = 'cabin-images' or (storage.foldername(name))[1] = auth.uid()::text)))
 with check (bucket_id not in ('cabin-images', 'avatars') or (public.cabinly_is_staff() and (bucket_id = 'cabin-images' or (storage.foldername(name))[1] = auth.uid()::text)));
drop policy if exists cabinly_private_delete_guard on storage.objects;
create policy cabinly_private_delete_guard on storage.objects as restrictive for delete to anon, authenticated
 using (bucket_id not in ('cabin-images', 'avatars') or (public.cabinly_is_staff() and (bucket_id = 'cabin-images' or (storage.foldername(name))[1] = auth.uid()::text)));
drop policy if exists cabinly_staff_images on storage.objects;
create policy cabinly_staff_images on storage.objects for all to authenticated
 using (public.cabinly_is_staff() and (bucket_id = 'cabin-images' or (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)))
 with check (public.cabinly_is_staff() and (bucket_id = 'cabin-images' or (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)));
-- Buckets may be public for displaying photos; never store private guest documents in them.
commit;
