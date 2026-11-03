/* محوّل Supabase: يوفّر نفس واجهة claude.use('db'|'user'|'downloads') لتعمل المنصتان خارج Claude */
(function(){
var URL_='https://rzrwbrgebcylixjciega.supabase.co',KEY='__ANON__',SK='sh_sb_session';
var sess=null,REM=true;try{sess=JSON.parse(localStorage.getItem(SK)||'null');if(!sess){sess=JSON.parse(sessionStorage.getItem(SK)||'null');if(sess)REM=false}}catch(e){}
function keep(){try{var a=REM?localStorage:sessionStorage,b=REM?sessionStorage:localStorage;a.setItem(SK,JSON.stringify(sess));b.removeItem(SK)}catch(e){}}
function drop(){try{localStorage.removeItem(SK);sessionStorage.removeItem(SK)}catch(e){}}
function jwt(t){try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch(e){return {}}}
function owner(){return !!(sess&&sess.access_token&&jwt(sess.access_token).app_metadata&&jwt(sess.access_token).app_metadata.role==='owner'&&jwt(sess.access_token).exp*1000>Date.now()-60000)}
function meta(){return (sess&&sess.access_token&&jwt(sess.access_token).exp*1000>Date.now()-60000&&jwt(sess.access_token).app_metadata)||{}}
function coord(){var m=meta();return m.role==='coordinator'&&/^c\d\d$/.test(m.center||'')}
function cen(){return coord()?meta().center:''}
var CN=['بيش','بيش الجنوبي','الحقو','القوام','قايم الدش','العالية','السلامه العليا','العشة','المحلة','مسلية','المطعن','قرية بيش','الفطيحة','الخلاوية','الريث','مقزع','القهر','عمود','الجبل الأسود','السادة','الدرب','أبو السداد','الشقيق','منشبة','عتود'];
async function refresh(){if(!sess||!sess.refresh_token)return;try{var r=await fetch(URL_+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:sess.refresh_token})});if(r.ok){sess=await r.json();keep()}else{sess=null;drop()}}catch(e){}}
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
window.SB={isOwner:owner,isCoord:coord,center:cen,logout:function(){sess=null;drop();location.reload()},
 login:async function(email,pw,remember){var r=await fetch(URL_+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:email,password:pw})});if(!r.ok)throw new Error('bad');sess=await r.json();if(!owner()&&!coord()){sess=null;throw new Error('notowner')}REM=remember!==false;keep();location.reload()}};
/* ===== شريط الأعلى (مظهر + عرض + دخول) ===== */
var FRAMED=false;try{FRAMED=window.top!==window.self}catch(e){FRAMED=true}
var H=window.SHBar,VIEW=H.ls('sh_view')||'';
if(H.PHONE&&VIEW==='d'){var mv=document.querySelector('meta[name=viewport]');if(mv)mv.setAttribute('content','width=1100')}
if(!H.PHONE&&!FRAMED&&VIEW==='m'){location.replace('/frame.html?u='+encodeURIComponent(location.pathname))}
window.SBopenLogin=function(){H.loginDialog({title:'تسجيل الدخول',subtitle:document.title||'الصحة المدرسية - القطاع الشمالي',centers:CN,
 onSubmit:function(sel,user,pw,rem){var se=(user||'').trim().toLowerCase();return SB.login(sel==='sup'?(se.indexOf('@')>0?se:se+'@admin.sh-north.example'):sel+'@sh-north.example',pw,rem)}})};
function ui(){
 if(FRAMED)return;
 var bar=H.mount({framed:false,
  state:function(){var o=owner(),c=coord();return{logged:o||c,label:o?'المشرف':c?'منسق '+CN[+cen().slice(1)-1]:'تسجيل الدخول'}},
  login:function(){window.SBopenLogin()},logout:function(){SB.logout()},
  toDesktop:function(){H.ls('sh_view',H.PHONE?'d':null);location.reload()},toMobile:function(){H.ls('sh_view',H.PHONE?null:'m');location.reload()}});
 document.body.insertBefore(bar.el,document.body.firstChild)}
if(document.body)ui();else document.addEventListener('DOMContentLoaded',ui);
})();
