/* MADRSH Telegram Authentication
   Fixed: use backend-generated registration token instead of static register link.
*/
(function(){
 const AUTH_KEY='madrsh_auth_pending';
 const API_BASE='/api';

 async function createTelegramRequest(data){
   try{
     const res=await fetch(`${API_BASE}/auth/start`,{
       method:'POST',
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify(data)
     });
     const result=await res.json();
     if(result.telegram_url) return result.telegram_url;
   }catch(e){
     console.error('Auth start failed',e);
   }
   return null;
 }

 async function openTelegramBot(){
   const data=JSON.parse(localStorage.getItem(AUTH_KEY)||'{}');
   const url=await createTelegramRequest(data);
   if(url){
     window.open(url,'_blank');
     return;
   }
   toast('اتصال به سرور ثبت‌نام برقرار نشد');
 }

 function showTelegramRegister(){
   const modal=document.querySelector('#modalCard');
   const wrapper=document.querySelector('#modal');
   if(!modal||!wrapper)return;
   modal.innerHTML=`
   <h2>ساخت حساب MADRSH</h2>
   <p>نام و شماره موبایل را وارد کنید، سپس تایید تلگرام را انجام دهید.</p>
   <input id="regName" placeholder="نام">
   <input id="regPhone" placeholder="شماره موبایل">
   <button id="telegramStart" class="primary-btn">باز کردن ربات تلگرام</button>
   <input id="telegramCode" placeholder="کد ۶ رقمی">
   <button id="finishRegister" class="primary-btn">ساخت حساب</button>`;
   wrapper.classList.remove('hidden');

   document.querySelector('#telegramStart').onclick=()=>{
      localStorage.setItem(AUTH_KEY,JSON.stringify({
        name:document.querySelector('#regName').value,
        phone:document.querySelector('#regPhone').value
      }));
      openTelegramBot();
   };

   document.querySelector('#finishRegister').onclick=()=>{
      const code=document.querySelector('#telegramCode').value;
      if(!/^\d{6}$/.test(code)){
        toast('کد باید ۶ رقمی باشد');
        return;
      }
      toast('در حال بررسی کد تایید');
   };
 }
 window.MADRSHAuth={showTelegramRegister};
})();
