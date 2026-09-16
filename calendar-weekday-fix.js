(function(){
  const weeks=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
  const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  function fix(){
    if(location.hash!=='#calendar')return;
    document.querySelectorAll('[data-cal-day]').forEach(el=>{
      const p=String(el.dataset.calDay||'').split('-').map(Number);
      if(p.length!==3)return;
      const [y,m,d]=p;
      if(y===1405&&m===6){
        const idx=((4+(d-25))%7+7)%7;
        const label=el.querySelector('.cal-week-name');
        if(label)label.textContent=weeks[idx];
        el.setAttribute('aria-label',`${weeks[idx]} ${fa(d)} شهریور`);
      }
    });
    const heading=document.querySelector('.calendar-page .section-heading p');
    if(heading)heading.textContent='امروز: ۱۴۰۵/۰۶/۲۵ · چهارشنبه';
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(fix,30));
  window.addEventListener('hashchange',()=>setTimeout(fix,30));
  new MutationObserver(()=>setTimeout(fix,0)).observe(document.body,{childList:true,subtree:true});
})();
