(function(){
  const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const client=()=>window.DarsitaOnline?.client,session=()=>window.DarsitaOnline?.session;
  let isAdmin=false,onlineUsers=[],onlineActivities=[],onlineRooms=[],reports=[];
  const localData=()=>{try{return JSON.parse(localStorage.getItem('darsita_app_v4'))||{users:[],activities:[],rooms:[]}}catch{return {users:[],activities:[],rooms:[]}}};
  const toast=t=>{const x=$('#toast');if(!x)return;x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2600)};

  async function loadAdmin(){
    const c=client(),s=session();
    if(!c||!s){isAdmin=false;return false}
    const {data:user,error:userErr}=await c.from('profiles').select('id,name,email,created_at,role').eq('id',s.user.id).maybeSingle();
    if(userErr||!user||user.role!=='admin'){isAdmin=false;return false}
    isAdmin=true;
    const [{data:users},{data:acts},{data:rooms},{data:rps}]=await Promise.all([
      c.from('profiles').select('id,name,email,created_at,role').order('created_at',{ascending:false}).limit(1000),
      c.from('activities').select('*').order('created_at',{ascending:false}).limit(5000),
      c.from('rooms').select('*').order('created_at',{ascending:false}).limit(500),
      c.from('reports').select('*').order('created_at',{ascending:false}).limit(500)
    ]);
    onlineUsers=users||[];onlineActivities=acts||[];onlineRooms=rooms||[];reports=rps||[];return true;
  }
  function ensureNav(){
    const nav=$('.nav');if(!nav||!isAdmin)return;
    if($('[data-route="admin"]'))return;
    const a=document.createElement('a');a.className='nav-item admin-nav';a.href='#admin';a.dataset.route='admin';a.innerHTML='<span class="nav-icon">⚡</span><span>مدیریت سایت</span>';nav.appendChild(a);
  }
  function users(){return onlineUsers.length?onlineUsers:localData().users||[]}
  function activities(){return onlineActivities.length?onlineActivities:localData().activities||[]}
  function rooms(){return onlineRooms.length?onlineRooms:localData().rooms||[]}
  function page(){
    if(!isAdmin)return `<div class="feature-shell"><div class="feature-hero"><div class="feature-title"><div class="feature-icon">🔒</div><div><h1>دسترسی مدیر</h1><p>برای ورود به این بخش باید حساب شما در دیتابیس نقش admin داشته باشد.</p></div></div></div></div>`;
    const us=users(),acts=activities(),rs=rooms(),minutes=acts.reduce((s,a)=>s+Number(a.minutes||0),0),tests=acts.reduce((s,a)=>s+Number(a.tests||0),0),today=new Date().toISOString().slice(0,10),todayUsers=us.filter(u=>String(u.created_at||u.createdAt||'').slice(0,10)===today).length;
    return `<div class="feature-shell admin-page"><div class="section-heading"><div><span class="pill">مدیریت سایت</span><h1>مرکز مدیریت درسیتا</h1><p>مدیریت سروری کاربران و داده‌های سیستم</p></div><span class="admin-badge">ADMIN</span></div>
      <section class="admin-stats"><article class="big-stat"><small>کل کاربران</small><strong>${fa(us.length)}</strong><span>پروفایل آنلاین</span></article><article class="big-stat"><small>ثبت‌نام امروز</small><strong>${fa(todayUsers)}</strong><span>حساب جدید</span></article><article class="big-stat"><small>کل ساعت مطالعه</small><strong>${fa((minutes/60).toFixed(1))}</strong><span>از دیتابیس</span></article><article class="big-stat"><small>کل تست‌ها</small><strong>${fa(tests)}</strong><span>ثبت شده</span></article><article class="big-stat"><small>اتاق‌ها</small><strong>${fa(rs.length)}</strong><span>فعال/ثبت شده</span></article><article class="big-stat"><small>گزارش‌های باز</small><strong>${fa(reports.filter(r=>r.status==='open').length)}</strong><span>نیازمند بررسی</span></article></section>
      <div class="admin-grid"><section class="panel"><div class="panel-title"><div><h2>کاربران</h2><p>اطلاعات از Supabase خوانده می‌شود</p></div><button class="small-btn" id="adminRefresh">بازخوانی</button></div><div class="admin-toolbar"><input id="adminUserSearch" placeholder="جستجوی نام یا ایمیل..."></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>کاربر</th><th>ایمیل</th><th>ثبت‌نام</th><th>نقش</th><th>عملیات</th></tr></thead><tbody>${us.length?us.map(u=>`<tr data-user-row="${esc(u.id)}"><td><div class="user-cell"><span class="avatar">${esc((u.name||'م').slice(0,1))}</span><b>${esc(u.name||'بدون نام')}</b></div></td><td>${esc(u.email||'—')}</td><td>${esc(String(u.created_at||u.createdAt||'').slice(0,10)||'—')}</td><td><span class="role-chip">${esc(u.role||'user')}</span></td><td><button class="small-btn" data-user-detail="${esc(u.id)}">جزئیات</button></td></tr>`).join(''):'<tr><td colspan="5"><div class="empty-state compact"><b>کاربری پیدا نشد</b></div></td></tr>'}</tbody></table></div></section>
      <section class="panel"><div class="panel-title"><div><h2>مدیریت</h2><p>عملیات واقعی روی دیتابیس</p></div></div><div class="admin-actions"><button data-admin="announce">📣 اطلاعیه</button><button data-admin="report">🛡️ گزارش‌ها</button><button data-admin="rooms">🏠 اتاق‌ها</button><button data-admin="logs">📋 لاگ‌ها</button><button data-admin="analytics">📊 تحلیل</button><button data-admin="roles">👥 نقش‌ها</button></div></section></div>
      <section class="panel"><div class="panel-title"><div><h2>امنیت</h2><p>دسترسی مدیر از role=admin در جدول profiles کنترل می‌شود.</p></div></div><div class="permission-grid"><div><b>کاربران</b><span>مشاهده و تغییر نقش با RLS</span></div><div><b>گزارش‌ها</b><span>مشاهده و تعیین وضعیت</span></div><div><b>اطلاعیه</b><span>ایجاد، ویرایش و انتشار</span></div><div><b>لاگ</b><span>ثبت رویدادهای مدیریتی</span></div><div><b>رمز عبور</b><span>در اختیار مدیر قرار نمی‌گیرد</span></div><div><b>نقش‌ها</b><span>فقط مدیر احراز‌شده</span></div></div></section></div>`;
  }
  function show(html){const m=$('#modal'),c=$('#modalCard');if(!m||!c)return;c.innerHTML=html;m.classList.remove('hidden');}
  function close(){ $('#modal')?.classList.add('hidden') }
  async function detail(id){
    const u=users().find(x=>x.id===id);if(!u)return;
    const as=activities().filter(a=>a.user_id===id||a.userId===id),mins=as.reduce((s,a)=>s+Number(a.minutes||0),0);
    show(`<div class="modal-brand">⚡</div><h2>${esc(u.name||'کاربر')}</h2><p class="modal-note">جزئیات حساب مدیریتی</p><div class="room-members"><span>ایمیل</span><b>${esc(u.email||'—')}</b></div><div class="room-members"><span>ثبت‌نام</span><b>${esc(String(u.created_at||'').slice(0,10)||'—')}</b></div><div class="room-members"><span>سابقه مطالعه</span><b>${fa(Math.floor(mins/60))} ساعت و ${fa(mins%60)} دقیقه</b></div><label>نقش<select id="adminRole"><option value="user">کاربر</option><option value="support">پشتیبان</option><option value="moderator">ناظر</option><option value="admin">مدیر</option></select></label><button class="primary-btn full" id="saveRole">ذخیره نقش</button><button class="text-btn full" data-close-modal>بستن</button>`);
    $('#adminRole').value=u.role||'user';
    $('#saveRole')?.addEventListener('click',async()=>{const role=$('#adminRole').value,c=client();const {error}=await c.from('profiles').update({role}).eq('id',id);if(error){toast('تغییر نقش رد شد');return}toast('نقش ذخیره شد');close();render()});
  }
  async function action(kind){
    if(kind==='announce')return show(`<h2>انتشار اطلاعیه</h2><form id="announceForm" class="form-grid"><label>عنوان<input id="anTitle" maxlength="150" required></label><label>متن<textarea id="anBody" maxlength="3000" required></textarea></label><div class="form-actions"><button class="primary-btn">انتشار</button></div></form>`);
    if(kind==='report')return show(`<h2>گزارش‌ها</h2><div class="admin-report-list">${reports.length?reports.map(r=>`<div class="room-members"><span>${esc(r.category)}</span><b>${esc(r.status)} · ${esc(r.details)}</b><button class="small-btn" data-report="${r.id}">بستن</button></div>`).join(''):'<div class="empty-state compact"><b>گزارشی نیست</b></div>'}</div><button class="text-btn full" data-close-modal>بستن</button>`);
    if(kind==='rooms')return show(`<h2>اتاق‌ها</h2>${rooms().map(r=>`<div class="room-members"><span>${esc(r.name)}</span><b>${esc(r.subject)} · ظرفیت ${fa(r.capacity)}</b></div>`).join('')}<button class="text-btn full" data-close-modal>بستن</button>`);
    if(kind==='analytics')return show(`<h2>تحلیل سیستم</h2><div class="room-members"><span>کاربران</span><b>${fa(users().length)}</b></div><div class="room-members"><span>فعالیت</span><b>${fa(activities().length)}</b></div><div class="room-members"><span>اتاق</span><b>${fa(rooms().length)}</b></div><div class="room-members"><span>گزارش باز</span><b>${fa(reports.filter(r=>r.status==='open').length)}</b></div><button class="text-btn full" data-close-modal>بستن</button>`);
    if(kind==='roles')return show(`<h2>نقش‌ها</h2><div class="permission-grid"><div><b>admin</b><span>کنترل کامل مدیریتی</span></div><div><b>moderator</b><span>نظارت و گزارش</span></div><div><b>support</b><span>پشتیبانی</span></div><div><b>user</b><span>کاربر عادی</span></div></div><button class="text-btn full" data-close-modal>بستن</button>`);
    if(kind==='logs')return show(`<h2>لاگ مدیریتی</h2><p class="modal-note">لاگ‌ها فقط بعد از اجرای migration امنیتی در دیتابیس قابل مشاهده هستند.</p><button class="text-btn full" data-close-modal>بستن</button>`);
  }
  function bind(){
    $('#adminRefresh')?.addEventListener('click',render);
    $('#adminUserSearch')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('[data-user-row]').forEach(x=>x.hidden=!!q&&!x.textContent.toLowerCase().includes(q))});
    $$('[data-user-detail]').forEach(b=>b.addEventListener('click',()=>detail(b.dataset.userDetail)));
    $$('[data-admin]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.admin)));
    $$('[data-close-modal]').forEach(b=>b.addEventListener('click',close));
    $('#announceForm')?.addEventListener('submit',async e=>{e.preventDefault();const c=client(),s=session();const {error}=await c.from('announcements').insert({author_id:s.user.id,title:$('#anTitle').value.trim(),body:$('#anBody').value.trim(),published:true});if(error){toast('انتشار ناموفق بود');return}toast('اطلاعیه منتشر شد');close();});
    $$('[data-report]').forEach(b=>b.addEventListener('click',async()=>{const {error}=await client().from('reports').update({status:'resolved',resolved_at:new Date().toISOString()}).eq('id',b.dataset.report);if(!error){toast('گزارش بسته شد');close();await render()}}));
  }
  async function render(){
    if(location.hash.slice(1)!=='admin')return;
    await loadAdmin();if(isAdmin)ensureNav();
    $('#dashboard')?.classList.remove('active-view');const v=$('#route-view');if(!v)return;v.classList.add('active-view');$('#pageTitle').textContent='مدیریت سایت';v.innerHTML=page();bind();
  }
  document.addEventListener('click',e=>{const a=e.target.closest('.nav-item[data-route="admin"]');if(a){e.preventDefault();e.stopImmediatePropagation();if(isAdmin){location.hash='admin';render()}else toast('این بخش فقط برای مدیر است')}},true);
  window.addEventListener('hashchange',()=>{if(location.hash==='#admin')render()});
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{loadAdmin().then(()=>{if(isAdmin)ensureNav();if(location.hash==='#admin')render()})},350)});
  window.addEventListener('darsita:auth-ready',()=>loadAdmin().then(()=>{if(isAdmin)ensureNav()}));
})();
