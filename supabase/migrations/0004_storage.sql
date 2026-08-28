-- 0004_storage.sql
insert into storage.buckets (id, name, public)
values ('public-images', 'public-images', true)
on conflict (id) do nothing;

create policy "public read images" on storage.objects
  for select using (bucket_id = 'public-images');

create policy "admin upload images" on storage.objects
  for insert with check (bucket_id = 'public-images' and public.auth_role() = 'admin');

create policy "owner upload images" on storage.objects
  for insert with check (bucket_id = 'public-images' and public.auth_role() = 'stall_owner');

create policy "admin manage images" on storage.objects
  for update using (bucket_id = 'public-images' and public.auth_role() = 'admin')
  with check (bucket_id = 'public-images' and public.auth_role() = 'admin');

create policy "owner manage images" on storage.objects
  for update using (bucket_id = 'public-images' and public.auth_role() = 'stall_owner')
  with check (bucket_id = 'public-images' and public.auth_role() = 'stall_owner');

create policy "admin delete images" on storage.objects
  for delete using (bucket_id = 'public-images' and public.auth_role() = 'admin');

create policy "owner delete images" on storage.objects
  for delete using (bucket_id = 'public-images' and public.auth_role() = 'stall_owner');