/* محوّل Supabase: يوفّر نفس واجهة claude.use('db'|'user'|'downloads') لتعمل المنصتان خارج Claude */
(function(){
var URL_='https://rzrwbrgebcylixjciega.supabase.co',KEY='__ANON__',SK='sh_sb_session';
var sess=null;try{sess=JSON.parse(localStorage.getItem(SK)||'null')}catch(e){}
function jwt(t){try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch(e){return {}}}
function owner(){return !!(sess&&sess.access_token&&jwt(sess.access_token).app_metadata&&jwt(sess.access_token).app_metadata.role==='owner'&&jwt(sess.access_token).exp*1000>Date.now()-60000)}
function meta(){return (sess&&sess.access_token&&jwt(sess.access_token).exp*1000>Date.now()-60000&&jwt(sess.access_token).app_metadata)||{}}
function coord(){var m=meta();return m.role==='coordinator'&&/^c\d\d$/.test(m.center||'')}
function cen(){return coord()?meta().center:''}
var CN=['بيش','بيش الجنوبي','الحقو','القوام','قايم الدش','العالية','السلامه العليا','العشة','المحلة','مسلية','المطعن','قرية بيش','الفطيحة','الخلاوية','الريث','مقزع','القهر','عمود','الجبل الأسود','السادة','الدرب','أبو السداد','الشقيق','منشبة','عتود'];
async function refresh(){if(!sess||!sess.refresh_token)return;try{var r=await fetch(URL_+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:sess.refresh_token})});if(r.ok){sess=await r.json();localStorage.setItem(SK,JSON.stringify(sess))}else{sess=null;localStorage.removeItem(SK)}}catch(e){}}
async function ensure(){if(sess&&jwt(sess.access_token).exp*1000<Date.now()+60000)await refresh()}
async function api(path,opt){await ensure();opt=opt||{};var h=Object.assign({apikey:KEY,Authorization:'Bearer '+((sess&&sess.access_token)||KEY),'Content-Type':'application/json'},opt.headers||{});var r=await fetch(URL_+'/rest/v1/'+path,Object.assign({},opt,{headers:h}));if(!r.ok){var t='';try{t=(await r.text()).slice(0,200)}catch(x){}var e=new Error(r.status+' '+t);e.code=r.status;throw e}var tx=await r.text();return tx?JSON.parse(tx):null}
function snapDoc(row){return {id:row.id,data:function(){return row.data}}}
var DB={
 doc:function(p){var a=p.split('/'),t=a[0],id=a[1];return{
  get:async function(){var rows=await api(t+'?id=eq.'+encodeURIComponent(id)+'&select=id,data');return {exists:rows.length>0,id:id,data:function(){return rows[0]&&rows[0].data}}},
  set:async function(d){await api(t+'?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:id,data:d,updated_at:new Date().toISOString()})})},
  delete:async function(){await api(t+'?id=eq.'+encodeURIComponent(id),{method:'DELETE'})}}},
 collection:function(t){return{onSnapshot:function(ok,err){var stop=false,last='';async function tick(){if(stop)return;try{var rows=await api(t+'?select=id,data');var s=JSON.stringify(rows);if(s!==last){last=s;ok({docs:rows.map(snapDoc)})}}catch(e){if(err&&!last){last='x';err(e)}}}tick();var iv=setInterval(function(){if(document.visibilityState==='visible')tick()},30000);return function(){stop=true;clearInterval(iv)}}}}
};
var DL={save:async function(o){var b=o.data instanceof Blob?o.data:new Blob([o.data]);var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=o.filename;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u)},4000)}};
window.claude={use:async function(n){if(n==='db')return DB;if(n==='user')return {isOwner:owner,canEdit:function(){return owner()||coord()},center:cen};if(n==='downloads')return DL;throw new Error('unknown')}};
window.SB={isOwner:owner,isCoord:coord,center:cen,logout:function(){sess=null;try{localStorage.removeItem(SK)}catch(e){}location.reload()},
 login:async function(email,pw){var r=await fetch(URL_+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:email,password:pw})});if(!r.ok)throw new Error('bad');sess=await r.json();if(!owner()&&!coord()){sess=null;throw new Error('notowner')}localStorage.setItem(SK,JSON.stringify(sess));location.reload()}};
/* ===== المظهر + طريقة العرض + الدخول ===== */
var FRAMED=false;try{FRAMED=window.top!==window.self}catch(e){FRAMED=true}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}
var PHONE=Math.min(screen.width,screen.height)<700;
function theme(){return document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}
function setTheme(t){document.documentElement.setAttribute('data-theme',t);ls('sh_theme',t);try{var fr=document.getElementById('shframe');if(fr&&fr.contentDocument)fr.contentDocument.documentElement.setAttribute('data-theme',t)}catch(e){}}
if(ls('sh_theme'))document.documentElement.setAttribute('data-theme',ls('sh_theme'));
var VIEW=ls('sh_view')||'';
if(PHONE&&VIEW==='d'){var mv=document.querySelector('meta[name=viewport]');if(mv)mv.setAttribute('content','width=1100')}
if(!PHONE&&!FRAMED&&VIEW==='m'){location.replace('/frame.html?u='+encodeURIComponent(location.pathname))}
var IC={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',phone:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',desk:'<rect x="2.5" y="4" width="19" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'};
function svg(n){return '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>'}
function mk(label,icon,fn){var b=document.createElement('button');b.type='button';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=svg(icon);
 b.style.cssText='width:38px;height:38px;border-radius:50%;border:1px solid rgba(120,135,150,.55);background:rgba(255,255,255,.92);color:#26384a;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.18)';
 b.onclick=fn;return b}
