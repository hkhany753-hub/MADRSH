(function(){
  const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  const leap=y=>[1,5,9,13,17,22,26,30].includes(y%33)||y%33===1;
  const mdays=y=>Array.from({length:12},(_,i)=>i<6?31:i<11?30:(leap(y)?30:29));
  const names=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  const weeks=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
  function gregorianToJalali(gy,gm,gd){const gdm=[0,31,28,31,30,31,30,31,31,30,31,30,31];let gy2=gy+1;let days=355666+365*gy+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)+gd;for(let i=1;i<gm;i++)days+=gdm[i];if(gm>2&&((gy%4===0&&gy%100!==0)||gy%400===0))days++;let jy=-1597+33*Math.floor(days/12053);days%=12053;jy+=4*Math.floor(days/1461);days%=1461;if(days>365){jy+=Math.floor((days-1)/365);days=(days-1)%365}let jm=days<186?1+Math.floor(days/31):7+Math.floor((days-186)/30);let jd=1+(days<186?days%31:(days-186)%30);return [jy,jm,jd]}
  function jalaliToGregorian(jy,jm,jd){jy+=1595;let days=-355668+365*jy+Math.floor(jy/33)*8+Math.floor((jy%33+3)/4)+jd+(jm<7?(jm-1)*31:((jm-7)*30)+186);let gy=400*Math.floor(days/146097);days%=146097;if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++}gy+=4*Math.floor(days/1461);days%=1461;if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365}let gd=days+1,gmd=[31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31],gm=0;while(gd>gmd[gm]){gd-=gmd[gm];gm++}return [gy,gm+1,gd]}
  function nowJ(){const d=new Date(),j=gregorianToJalali(d.getFullYear(),d.getMonth()+1,d.getDate());return {y:j[0],m:j[1],d:j[2]}}
  function firstWeekday(y,m){const g=jalaliToGregorian(y,m,1),d=new Date(g[0],g[1]-1,g[2]);return (d.getDay()+1)%7}
  function activityMap(acts){const map={};(acts||[]).forEach(a=>{const raw=String(a.date||'').slice(0,10),m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return;const g=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));if(Number.isNaN(g.getTime()))return;const j=gregorianToJalali(g.getFullYear(),g.getMonth()+1,g.getDate()),key=`${j[0]}-${j[1]}-${j[2]}`;map[key]=(map[key]||0)+Number(a.minutes||0)});return map}
  let cursor=nowJ();
  function render(acts){
    const map=activityMap(acts),days=mdays(cursor.y),first=firstWeekday(cursor.y,cursor.m),cells=[];
    for(let i=0;i<first;i++)cells.push('<div class="cal-day cal-empty"></div>');
    const n=nowJ();
    for(let d=1;d<=days[cursor.m-1];d++){
      const key=`${cursor.y}-${cursor.m}-${d}`,mins=map[key]||0,isToday=cursor.y===n.y&&cursor.m===n.m&&d===n.d,weekday=weeks[(first+d-1)%7];
      cells.push(`<button type="button" class="cal-day ${isToday?'today':''} ${mins?'has-activity':''}" data-cal-day="${key}" aria-label="${weekday} ${fa(d)} ${names[cursor.m-1]}"><span class="cal-week-name">${weekday}</span><span class="cal-num">${fa(d)}</span><span class="cal-info">${mins?fa(mins)+' دقیقه':'—'}</span></button>`)
    }
    return `<div class="feature-shell calendar-page"><div class="section-heading"><div><span class="pill">تقویم شمسی</span><h1>${names[cursor.m-1]} ${fa(cursor.y)}</h1><p>امروز: ${fa(n.y)}/${fa(n.m)}/${fa(n.d)}</p></div><div class="cal-nav"><button class="small-btn" data-cal-prev>ماه قبل</button><button class="small-btn" data-cal-today>امروز</button><button class="small-btn" data-cal-next>ماه بعد</button></div></div><section class="calendar-card"><div class="cal-week">${weeks.map(w=>`<div>${w}</div>`).join('')}</div><div class="cal-grid">${cells.join('')}</div></section><div id="calDetail" class="cal-detail"><b>روز را انتخاب کن</b><span>فعالیت‌های همان روز اینجا نمایش داده می‌شود.</span></div></div>`
  }
  function rerender(){if(location.hash==='#calendar'&&typeof window.routePage==='function')window.routePage('calendar');else location.hash='calendar'}
  function bind(acts){document.querySelector('[data-cal-prev]')?.addEventListener('click',()=>{cursor.m--;if(cursor.m<1){cursor.m=12;cursor.y--}rerender()});document.querySelector('[data-cal-next]')?.addEventListener('click',()=>{cursor.m++;if(cursor.m>12){cursor.m=1;cursor.y++}rerender()});document.querySelector('[data-cal-today]')?.addEventListener('click',()=>{cursor=nowJ();rerender()});document.querySelectorAll('[data-cal-day]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.calDay,list=(acts||[]).filter(a=>{const p=String(a.date||'').slice(0,10).split('-').map(Number);if(p.length!==3)return false;const j=gregorianToJalali(p[0],p[1],p[2]);return `${j[0]}-${j[1]}-${j[2]}`===key}),d=document.querySelector('#calDetail');if(!d)return;d.innerHTML=list.length?`<b>فعالیت‌های ${fa(key.split('-')[2])} ${names[Number(key.split('-')[1])-1]}</b>${list.map(a=>`<span>${a.subject} · ${fa(a.minutes)} دقیقه · ${a.type==='test'?'تست':'مطالعه'}</span>`).join('')}`:`<b>برای این روز فعالیتی ثبت نشده</b><span>${fa(key.split('-')[2])} ${names[Number(key.split('-')[1])-1]}</span>`}))}
  window.DarsitaCalendarPage=function(acts){setTimeout(()=>bind(acts),0);return render(acts)};
  window.DarsitaCalendarToday=nowJ;
  document.addEventListener('DOMContentLoaded',()=>{if(location.hash==='#calendar'&&typeof window.routePage==='function')window.routePage('calendar')});
})();
