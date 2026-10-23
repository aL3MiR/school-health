import shutil,os,re,sys
R=lambda p:open(p,encoding='utf8').read()
KEY=os.environ.get('SB_ANON','__ANON__')
sb=R('sb.js').replace('__ANON__',KEY)
OG=lambda t,d,img,path:f'''<meta property="og:type" content="website"><meta property="og:title" content="{t}"><meta property="og:description" content="{d}"><meta property="og:image" content="{img}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:site_name" content="منصة الصحة المدرسية - القطاع الشمالي"><meta property="og:url" content="https://school-health-north.pages.dev{path}"><meta property="og:locale" content="ar_SA"><meta name="twitter:card" content="summary_large_image"><meta name="description" content="{d}">'''
# hub
h=R('/home/claude/hub/page.html')
h=h.replace('<script>\n','<script>\n'+sb+'\n',1)
h=h.replace('<meta name="claude:viewport-fit-sides" content="cover">','<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+OG('منصة الصحة المدرسية - القطاع الشمالي','مؤشرات إنجاز الصحة المدرسية لمراكز القطاع الشمالي - تجمع جازان الصحي','https://school-health-north.pages.dev/og-platform.jpg','/'),1)
h='<meta charset="utf-8">'+h
open('index.html','w',encoding='utf8').write(h)
# salama
s=R('/home/claude/web/page.html')
s=s.replace('<script>','<script>\n'+sb+'\n',1)
if 'name="viewport"' not in s:
    s='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+s
s=s.replace('</title>','</title>'+OG('لوحة إنجاز الصحة المدرسية - مركز السلامه العليا','متابعة مؤشرات الصحة المدرسية لمدارس مركز السلامه العليا','https://school-health-north.pages.dev/og-salama.jpg','/salama/'),1)
open('salama/index.html','w',encoding='utf8').write(s)
print(len(h),len(s))
