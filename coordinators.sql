-- حسابات منسقي المراكز: لكل مركز حساب واحد يعدّل بيانات مركزه فقط
-- الصق الملف كاملاً في Supabase > SQL Editor ثم Run. في الأسفل يظهر جدول بأسماء المراكز وكلمات المرور.
-- ملاحظة: كلمات المرور تظهر مرة واحدة هنا فقط (لا تُحفظ نصاً في أي مكان). انسخ الجدول واحفظه.

-- 1) الصلاحيات: المنسق يكتب سطر مركزه فقط (لا يحذف، ولا يلمس مركزاً آخر)
drop policy if exists centers_coord_ins on public.centers;
drop policy if exists centers_coord_upd on public.centers;
create policy centers_coord_ins on public.centers for insert to authenticated
  with check ((auth.jwt()->'app_metadata'->>'role') = 'coordinator'
          and id = (auth.jwt()->'app_metadata'->>'center'));
create policy centers_coord_upd on public.centers for update to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'coordinator'
          and id = (auth.jwt()->'app_metadata'->>'center'))
  with check ((auth.jwt()->'app_metadata'->>'role') = 'coordinator'
          and id = (auth.jwt()->'app_metadata'->>'center'));

-- 2) إنشاء حساب لكل مركز (يتخطى الموجود مسبقاً)
create temp table if not exists coord_creds(cid text, center text, email text, password text);
truncate coord_creds;
do $$
declare
  names text[] := array['بيش','بيش الجنوبي','الحقو','القوام','قايم الدش','العالية','السلامه العليا','العشة','المحلة','مسلية','المطعن','قرية بيش','الفطيحة','الخلاوية','الريث','مقزع','القهر','عمود','الجبل الأسود','السادة','الدرب','أبو السداد','الشقيق','منشبة','عتود'];
  alpha text := 'abcdefghjkmnpqrstuvwxyz23456789';
  i int; j int; cid text; em text; pw text; uid uuid;
begin
  for i in 1..array_length(names,1) loop
    cid := 'c'||lpad(i::text,2,'0');
    em  := cid||'@sh-north.example';
    if exists (select 1 from auth.users where email = em) then
      insert into coord_creds values (cid, names[i], em, '(موجود مسبقاً - لم تتغير)');
      continue;
    end if;
    pw := '';
    for j in 1..10 loop
      pw := pw || substr(alpha, (get_byte(extensions.gen_random_bytes(1),0) % length(alpha))+1, 1);
    end loop;
    uid := gen_random_uuid();
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
        raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
        confirmation_token,recovery_token,email_change_token_new,email_change)
      values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',em,
        extensions.crypt(pw, extensions.gen_salt('bf')),now(),
        jsonb_build_object('provider','email','providers',jsonb_build_array('email'),'role','coordinator','center',cid),
        jsonb_build_object('center_name',names[i]),now(),now(),'','','','');
    insert into auth.identities (id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
      values (gen_random_uuid(),uid,uid::text,jsonb_build_object('sub',uid::text,'email',em,'email_verified',true),'email',now(),now(),now());
    insert into coord_creds values (cid, names[i], em, pw);
  end loop;
end $$;

-- 3) النتيجة: انسخها واحفظها (الدخول من المنصة باختيار اسم المركز + كلمة المرور)
select cid as "الرمز", center as "المركز", password as "كلمة المرور" from coord_creds order by cid;
