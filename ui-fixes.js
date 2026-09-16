(function(){
  const $=s=>document.querySelector(s);
  function hideRemovedNav(){
    document.querySelector('.nav-item[data-route="my-plan"]')?.remove();
  }
  function activateChat(){
    if(location.hash.slice(1)!=='chat') return;
    $('#dashboard')?.classList.remove('active-view');
    $('#route-view')?.classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.route==='chat'));
    if(typeof window.refreshChat==='function') window.refreshChat();
  }
  function cleanup(){
    hideRemovedNav();
    activateChat();
  }
  document.addEventListener('click',e=>{
    const chat=e.target.closest('.nav-item[data-route="chat"]');
    if(!chat) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    location.hash='chat';
    requestAnimationFrame(activateChat);
  },true);
  window.addEventListener('hashchange',()=>setTimeout(cleanup,0));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(cleanup,0));
  window.addEventListener('darsita:auth-ready',()=>setTimeout(cleanup,0));
  const observer=new MutationObserver(hideRemovedNav);
  observer.observe(document.body,{childList:true,subtree:true});
})();
