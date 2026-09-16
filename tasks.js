(function(){
  const KEY='darsita_tasks_v1';
  const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const $=s=>document.querySelector(s);
  let period='today';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}};
  const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const now=()=>new Date();
  const dayKey=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
  const startOfWeek=d=>{const x=new Date(d);const js=x.getDay();x.setDate(x.getDate()-(js===6?0:js+1));x.setHours(0,0,0,0);return x};
  function rangeMatch(t){const d=new Date(t.date+'T00:00:00'),n=now(),today=dayKey(n);if(period==='today')return t.date===today;if(period==='week'){const s=startOfWeek(n);const e=new Date(s);e.setDate(e.getDate()+7);return d>=s&&d<e}return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()}
  function label(){return period==='today'?'امروز':period==='week'?'این هفته':'این ماه'}
  function render(){
    if(location.hash!=='#tasks')return;
    document.querySelector('#dashboard')?.classList.remove('active-view');
    document.querySelector('#route-view')?.classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.route==='tasks'));
    const data=load().filter(rangeMatch).sort((a,b)=>Number(a.done)-Number(b.done)||String(a.date).localeCompare(String(b.date)));
    const done=data.filter(x=>x.done).length;
    $('#pageTitle').textContent='کارهای امروز';
    $('#route-view').innerHTML=`<div class="feature-shell tasks-page"><div class="section-heading"><div><span class="pill">برنامه‌ریزی</span><h1>کارهای امروز</h1><p>کارهای خودت را برای ${label()} ثبت و پیگیری کن.</p></div><div class="task-counter"><strong>${fa(done)}</strong><span>از ${fa(data.length)} انجام شده</span></div></div><div class="task-tabs"><button class="task-tab ${period==='today'?'active':''}" data-period="today">امروز</button><button class="task-tab ${period==='week'?'active':''}" data-period="week">این هفته</button><button class="task-tab ${period==='month'?'active':''}" data-period="month">این ماه</button></div><form id="taskForm" class="task-form"><input name="title" maxlength="160" required placeholder="مثلاً ۲ ساعت ریاضی و آمار بخوانم"><input name="date" type="date" value="${dayKey(now())}" required><button class="primary-btn">＋ افزودن کار</button></form><section class="task-list">${data.length?data.map(t=>`<article class="task-item ${t.done?'done':''}"><button class="task-check" data-task-done="${esc(t.id)}" aria-label="تغییر وضعیت">${t.done?'✓':''}</button><div class="task-main"><b>${esc(t.title)}</b><small>${new Date(t.date+'T00:00:00').toLocaleDateString('fa-IR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</small></div><button class="task-delete" data-task-delete="${esc(t.id)}">×</button></article>`).join(''):'<div class="empty-state compact"><b>برای ${label()} کاری ثبت نشده</b><span>کار بعدی‌ات را از بالا اضافه کن.</span></div>'}</section></div>`;
    bind();
  }
  function bind(){
    document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{period=b.dataset.period;render()});
    $('#taskForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),title=String(f.get('title')).trim(),date=String(f.get('date'));if(!title||!date)return;const tasks=load();tasks.push({id:'t_'+Date.now().toString(36),title,date,done:false,createdAt:new Date().toISOString()});save(tasks);e.target.reset();e.target.querySelector('[name=date]').value=dayKey(now());render()});
    document.querySelectorAll('[data-task-done]').forEach(b=>b.onclick=()=>{const tasks=load(),t=tasks.find(x=>x.id===b.dataset.taskDone);if(t)t.done=!t.done;save(tasks);render()});
    document.querySelectorAll('[data-task-delete]').forEach(b=>b.onclick=()=>{save(load().filter(x=>x.id!==b.dataset.taskDelete));render()});
  }
  function nav(){const n=document.querySelector('.nav');if(!n||n.querySelector('[data-route="tasks"]'))return;const a=document.createElement('a');a.className='nav-item';a.href='#tasks';a.dataset.route='tasks';a.innerHTML='<span class="nav-icon">✓</span><span>کارهای امروز</span>';const ref=n.querySelector('[data-route="calendar"]');ref?n.insertBefore(a,ref):n.appendChild(a)}
  document.addEventListener('DOMContentLoaded',()=>{nav();if(location.hash==='#tasks')render()});
  window.addEventListener('hashchange',()=>{nav();if(location.hash==='#tasks')render()});
  document.addEventListener('click',e=>{const a=e.target.closest('[data-route="tasks"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();location.hash='tasks';render()},true);
  window.routeTasks=render;
})();