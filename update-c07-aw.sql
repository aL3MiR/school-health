-- تحديث حالة زيارتين توعويتين إلى «منجز ومُدخل بمنصة صحة» لمركز السلامه العليا (حساسية: ابتدائية السلامه العليا بنين، ومتوسطة الملك سعود)
-- لا يمس بقية بياناتك، ويحدّث نسبة الإدخال فقط.
update public.centers c set
  data = (c.data || jsonb_build_object('entPct', 0.5056179775280899, 'updated', 1792927382475))
         || jsonb_build_object('state', (
              jsonb_set(
                (c.data->>'state')::jsonb,
                '{schools}',
                (select jsonb_agg(
                          case when sc->>'min' in ('90190','90610')
                               then jsonb_set(sc,'{s,a2}','2'::jsonb)
                               else sc end
                          order by ord)
                   from jsonb_array_elements((c.data->>'state')::jsonb->'schools') with ordinality as t(sc,ord))
              )::text)),
  updated_at = now()
where c.id = 'c07';
