-- Jalankan di Supabase SQL Editor jika upload gagal karena policy.
-- Bucket: mixer-audio (public)

insert into storage.buckets (id, name, public)
values ('mixer-audio', 'mixer-audio', true)
on conflict (id) do update set public = true;

-- Baca publik
drop policy if exists "mixer_audio_public_read" on storage.objects;
create policy "mixer_audio_public_read"
on storage.objects for select
using (bucket_id = 'mixer-audio');

-- Upload anon/authenticated (studio client)
drop policy if exists "mixer_audio_public_insert" on storage.objects;
create policy "mixer_audio_public_insert"
on storage.objects for insert
with check (bucket_id = 'mixer-audio');
