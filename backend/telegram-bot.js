// MADRSH Telegram Bot bridge
// Handles /start tokens created by the website registration flow.

const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.AUTH_API_URL;

async function sendMessage(chatId, text) {
  if (!BOT_TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN');

  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text
  });
}

async function handleStart(update) {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;
  const args = (message.text || '').split(' ');
  const registerToken = args[1];

  if (!registerToken) {
    await sendMessage(chatId, 'لطفاً ثبت‌نام را از داخل سایت MADRSH شروع کنید.');
    return;
  }

  // Send Telegram identity + registration token to backend.
  await axios.post(`${API_URL}/api/auth/telegram/connect`, {
    token: registerToken,
    telegram_id: chatId
  });

  await sendMessage(chatId, 'تأیید تلگرام انجام شد. کد ۶ رقمی ورود را از همین ربات دریافت می‌کنید.');
}

module.exports = { handleStart };
