/* شريط أعلى الصفحة: عرض جوال/كمبيوتر + داكن/نهاري + الدخول، ونافذة تسجيل الدخول */
(function(){
if(window.SHBar)return;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}
var PHONE=Math.min(screen.width,screen.height)<700;
function theme(){return document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}
function setTheme(t){document.documentElement.setAttribute('data-theme',t);ls('sh_theme',t);try{var f=document.getElementById('f')||document.getElementById('shframe');if(f&&f.contentDocument)f.contentDocument.documentElement.setAttribute('data-theme',t)}catch(e){}}
if(ls('sh_theme'))document.documentElement.setAttribute('data-theme',ls('sh_theme'));
var IC={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',phone:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',desk:'<rect x="2.5" y="4" width="19" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',chev:'<path d="M7 9l5-4 5 4M7 15l5 4 5-4"/>'};
function svg(n,s){s=s||21;return '<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>'}
function pal(){var d=theme()==='dark';return d?{card:'#16212B',ink:'#E6EDF3',lab:'#9CC5E6',sub:'#9AA8B5',line:'#27384A',inp:'#0E151C',act:'#243a57',actInk:'#fff',idle:'#9AA8B5',teal:'#5FB4BC',tealLine:'#2f6f78',btn:'#243a57',btnInk:'#fff',tile:'#243a57',tileInk:'#F0CF6A',bad:'#F08A7E',bar:'#16212B'}:{card:'#FFFFFF',ink:'#17212B',lab:'#0F2C46',sub:'#5E6B78',line:'#CBD5DF',inp:'#F6F8FA',act:'#0F2C46',actInk:'#fff',idle:'#5E6B78',teal:'#14808A',tealLine:'#7FBFC5',btn:'#0F2C46',btnInk:'#fff',tile:'#E4EDF5',tileInk:'#9A6200',bad:'#B5352A',bar:'#FFFFFF'}}
function el(t,css,html){var e=document.createElement(t);if(css)e.style.cssText=css;if(html!=null)e.innerHTML=html;return e}
/* مجموعة أزرار مقسّمة: items=[{icon,title,on,fn}] */
function seg(items){var P=pal();var w=el('div','display:inline-flex;border:2px solid '+P.line+';border-radius:22px;overflow:hidden;background:'+P.bar);
 items.forEach(function(it){var b=el('button','width:58px;height:38px;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;background:'+(it.on?P.act:'transparent')+';color:'+(it.on?P.actInk:P.idle),svg(it.icon));b.type='button';b.title=it.title;b.setAttribute('aria-label',it.title);b.setAttribute('aria-pressed',it.on?'true':'false');b.onclick=it.fn;w.appendChild(b)});return w}
/* opts: framed, state()->{logged,label}, login(), logout(), toDesktop(), toMobile() */
function mount(opts){
 var bar=el('div','max-width:1040px;margin:0 auto;padding:10px 0 2px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:flex-start;direction:ltr;font-family:inherit');bar.id='shbar';
 var st=document.createElement('style');st.textContent='@media print{#shbar{display:none!important}}';document.head.appendChild(st);
 function paint(){var P=pal(),dk=theme()==='dark',VIEW=ls('sh_view')||'';bar.replaceChildren();
  var mob=opts.framed?true:(PHONE?VIEW!=='d':VIEW==='m'?true:false);
  var phoneOn=opts.framed?true:(PHONE?VIEW!=='d':VIEW==='m');
  bar.appendChild(seg([{icon:'desk',title:'عرض الكمبيوتر',on:!phoneOn,fn:function(){if(!phoneOn)return;opts.toDesktop()}},{icon:'phone',title:'عرض الجوال',on:phoneOn,fn:function(){if(phoneOn)return;opts.toMobile()}}]));
  bar.appendChild(seg([{icon:'moon',title:'الوضع الداكن',on:dk,fn:function(){setTheme('dark');paint()}},{icon:'sun',title:'الوضع النهاري',on:!dk,fn:function(){setTheme('light');paint()}}]));
  var s=opts.state();var lb=el('button','height:42px;padding:0 16px;border-radius:22px;border:2px solid '+P.tealLine+';background:'+P.bar+';color:'+P.teal+';cursor:pointer;display:inline-flex;align-items:center;gap:9px;font:600 15px inherit;font-family:inherit;direction:rtl',(s.logged?svg('out'):svg('user'))+'<span>'+s.label+'</span>');lb.type='button';lb.title=s.logged?'اضغط لتسجيل الخروج':'تسجيل الدخول';lb.onclick=function(){s.logged?opts.logout():opts.login()};bar.appendChild(lb)}
 paint();return{el:bar,paint:paint}}
/* نافذة الدخول: opts {title,subtitle,centers:[names],onSubmit(sel,user,pw,remember)->Promise} */
function loginDialog(o){var P=pal();
 var ov=el('div','position:fixed;inset:0;background:rgba(3,8,14,.62);z-index:300;display:flex;align-items:center;justify-content:center;direction:rtl;font-family:inherit;padding:16px');
 var f=el('form','background:'+P.card+';color:'+P.ink+';border:1px solid '+P.line+';padding:26px;border-radius:22px;width:min(440px,100%);display:grid;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,.5)');
 var inp='width:100%;box-sizing:border-box;height:50px;padding:0 14px;border:2px solid '+P.line+';border-radius:14px;background:'+P.inp+';color:'+P.ink+';-webkit-text-fill-color:'+P.ink+';font:inherit;font-size:16px;outline:none';
 var lab='font-weight:600;color:'+P.lab+';font-size:14px;margin-top:4px';
 f.innerHTML='<div style="display:flex;gap:14px;align-items:center;padding-bottom:14px;border-bottom:1px solid '+P.line+'"><div style="width:52px;height:52px;border-radius:14px;background:'+P.tile+';color:'+P.tileInk+';display:flex;align-items:center;justify-content:center;flex:none">'+svg('user',26)+'</div><div><div style="font-size:22px;font-weight:700;color:'+P.lab+'">'+o.title+'</div><div style="font-size:13.5px;color:'+P.sub+'">'+o.subtitle+'</div></div></div>'
 +'<label style="'+lab+'">الحساب</label><div style="position:relative"><select name=c style="'+inp+';appearance:none;-webkit-appearance:none;padding-left:40px"><option value="">اختر مركزك…</option>'+o.centers.map(function(n,i){return '<option value="c'+(i<9?'0':'')+(i+1)+'">منسق '+n+'</option>'}).join('')+'<option value="sup">مشرف القطاع</option></select><span style="position:absolute;left:12px;top:14px;color:'+P.sub+';pointer-events:none">'+svg('chev',20)+'</span></div>'
 +'<div class=u hidden style="display:grid;gap:12px"><label style="'+lab+'">اسم المستخدم</label><input name=e type=text autocapitalize=off autocomplete=username style="'+inp+';direction:ltr;text-align:left"></div>'
 +'<label style="'+lab+'">كلمة المرور</label><div style="position:relative"><input name=p type=password autocomplete=current-password required style="'+inp+';direction:ltr;text-align:left;padding-right:46px"><button type=button class=eye aria-label="إظهار كلمة المرور" style="position:absolute;right:12px;top:13px;border:0;background:transparent;color:'+P.sub+';cursor:pointer;padding:0">'+svg('eye',22)+'</button></div>'
 +'<label style="display:flex;gap:10px;align-items:center;color:'+P.sub+';font-size:14px;margin-top:2px"><input type=checkbox name=r checked style="width:20px;height:20px;accent-color:'+P.teal+'"> حفظ الدخول على هذا الجهاز (لا تفعّله في جهاز مشترك)</label>'
 +'<div class=m style="color:'+P.bad+';font-size:13.5px;min-height:18px"></div>'
 +'<div style="display:flex;gap:10px"><button class=go style="flex:1;height:50px;border:0;border-radius:14px;background:'+P.btn+';color:'+P.btnInk+';font:700 17px inherit;font-family:inherit;cursor:pointer">دخول</button><button type=button class=cx style="height:50px;padding:0 22px;border:2px solid '+P.line+';border-radius:14px;background:transparent;color:'+P.ink+';font:600 16px inherit;font-family:inherit;cursor:pointer">إلغاء</button></div>';
 ov.appendChild(f);document.body.appendChild(ov);
 var u=f.querySelector('.u'),m=f.querySelector('.m');u.hidden=true;u.style.display='none';
 f.c.onchange=function(){var s=f.c.value==='sup';u.hidden=!s;u.style.display=s?'grid':'none';f.e.required=s;if(s)f.e.focus();else f.p.focus()};
 f.querySelector('.eye').onclick=function(){var t=f.p.type==='password';f.p.type=t?'text':'password';this.innerHTML=svg(t?'eyeoff':'eye',22)};
 f.querySelector('.cx').onclick=function(){ov.remove()};ov.onclick=function(e){if(e.target===ov)ov.remove()};
 f.onsubmit=function(ev){ev.preventDefault();if(!f.c.value){m.textContent='اختر مركزك أو «مشرف القطاع».';return}m.textContent='جارٍ الدخول…';o.onSubmit(f.c.value,f.e.value,f.p.value,f.r.checked).catch(function(x){m.textContent=x&&x.message==='notowner'?'هذا الحساب غير مخوّل.':'بيانات الدخول غير صحيحة.'})};
 setTimeout(function(){f.c.focus()},50)}
window.SHBar={PHONE:PHONE,theme:theme,setTheme:setTheme,ls:ls,mount:mount,loginDialog:loginDialog};
})();
