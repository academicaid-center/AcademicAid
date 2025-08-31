-- Storage bucket for videos
insert into storage.buckets (id, name, public) values ('videos','videos', false)
on conflict (id) do nothing;

-- Storage RLS policies
create policy if not exists videos_read_signed on storage.objects for select using (
  bucket_id = 'videos'
);

create policy if not exists videos_write_admin on storage.objects for insert to authenticated with check (
  bucket_id = 'videos' and is_role(array['admin','teacher'])
);

create policy if not exists videos_update_admin on storage.objects for update to authenticated using (
  bucket_id = 'videos' and is_role(array['admin','teacher'])
);
