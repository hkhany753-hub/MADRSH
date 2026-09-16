# راه‌اندازی ثبت‌نام تلگرامی درسیتا

این سیستم ثبت‌نام را به شکل زیر انجام می‌دهد:

1. کاربر در سایت شماره و نامش را وارد می‌کند.
2. سایت یک لینک اختصاصی ۱۰ دقیقه‌ای برای `@MADRSH_LoginBot` می‌سازد.
3. کاربر وارد ربات می‌شود و Start را می‌زند.
4. ربات با دکمه «ارسال شماره من» شماره واقعی تلگرام را می‌گیرد.
5. اگر شماره با شماره ثبت‌شده در سایت یکی باشد، ربات کد ۶ رقمی می‌فرستد.
6. کد در سایت وارد می‌شود و Edge Function با Supabase Auth حساب را می‌سازد.

## یک‌بار در Supabase

### 1) جدول
فایل `supabase-telegram.sql` را در SQL Editor اجرا کن.

### 2) Secrets
در Supabase Dashboard → Edge Functions → Secrets این دو Secret را بساز:

- `TELEGRAM_BOT_TOKEN` = توکن ربات تلگرام
- `TELEGRAM_WEBHOOK_SECRET` = یک رشته تصادفی که خودت انتخاب می‌کنی

`SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` در محیط Edge Functions خود Supabase وجود دارند و نباید داخل GitHub یا فرانت‌اند قرار بگیرند.

### 3) Deploy
Function زیر را Deploy کن:

`supabase/functions/telegram-auth/index.ts`

فایل `supabase/config.toml` هم JWT verification را برای این endpoint خاموش کرده است؛ خود تابع برای درخواست webhook یک Secret Header اجباری دارد و برای عملیات ثبت‌نام challenge/OTP محدودیت دارد.

### 4) Webhook ربات
بعد از Deploy، این دستور را با مقدارهای واقعی خودت اجرا کن:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"<SUPABASE_FUNCTION_URL>","secret_token":"<WEBHOOK_SECRET>","allowed_updates":["message"]}'
```

`<SUPABASE_FUNCTION_URL>` معمولاً به شکل زیر است:

`https://<PROJECT_REF>.supabase.co/functions/v1/telegram-auth`

بعد از این مرحله ثبت‌نام تلگرامی فعال می‌شود.
