-- منصة الصحة المدرسية - القطاع الشمالي : إعداد قاعدة البيانات
-- الصق هذا الملف كاملاً في Supabase > SQL Editor ثم اضغط Run

create table if not exists public.centers (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.log (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.centers enable row level security;
alter table public.log enable row level security;

-- المراكز: قراءة للجميع، وكتابة/حذف للمشرف فقط
drop policy if exists centers_read on public.centers;
drop policy if exists centers_write on public.centers;
create policy centers_read on public.centers for select using (true);
create policy centers_write on public.centers for all
  using ((auth.jwt()->'app_metadata'->>'role') = 'owner')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'owner');

-- سجل التحديثات: للمشرف فقط (قراءة وكتابة)
drop policy if exists log_owner on public.log;
create policy log_owner on public.log for all
  using ((auth.jwt()->'app_metadata'->>'role') = 'owner')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'owner');

-- صلاحيات الأدوار (مطلوبة مع RLS)
grant usage on schema public to anon, authenticated;
grant select on public.centers to anon, authenticated;
grant insert, update, delete on public.centers to authenticated;
grant select, insert, update, delete on public.log to authenticated;
notify pgrst, 'reload schema';

-- بعد إنشاء مستخدم المشرف من Authentication > Users، شغّل هذا السطر (غيّر البريد):
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"owner"}'::jsonb where email = 'frodo-2@hotmail.com';
