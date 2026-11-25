# VANTEGE WEAR — Telegram Bot (Render'da deploy)

Bu loyiha **Render.com** uchun tayyor. `render.yaml` blueprint mavjud.

## 🔧 Deploy qadamlari

1. **GitHub'ga push qiling** (render.yaml, bot/ jildlari bilan birga)
2. **[dashboard.render.com](https://dashboard.render.com)** ga kiring
3. **New + → Blueprint** → repo'ingizni tanlang
4. Render `render.yaml` o'qiydi → **vantegewear-bot** worker'ni yaratadi
5. **Environment Variables**'ni to'ldiring:
   - `TELEGRAM_BOT_TOKEN` — BotFather'dan olingan token
   - `ADMIN_CHAT_ID` — o'z Telegram chat ID'ingiz (@userinfobot orqali bilib oling)
6. **Apply** → bot avtomatik deploy bo'ladi

## ⚙️ Konfiguratsiya

| Env var | Majburiy | Tavsif |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | BotFather token |
| `ADMIN_CHAT_ID` | ✅ | Admin chat ID (statistika, pending, broadcast uchun) |
| `WEBAPP_URL` | ❌ | Mini App URL (default: `https://night-26.vercel.app`) |
| `HOST` / `PORT` | ❌ | Default: `0.0.0.0:8080` |

## 🤖 Mavjud funksiyalar

- **Do'kon:** `/app`, `/catalog`, `/search`, `/promo`
- **Buyurtmalar:** `/orders`, `/order <id>`, `/cancel <id>`, `/profile`
- **Ma'lumot:** `/sizes`, `/delivery`, `/faq`, `/support`
- **Admin:** `/stats`, `/pending`, `/confirm`, `/broadcast`
- **HTTP API:** frontend'dan POST `/api/order` qabul qiladi (8080-port)

## 🧪 Lokal test

```bash
set TELEGRAM_BOT_TOKEN=...
set ADMIN_CHAT_ID=...
python bot/bot.py
```

> **Eslatma:** Render free plan'da HTTP port ochiq bo'lsa-da polling ishlaydi — webhook qo'shish shart emas.
