(function(){
  const monthNames=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  const weekNames=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
  const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  const pad=n=>String(n).padStart(2,'0');
  function div(a,b){return Math.floor(a/b)}
  function mod(a,b){return a-Math.floor(a/b)*b}
  function gregorianToJalali(gy,gm,gd){
    const gdm=[31,28,31,30,31,30,31,31,30,31,30,31];
    let gy2=gm>2?gy+1:gy;
    let days=355666+365*gy+div(gy2+3,4)-div(gy2+99,100)+div(gy2+399,400)+gd;
    for(let i=0;i<gm-1;i++)days+=gdm[i];
    if(gm>2 && ((gy%4===0&&gy%100!==0)||gy%400===0))days++;
    let jy=-1595+33*div(days-12053,12053); days=mod(days-12053,12053);
    jy+=4*div(days,1461); days=mod(days,1461);
    if(days>365){jy+=div(days-1,365);days=mod(days-1,365)}
    let jm=days<186?1+div(days,31):7+div(days-186,30);
    let jd=1+mod(days,jm<7?31:30);
    return [jy,jm,jd];
  }
  function jalaliToGregorian(jy,jm,jd){
    jy+=1595; let days=-355668+365*jy+div(jy/33,1)*8+div(mod(jy,33)+3,4)+jd+(jm<7?(jm-1)*31:((jm-7)*30)+186);
    let gy=400*div(days,146097); days=mod(days,146097);
    if(days>36524){gy+=100*div(--days,36524);days=mod(days,36524);if(days>=365)days++}
    gy+=4*div(days,1461);days=mod(days,1461);
    if(days>365){gy+=div(days-1,365);days=mod(days-1,365)}
    let gd=days+1,gdm=[31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31],gm=0;
    while(gd>gdm[gm]){gd-=gdm[gm];gm++} return [gy,gm+1,gd];
  }
  function jDaysInMonth(y,m){return m<=6?31:m<=11?30:(((y%33)%4)<=0?30:29)}
  function nowJ(){return gregorianToJalali(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate())}
  function dateKey(jy,jm,jd){const [gy,gm,gd]=jalaliToGregorian(jy,jm,jd);return `${gy}-${pad(gm)}-${pad(gd)}`}
  function render(){
    const host=document.querySelector('#route-view'); if(!host||location.hash!=='#calendar')return;
    const current=window.__darsitaCal||nowJ(); let [jy,jm]=current;
    const first=dateKey(jy,jm,1), [gy,gm,gd]=jalaliToGregorian(jy,jm,1);
    const firstDow=(new Date(gy,gm-1,gd).getDay()+1)%7;
    const count=jDaysInMonth(jy,jm);
    const today=nowJ(), act=(typeof currentActivities==='function'?currentActivities():[]);
    const days=[]; for(let i=0;i<firstDow;i++)days.push('<div class="jcal-cell empty"></div>');
    for(let d=1;d<=count;d++){
      const key=dateKey(jy,jm,d); const has=act.some(a=>a.date===key); const isToday=today[0]===jy&&today[1]===jm&&today[2]===d;
      const label=weekNames[((firstDow+d-1)%7)];
      const mins=act.filter(a=>a.date===key).reduce((s,a)=>s+Number(a.minutes||0),0);
      days.push(`<button type="button" class="jcal-cell ${isToday?'today':''} ${has?'has-activity':''}" data-jcal-date="${key}"><span class="jcal-week">${label}</span><strong>${fa(d)}</strong><small>${mins?fa(mins)+' دقیقه':'بدون فعالیت'}</small></button>`);
    }
    host.innerHTML=`<div class="feature-shell jcal-page"><div class="section-heading"><div><span class="pill">تقویم شمسی</span><h1>${monthNames[jm-1]} ${fa(jy)}</h1><p>امروز: ${fa(today[0])}/${fa(pad(today[1]))}/${fa(pad(today[2]))}</p></div><div class="jcal-controls"><button class="small-btn" data-jcal="prev">ماه قبل</button><button class="small-btn" data-jcal="today">امروز</button><button class="small-btn" data-jcal="next">ماه بعد</button></div></div><section class="jcal-wrap"><div class="jcal-head">${weekNames.map(x=>`<div>${x}</div>`).join('')}</div><div class="jcal-grid">${days.join('')}</div></section><div id="jcalDetail" class="panel jcal-detail"><h2>جزئیات روز</h2><p>روی یکی از مربع‌ها کلیک کن.</p></div></div>`;
    host.querySelectorAll('[data-jcal]').forEach(b=>b.onclick=()=>{const k=b.dataset.jcal;if(k==='today'){const t=nowJ();window.__darsitaCal=[t[0],t[1]]}else if(k==='prev'){jm--;if(jm<1){jm=12;jy--}window.__darsitaCal=[jy,jm]}else{jm++;if(jm>12){jm=1;jy++}window.__darsitaCal=[jy,jm]}render()});
    host.querySelectorAll('[data-jcal-date]').forEach(b=>b.onclick=()=>{const key=b.dataset.jcalDate;const list=act.filter(a=>a.date===key);document.querySelector('#jcalDetail').innerHTML=`<h2>${b.querySelector('.jcal-week').textContent} ${b.querySelector('strong').textContent} ${monthNames[jm-1]} ${fa(jy)}</h2>${list.length?list.map(a=>`<div class="activity-item"><div><b>${a.subject}</b><span>${a.type==='study'?'مطالعه':'تست'} · ${fa(a.minutes)} دقیقه</span></div><strong>${a.tests?fa(a.tests)+' تست':'-'}</strong></div>`).join(''):'<p>برای این روز فعالیتی ثبت نشده است.</p>'}`});
  }
  window.renderJalaliCalendar=render;
  window.addEventListener('hashchange',render);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(render,100));
})();