window.SBopenLogin=function(){
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:center;justify-content:center;direction:rtl;font-family:inherit';
  o.innerHTML='<form style="background:#fff;color:#17212B;padding:22px;border-radius:12px;width:min(340px,90vw);display:grid;gap:10px"><b style="font-size:17px">تسجيل الدخول</b><select name=c style="padding:9px;border:1px solid #8a97a6;border-radius:8px;font:inherit;font-size:16px;background:#fff;color:#17212B;-webkit-text-fill-color:#17212B;color-scheme:light"><option value="">اختر مركزك…</option>'+CN.map(function(n,i){return '<option value="c'+(i<9?'0':'')+(i+1)+'">منسق '+n+'</option>'}).join('')+'<option value="sup">مشرف القطاع</option></select><input name=e type=text hidden placeholder="اسم المستخدم (مشرف القطاع)" autocapitalize=off autocomplete=username required style="padding:9px;border:1px solid #8a97a6;border-radius:8px;font:inherit;font-size:16px;direction:ltr;background:#fff;color:#17212B;-webkit-text-fill-color:#17212B;color-scheme:light"><input name=p type=password placeholder="كلمة المرور" autocomplete=current-password required style="padding:9px;border:1px solid #8a97a6;border-radius:8px;font:inherit;font-size:16px;direction:ltr;background:#fff;color:#17212B;-webkit-text-fill-color:#17212B;color-scheme:light"><div class=m style="color:#B5352A;font-size:13px;min-height:16px"></div><div style="display:flex;gap:8px"><button style="flex:1;padding:9px;border:0;border-radius:8px;background:#0F2C46;color:#fff;font:inherit">دخول</button><button type=button class=c style="padding:9px 14px;border:1px solid #ccd;border-radius:8px;background:#fff;font:inherit">إلغاء</button></div></form>';
  document.body.appendChild(o);var f=o.firstChild;f.c.onchange=function(){f.e.hidden=f.c.value!=='sup';f.e.required=f.c.value==='sup'};f.querySelector('.c').onclick=function(){o.remove()};
  f.onsubmit=async function(ev){ev.preventDefault();var m=f.querySelector('.m');m.textContent='جارٍ الدخول…';try{if(!f.c.value){m.textContent='اختر مركزك أو «مشرف القطاع».';return}var se=f.e.value.trim().toLowerCase();await SB.login(f.c.value==='sup'?(se.indexOf('@')>0?se:se+'@admin.sh-north.example'):f.c.value+'@sh-north.example',f.p.value)}catch(x){m.textContent=x.message==='notowner'?'هذا الحساب غير مخوّل.':'بيانات الدخول غير صحيحة.'}}};
function ui(){
 if(FRAMED)return;
 var d=document.createElement('div');d.id='shdock';d.style.cssText='position:fixed;bottom:12px;left:12px;z-index:99;display:flex;gap:8px;align-items:center;direction:rtl';
 var tb=mk('',theme()==='dark'?'sun':'moon',function(){setTheme(theme()==='dark'?'light':'dark');paint()});
 var vb=mk('','phone',function(){ls('sh_view',PHONE?(VIEW==='d'?null:'d'):(VIEW==='m'?null:'m'));location.reload()});
 var lb=mk('','user',function(){if(owner()||coord()){SB.logout();return}window.SBopenLogin()});
 var tag=document.createElement('span');tag.style.cssText='font:12px inherit;font-family:inherit;background:rgba(255,255,255,.92);color:#26384a;border:1px solid rgba(120,135,150,.55);border-radius:14px;padding:4px 10px';
 function paint(){var dk=theme()==='dark';tb.innerHTML=svg(dk?'sun':'moon');tb.title=tb.ariaLabel=dk?'الوضع النهاري':'الوضع الداكن';tb.setAttribute('aria-label',tb.title);
  var on=PHONE?VIEW==='d':VIEW==='m';vb.innerHTML=svg(PHONE?'desk':'phone');vb.title=PHONE?(on?'عرض الجوال':'عرض الكمبيوتر'):(on?'عرض الكمبيوتر':'عرض الجوال');vb.setAttribute('aria-label',vb.title);
  var li=owner()||coord();lb.innerHTML=svg(li?'out':'user');lb.title=li?'تسجيل الخروج':'تسجيل الدخول';lb.setAttribute('aria-label',lb.title);
  tag.hidden=!li;tag.textContent=owner()?'مشرف القطاع':coord()?'منسق '+CN[+cen().slice(1)-1]:'';
  [tb,vb,lb].forEach(function(b){b.style.background=dk?'rgba(27,42,55,.95)':'rgba(255,255,255,.92)';b.style.color=dk?'#e6edf3':'#26384a'});tag.style.background=dk?'rgba(27,42,55,.95)':'rgba(255,255,255,.92)';tag.style.color=dk?'#e6edf3':'#26384a'}
 d.append(lb,tag,tb,vb);paint();document.body.appendChild(d)}
if(document.body)ui();else document.addEventListener('DOMContentLoaded',ui);
})();
