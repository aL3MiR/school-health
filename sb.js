/* محوّل Supabase: يوفّر نفس واجهة claude.use('db'|'user'|'downloads') لتعمل المنصتان خارج Claude */
(function(){
var URL_='https://rzrwbrgebcylixjciega.supabase.co',KEY='__ANON__',SK='sh_sb_session';
var sess=null;try{sess=JSON.parse(localStorage.getItem(SK)||'null')}catch(e){}
function jwt(t){try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch(e){return {}}}
function owner(){return !!(sess&&sess.access_token&&jwt(sess.access_token).app_metadata&&jwt(sess.access_token).app_metadata.role==='owner'&&jwt(sess.access_token).exp*1000>Date.now()-60000)}
async function refresh(){if(!sess||!sess.refresh_token)return;try{var r=await fetch(URL_+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:sess.refresh_token})});if(r.ok){sess=await r.json();localStorage.setItem(SK,JSON.stringify(sess))}else{sess=null;localStorage.removeItem(SK)}}catch(e){}}
async function ensure(){if(sess&&jwt(sess.access_token).exp*1000<Date.now()+60000)await refresh()}
async function api(path,opt){await ensure();opt=opt||{};var h=Object.assign({apikey:KEY,Authorization:'Bearer '+((sess&&sess.access_token)||KEY),'Content-Type':'application/json'},opt.headers||{});var r=await fetch(URL_+'/rest/v1/'+path,Object.assign({},opt,{headers:h}));if(!r.ok){var e=new Error('http '+r.status);e.code=r.status;throw e}return r.status===204?null:r.json()}
function snapDoc(row){return {id:row.id,data:function(){return row.data}}}
var DB={
 doc:function(p){var a=p.split('/'),t=a[0],id=a[1];return{
  get:async function(){var rows=await api(t+'?id=eq.'+encodeURIComponent(id)+'&select=id,data');return {exists:rows.length>0,id:id,data:function(){return rows[0]&&rows[0].data}}},
  set:async function(d){await api(t+'?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:id,data:d,updated_at:new Date().toISOString()})})},
  delete:async function(){await api(t+'?id=eq.'+encodeURIComponent(id),{method:'DELETE'})}}},
 collection:function(t){return{onSnapshot:function(ok,err){var stop=false,last='';async function tick(){if(stop)return;try{var rows=await api(t+'?select=id,data');var s=JSON.stringify(rows);if(s!==last){last=s;ok({docs:rows.map(snapDoc)})}}catch(e){if(err&&!last){last='x';err(e)}}}tick();var iv=setInterval(function(){if(document.visibilityState==='visible')tick()},30000);return function(){stop=true;clearInterval(iv)}}}}
};
var DL={save:async function(o){var b=o.data instanceof Blob?o.data:new Blob([o.data]);var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=o.filename;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u)},4000)}};
window.claude={use:async function(n){if(n==='db')return DB;if(n==='user')return {isOwner:owner};if(n==='downloads')return DL;throw new Error('unknown')}};
window.SB={isOwner:owner,logout:function(){sess=null;try{localStorage.removeItem(SK)}catch(e){}location.reload()},
 login:async function(email,pw){var r=await fetch(URL_+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:email,password:pw})});if(!r.ok)throw new Error('bad');sess=await r.json();if(!owner()){sess=null;throw new Error('notowner')}localStorage.setItem(SK,JSON.stringify(sess));location.reload()}};
/* زر دخول المشرف */
function ui(){var b=document.createElement('button');b.type='button';b.textContent=owner()?'خروج المشرف':'دخول المشرف';
 b.style.cssText='position:fixed;bottom:10px;left:10px;z-index:99;font:12px inherit;font-family:inherit;padding:5px 11px;border-radius:14px;border:1px solid #9aa8b5;background:rgba(255,255,255,.85);color:#445;opacity:.55;cursor:pointer';
 b.onmouseenter=function(){b.style.opacity=1};b.onmouseleave=function(){b.style.opacity=.55};
 b.onclick=function(){if(owner()){SB.logout();return}
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:center;justify-content:center;direction:rtl;font-family:inherit';
  o.innerHTML='<form style="background:#fff;color:#17212B;padding:22px;border-radius:12px;width:min(340px,90vw);display:grid;gap:10px"><b style="font-size:17px">دخول المشرف</b><input name=e type=email placeholder="البريد الإلكتروني" autocapitalize=off autocomplete=email required style="padding:9px;border:1px solid #8a97a6;border-radius:8px;font:inherit;font-size:16px;direction:ltr;background:#fff;color:#17212B;-webkit-text-fill-color:#17212B;color-scheme:light"><input name=p type=password placeholder="كلمة المرور" autocomplete=current-password required style="padding:9px;border:1px solid #8a97a6;border-radius:8px;font:inherit;font-size:16px;direction:ltr;background:#fff;color:#17212B;-webkit-text-fill-color:#17212B;color-scheme:light"><div class=m style="color:#B5352A;font-size:13px;min-height:16px"></div><div style="display:flex;gap:8px"><button style="flex:1;padding:9px;border:0;border-radius:8px;background:#0F2C46;color:#fff;font:inherit">دخول</button><button type=button class=c style="padding:9px 14px;border:1px solid #ccd;border-radius:8px;background:#fff;font:inherit">إلغاء</button></div></form>';
  document.body.appendChild(o);var f=o.firstChild;f.querySelector('.c').onclick=function(){o.remove()};
  f.onsubmit=async function(ev){ev.preventDefault();var m=f.querySelector('.m');m.textContent='جارٍ الدخول…';try{await SB.login(f.e.value.trim(),f.p.value)}catch(x){m.textContent=x.message==='notowner'?'هذا الحساب ليس حساب المشرف.':'بيانات الدخول غير صحيحة.'}}};
 document.body.appendChild(b)}
if(document.body)ui();else document.addEventListener('DOMContentLoaded',ui);
})();
