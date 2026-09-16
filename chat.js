(function(){
  const CHAT_KEY='darsita_chat_v1';
  const $=s=>document.querySelector(s);
  let chats=load();
  let selected='general';
  function load(){try{return JSON.parse(localStorage.getItem(CHAT_KEY))||{general:[{id:1,name:'درسیتا',text:'به گفت‌وگوی درسیتا خوش آمدید 👋',time:'اکنون',mine:false}]}}catch{return {general:[]}}}
  function save(){localStorage.setItem(CHAT_KEY,JSON.stringify(chats))}
  function toast(t){const x=$('#toast');if(!x)return;x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2200)}
  function escape(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function participants(){return [
    {id:'general',name:'گفت‌وگوی عمومی',sub:'همه کاربران',avatar:'گ',online:true},
    {id:'room',name:'اتاق مطالعه',sub:'اعضای اتاق فعلی',avatar:'ا',online:true},
    {id:'help',name:'پشتیبانی درسیتا',sub:'پرسش و پاسخ',avatar:'د',online:false}
  ]}
  function render(){
    const route=$('#route-view'); if(!route)return;
    const people=participants();
    const msgs=chats[selected]||[];
    $('#pageTitle').textContent='گفت‌وگو';
    route.innerHTML=`<div class="feature-shell chat-page">
      <div class="section-heading"><div><span class="pill">💬 ارتباط</span><h1>گفت‌وگو با دیگران</h1><p>پیام‌ها را داخل سایت مدیریت کن و بعداً به اتصال زنده متصلش می‌کنیم.</p></div><span class="chat-mode">${window.APP_CONFIG?.SUPABASE_URL?'اتصال آنلاین آماده':'حالت آزمایشی'}</span></div>
      <section class="chat-shell">
        <aside class="chat-list-panel"><div class="chat-search"><input id="chatSearch" placeholder="جستجوی گفتگو..." autocomplete="off"></div><div id="chatList">${people.map(p=>`<button class="chat-contact ${selected===p.id?'selected':''}" data-chat="${p.id}"><span class="avatar">${p.avatar}</span><span class="chat-contact-main"><b>${p.name}</b><small>${p.sub}</small></span><span class="contact-dot ${p.online?'online':''}"></span></button>`).join('')}</div></aside>
        <section class="chat-main"><header class="chat-header"><div><div class="chat-title-row"><span class="avatar">${people.find(p=>p.id===selected)?.avatar||'گ'}</span><div><b>${people.find(p=>p.id===selected)?.name||'گفت‌وگو'}</b><small>${people.find(p=>p.id===selected)?.sub||''}</small></div></div></div><span class="chat-status"><i></i> آماده گفتگو</span></header>
        <div id="messageList" class="message-list">${msgs.map(m=>`<div class="bubble-row ${m.mine?'mine':''}"><div class="bubble"><p>${escape(m.text)}</p><small>${escape(m.time)}</small></div></div>`).join('')||'<div class="chat-empty"><span>💬</span><b>هنوز پیامی نیست</b><small>اولین پیام را بفرست.</small></div>'}</div>
        <form id="chatForm" class="chat-compose"><input id="chatInput" maxlength="500" placeholder="پیام خود را بنویس..." autocomplete="off"><button class="primary-btn" type="submit">ارسال ↗</button></form>
        </section>
      </section>
    </div>`;
    bind();
    const list=$('#messageList'); if(list)list.scrollTop=list.scrollHeight;
  }
  function bind(){
    document.querySelectorAll('[data-chat]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.chat;render()}));
    $('#chatForm')?.addEventListener('submit',e=>{e.preventDefault();const input=$('#chatInput');const text=input?.value.trim();if(!text)return;const now=new Date();const time=now.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});(chats[selected]||(chats[selected]=[])).push({id:Date.now(),text,time,mine:true});save();input.value='';render();toast('پیام ثبت شد');});
    $('#chatSearch')?.addEventListener('input',e=>{const q=e.target.value.trim();document.querySelectorAll('.chat-contact').forEach(b=>{b.hidden=q && !b.textContent.includes(q)});});
  }
  function activate(){
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.route==='chat'));
    render();
  }
  function maybeActivate(){if(location.hash.slice(1)==='chat')activate()}
  window.addEventListener('hashchange',maybeActivate);
  document.addEventListener('click',e=>{const link=e.target.closest('.nav-item[data-route="chat"]');if(link){e.preventDefault();e.stopImmediatePropagation();location.hash='chat';activate();}},true);
  document.addEventListener('DOMContentLoaded',maybeActivate);
})();
