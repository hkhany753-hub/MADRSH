(function(){
  const c=()=>window.DarsitaOnline?.client,s=()=>window.DarsitaOnline?.session;
  const online=()=>Boolean(c()&&s());
  const $=x=>document.querySelector(x),esc=x=>String(x??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  let channel=null,selected='general',drawSeq=0;
  const people=[{id:'general',name:'گفت‌وگوی عمومی',sub:'همه کاربران',avatar:'گ'},{id:'room',name:'اتاق مطالعه',sub:'اعضای اتاق فعلی',avatar:'ا'},{id:'help',name:'پشتیبانی درسیتا',sub:'پرسش و پاسخ',avatar:'د'}];
  function toast(t){const x=$('#toast');if(!x)return;x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2200)}
  async function messages(){const q=c().from('messages').select('id,sender_id,conversation_id,body,created_at,profiles(name)').eq('conversation_id',selected).order('created_at',{ascending:true}).limit(200);const r=await q;if(r.error){console.error(r.error);return []}return r.data||[]}
  async function draw(){
    if(!online()||location.hash!=='#chat')return;
    const route=$('#route-view');if(!route)return;
    const oldInput=$('#onlineChatInput');
    const draft=oldInput?.value||'';
    const wasFocused=document.activeElement===oldInput;
    const seq=++drawSeq;
    const p=people.find(x=>x.id===selected)||people[0],data=await messages();
    if(seq!==drawSeq)return;
    route.innerHTML='<div class="feature-shell chat-page"><div class="section-heading"><div><span class="pill">💬 ارتباط زنده</span><h1>گفت‌وگو</h1><p>پیام‌ها بین کاربران متصل به حساب به‌صورت آنلاین همگام می‌شوند.</p></div><span class="chat-mode">Realtime</span></div><section class="chat-shell"><aside class="chat-list-panel"><div class="chat-search"><input id="chatSearchOnline" placeholder="جستجوی گفتگو..."></div><div>'+people.map(x=>'<button class="chat-contact '+(x.id===selected?'selected':'')+'" data-online-chat="'+x.id+'"><span class="avatar">'+x.avatar+'</span><span class="chat-contact-main"><b>'+x.name+'</b><small>'+x.sub+'</small></span><span class="contact-dot online"></span></button>').join('')+'</div></aside><section class="chat-main"><header class="chat-header"><div class="chat-title-row"><span class="avatar">'+p.avatar+'</span><div><b>'+p.name+'</b><small>'+p.sub+'</small></div></div><span class="chat-status"><i></i>زنده</span></header><div id="onlineMessageList" class="message-list">'+(data.length?data.map(m=>'<div class="bubble-row '+(m.sender_id===s().user.id?'mine':'')+'"><div class="bubble">'+(m.sender_id!==s().user.id?'<strong>'+esc(m.profiles?.name||'کاربر')+'</strong>':'')+'<p>'+esc(m.body)+'</p><small>'+new Date(m.created_at).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})+'</small></div></div>').join(''):'<div class="chat-empty"><span>💬</span><b>هنوز پیامی نیست</b><small>اولین پیام را بفرست.</small></div>')+'</div><form id="onlineChatForm" class="chat-compose"><input id="onlineChatInput" maxlength="1000" required placeholder="پیام خود را بنویس..." autocomplete="off"><button class="primary-btn">ارسال ↗</button></form></section></section></div>';
    const input=$('#onlineChatInput');if(input&&draft){input.value=draft;if(wasFocused)input.focus()}
    document.querySelectorAll('[data-online-chat]').forEach(b=>b.onclick=()=>{selected=b.dataset.onlineChat;draw()});
    $('#onlineChatForm').onsubmit=async e=>{e.preventDefault();const field=$('#onlineChatInput'),body=field?.value.trim();if(!body)return;const r=await c().from('messages').insert({sender_id:s().user.id,conversation_id:selected,body});if(r.error){toast('ارسال پیام ناموفق بود');return}await draw()};
    const ml=$('#onlineMessageList');if(ml)ml.scrollTop=ml.scrollHeight;
    subscribe();
  }
  function subscribe(){if(!online())return;if(channel)c().removeChannel(channel);channel=c().channel('darsita-realtime-'+selected).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'conversation_id=eq.'+selected},()=>{if(document.activeElement?.id!=='onlineChatInput')draw()}).subscribe()}
  document.addEventListener('click',e=>{const a=e.target.closest('.nav-item[data-route="chat"]');if(!a||!online())return;e.preventDefault();e.stopImmediatePropagation();location.hash='chat';selected='general';draw()},true);
  window.addEventListener('hashchange',()=>{if(location.hash==='#chat'&&online())draw()});
  window.addEventListener('beforeunload',()=>{if(channel)c().removeChannel(channel)});
  window.refreshChat=()=>draw();
})();
