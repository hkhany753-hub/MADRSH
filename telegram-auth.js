/* MADRSH Telegram Authentication
   Frontend flow foundation: signup -> Telegram bot -> OTP -> account creation
   Real verification must be connected to backend bot API.
*/
(function(){
 const AUTH_KEY='madrsh_auth_pending';
 function openTelegramBot(){
   window.open('https://t.me/MADRSH_LoginBot?start=register','_blank');
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
      localStorage.setItem(AUTH_KEY,JSON.stringify({name:regName.value,phone:regPhone.value}));
      openTelegramBot();
   };
   document.querySelector('#finishRegister').onclick=()=>{
      const data=JSON.parse(localStorage.getItem(AUTH_KEY)||'{}');
      if(!telegramCode.value.match(/^\d{6}$/)){toast('کد باید ۶ رقمی باشد');return;}
      toast('آماده اتصال به سرور احراز هویت');
   };
 }
 window.MADRSHAuth={showTelegramRegister};
})();
