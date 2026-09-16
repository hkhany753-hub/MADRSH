(function(){
  function install(){
    if(typeof window.routePage!=='function'||typeof window.DarsitaCalendarPage!=='function'||window.__calendarBridgeInstalled)return;
    const original=window.routePage;
    window.routePage=function(key){
      if(key==='calendar'){
        const dash=document.querySelector('#dashboard'),view=document.querySelector('#route-view');
        dash?.classList.remove('active-view');view?.classList.add('active-view');
        document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.route==='calendar'));
        const acts=typeof window.currentActivities==='function'?window.currentActivities():[];
        if(view)view.innerHTML=window.DarsitaCalendarPage(acts);
        const title=document.querySelector('#pageTitle');if(title)title.textContent='تقویم شمسی';
        return;
      }
      return original(key);
    };
    window.__calendarBridgeInstalled=true;
    if(location.hash==='#calendar')window.routePage('calendar');
  }
  document.addEventListener('DOMContentLoaded',install);
  setTimeout(install,50);
  setTimeout(install,300);
})();
