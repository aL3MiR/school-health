-- تحديث الفحص الاستكشافي لمدارس البنات (متوسطة السلامه العليا، ثانوية السلامه العليا، متوسطة المجديرة، متوسطة السلامه السفلى):
-- بعد إدخال جميع حالات الغياب يصبح المنجز = المستهدف (بعد خصم المحوَّلين). لا يمس بقية بياناتك.
update public.centers c set
  data = (c.data || jsonb_build_object('scrPct', 0.9045226130653267, 'updated', 1793231000000))
         || jsonb_build_object('state', (
              jsonb_set(
                (c.data->>'state')::jsonb,
                '{schools}',
                (select jsonb_agg(
                          case when sc->>'min' in ('89005','192102','89092','89072')
                               then jsonb_set(sc,'{scr,done}',
                                    to_jsonb(coalesce((sc->'scr'->>'total')::int,0) - coalesce((sc->'scr'->>'transf')::int,0)))
                               else sc end
                          order by ord)
                   from jsonb_array_elements((c.data->>'state')::jsonb->'schools') with ordinality as t(sc,ord))
              )::text)),
  updated_at = now()
where c.id = 'c07';
