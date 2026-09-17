# MADRSH Authentication Backend

Flow:

User -> Website -> Auth API -> Telegram Bot -> OTP -> Website verification -> Account creation

Required services:

- Node.js backend
- Telegram Bot API token
- PostgreSQL/Supabase database
- Environment variables from .env.example

API endpoints:

POST /api/auth/start
POST /api/auth/verify-code
POST /api/auth/register
POST /api/auth/login

Never commit real bot tokens or database passwords.
