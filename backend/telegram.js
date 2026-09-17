const axios = require('axios');

async function sendTelegramCode(chatId, code){
  if(!process.env.TELEGRAM_BOT_TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN');

  const text = `کد ورود شما به MADRSH:\n\n${code}\n\nاین کد محدودیت زمانی دارد.`;

  return axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text
  });
}

module.exports = { sendTelegramCode };
