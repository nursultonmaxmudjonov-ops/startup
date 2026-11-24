"""
VANTEGE WEAR — Telegram Bot + Mini App

Funksiyalar:
  /start          — botni ishga tushirish, Mini App tugmasi
  /app            — Mini App'ni ochish
  /orders         — oxirgi 5 buyurtma
  /help           — yordam

Savatdan buyurtma berilganda:
  1) Next.js frontend  ->  POST /api/order  (bot serveri)
  2) Bot foydalanuvchiga Telegram xabar yuboradi (buyurtma tafsilotlari)
  3) Admin'ga ham xabar boradi (ADMIN_CHAT_ID bo'lsa)

Ishga tushirish:
  set TELEGRAM_BOT_TOKEN=...
  set WEBAPP_URL=https://night-26.vercel.app
  set ADMIN_CHAT_ID=...
  python bot/bot.py
"""

import json
import logging
import os
from typing import Any

from aiohttp import web
from telegram import (
    BotCommand,
    BotCommandScopeDefault,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    Update,
    WebAppInfo,
)
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

# ---------------------------------------------------------------
# KONFIGURATSIYA
# ---------------------------------------------------------------
TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "9261454449:AAH-FCbUCisi4Upa_x12yxnojVxNvlv-r5E")
WEBAPP_URL = os.environ.get("WEBAPP_URL", "https://night-26.vercel.app")
ADMIN_CHAT_ID = os.environ.get("ADMIN_CHAT_ID", "")
PORT = int(os.environ.get("PORT", "8080"))
HOST = os.environ.get("HOST", "0.0.0.0")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Buyurtmalarni saqlash fayli
ORDERS_FILE = os.path.join(os.path.dirname(__file__), "orders.json")


def parse_chat_id(chat_id_val: Any) -> int | str:
    """Chat ID raqam yoki matn ko'rinishida bo'lsa xavfsiz formatga keltiradi."""
    s = str(chat_id_val).strip()
    if s.lstrip("-").isdigit():
        return int(s)
    return s


def load_orders() -> dict[int | str, list[dict]]:
    """Buyurtmalarni fayldan yuklash."""
    if os.path.exists(ORDERS_FILE):
        try:
            with open(ORDERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {parse_chat_id(k): v for k, v in data.items()}
        except Exception as e:
            logger.warning("Buyurtmalarni o'qishda xatolik: %s", e)
    return {}


def save_orders() -> None:
    """Buyurtmalarni faylga saqlash."""
    try:
        with open(ORDERS_FILE, "w", encoding="utf-8") as f:
            json.dump(ORDERS, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning("Buyurtmalarni saqlashda xatolik: %s", e)


ORDERS: dict[int | str, list[dict]] = load_orders()


# ---------------------------------------------------------------
# XABAR FORMATLASH YORDAMCHILARI
# ---------------------------------------------------------------
def format_order_message(order: dict, title: str = "Buyurtma qabul qilindi!") -> str:
    """Yagona buyurtma xabarini chiroyli HTML formatda yaratish."""
    order_id = order.get("id", "-")
    name = order.get("name", "-")
    phone = order.get("phone", "-")
    addr = order.get("address", "-")
    card_last4 = str(order.get("cardLast4", "")).strip()

    items = order.get("items", [])
    formatted_items = []
    for it in items:
        it_name = it.get("name", "Nomsiz mahsulot")
        look_name = it.get("lookName")
        if look_name:
            it_name += f" ({look_name})"
        try:
            qty = int(it.get("qty", it.get("quantity", 1)))
        except (ValueError, TypeError):
            qty = 1
        try:
            price = float(it.get("price", 0))
        except (ValueError, TypeError):
            price = 0.0
        formatted_items.append(f"  • {it_name} × {qty} — ${price * qty:.2f}")

    items_str = "\n".join(formatted_items) if formatted_items else "  • (Mahsulotlar ko'rsatilmagan)"

    try:
        total = float(order.get("total", 0))
    except (ValueError, TypeError):
        total = 0.0

    card_str = f"💳 <b>Karta:</b> ****{card_last4}\n" if card_last4 else ""

    return (
        f"✅ <b>{title}</b>\n\n"
        f"🧾 <b>Buyurtma ID:</b> <code>{order_id}</code>\n"
        f"👤 <b>Mijoz:</b> {name}\n"
        f"📞 <b>Telefon:</b> {phone}\n"
        f"📍 <b>Manzil:</b> {addr}\n"
        f"{card_str}"
        f"\n<b>Mahsulotlar:</b>\n"
        f"{items_str}\n\n"
        f"💰 <b>Jami: ${total:.2f}</b>\n\n"
        "Tez orada operator siz bilan bog'lanadi ☎️"
    )


def format_orders_summary(orders: list[dict]) -> str:
    """Buyurtmalar ro'yxati matnini HTML ko'rinishida yaratish."""
    if not orders:
        return "📭 Sizda hali buyurtma yo'q."

    msg = "📦 <b>Buyurtmalaringiz:</b>\n\n"
    for i, o in enumerate(orders[-5:], 1):
        items = o.get("items", [])
        items_str = "\n".join(
            f"  • {it.get('name', 'Mahsulot')} × {it.get('qty', it.get('quantity', 1))}"
            for it in items
        ) if items else "  • (Mahsulotlar ko'rsatilmagan)"
        try:
            total = float(o.get("total", 0))
        except (ValueError, TypeError):
            total = 0.0
        msg += (
            f"<b>{i}. {o.get('id', '-')}</b>\n"
            f"{items_str}\n"
            f"💰 <b>${total:.2f}</b>\n"
            f"📍 {o.get('address', '-')}\n\n"
        )
    return msg


# ---------------------------------------------------------------
# /start
# ---------------------------------------------------------------
async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    kb = [
        [InlineKeyboardButton("🛍 VANTEGE WEAR Do'kon", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton("📦 Buyurtmalarim", callback_data="orders")],
    ]
    reply_markup = InlineKeyboardMarkup(kb)

    await update.message.reply_html(
        f"👋 Salom, <b>{user.first_name if user else 'mehmon'}</b>!\n\n"
        "Bu — <b>VANTEGE WEAR</b> rasmiy boti.\n"
        "Do'konni ochish uchun pastdagi tugmani bosing 👇",
        reply_markup=reply_markup,
    )


# ---------------------------------------------------------------
# /app — Mini App
# ---------------------------------------------------------------
async def cmd_app(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "🛍 Do'kon ochilmoqda...",
        reply_markup=InlineKeyboardMarkup(
            [[InlineKeyboardButton("🛍 VANTEGE WEAR Do'kon", web_app=WebAppInfo(url=WEBAPP_URL))]]
        ),
    )


# ---------------------------------------------------------------
# /orders
# ---------------------------------------------------------------
async def cmd_orders(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    orders = ORDERS.get(chat_id) or ORDERS.get(str(chat_id), [])
    text = format_orders_summary(orders)
    await update.message.reply_html(text)


# ---------------------------------------------------------------
# Callback: Buyurtmalarim tugmasi bosilganda
# ---------------------------------------------------------------
async def callback_orders(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if query:
        await query.answer()
        chat_id = update.effective_chat.id
        orders = ORDERS.get(chat_id) or ORDERS.get(str(chat_id), [])
        text = format_orders_summary(orders)
        await query.message.reply_html(text)


# ---------------------------------------------------------------
# /help
# ---------------------------------------------------------------
async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "🤖 <b>Buyruqlar:</b>\n"
        "/start — do'konni ochish\n"
        "/app — Mini App\n"
        "/orders — buyurtmalarim\n"
        "/help — yordam",
        parse_mode="HTML",
    )


# ---------------------------------------------------------------
# WEB APP DATA (Mini App sendData orqali yuborgan buyurtma)
# ---------------------------------------------------------------
async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Mini App sendData orqali yuborgan buyurtma."""
    if not update.effective_message or not update.effective_message.web_app_data:
        return

    data = update.effective_message.web_app_data.data

    try:
        order = json.loads(data)
    except json.JSONDecodeError:
        await update.message.reply_text("❌ Buyurtma ma'lumotini o'qib bo'lmadi.")
        return

    chat_id = update.effective_chat.id
    ORDERS.setdefault(chat_id, []).append(order)
    save_orders()

    msg = format_order_message(order, title="Buyurtma  qabul qilindi!")
    await update.message.reply_html(msg)

    # Admin'ga ham yuborish
    if ADMIN_CHAT_ID:
        try:
            admin_target = parse_chat_id(ADMIN_CHAT_ID)
            await context.bot.send_message(admin_target, msg, parse_mode="HTML")
        except Exception as exc:
            logger.warning("Admin'ga xabar yuborilmadi: %s", exc)


# ---------------------------------------------------------------
# API: frontend'dan kelgan buyurtma (HTTP server)
# ---------------------------------------------------------------
async def handle_order_http(app: Application) -> web.AppRunner:
    """Next.js frontend POST /api/order orqali yuborgan buyurtmani qabul qilish."""
    webapp = web.Application()

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    async def options_handler(_: web.Request) -> web.Response:
        return web.Response(headers=cors_headers)

    async def order_handler(request: web.Request) -> web.Response:
        try:
            body = await request.json()
        except Exception:
            return web.json_response(
                {"ok": False, "error": "Noto'g'ri JSON formati"},
                status=400,
                headers=cors_headers,
            )

        chat_id_raw = body.get("chat_id")
        order = body.get("order")

        # Agar order to'g'ridan-to'g'ri body ichida berilgan bo'lsa
        if not order and "items" in body:
            order = body

        if not order:
            return web.json_response(
                {"ok": False, "error": "Order ma'lumotlari talab qilinadi"},
                status=400,
                headers=cors_headers,
            )

        msg = format_order_message(order, title="Yangi buyurtma!")

        # 1) Agar chat_id bo'lsa xaridorga yuborish va bazaga saqlash
        if chat_id_raw:
            chat_id = parse_chat_id(chat_id_raw)
            ORDERS.setdefault(chat_id, []).append(order)
            save_orders()
            try:
                await app.bot.send_message(chat_id, msg, parse_mode="HTML")
            except Exception as exc:
                logger.warning("Foydalanuvchiga (%s) xabar yuborilmadi: %s", chat_id, exc)

        # 2) Admin'ga xabarnoma yuborish
        if ADMIN_CHAT_ID:
            try:
                admin_target = parse_chat_id(ADMIN_CHAT_ID)
                await app.bot.send_message(admin_target, msg, parse_mode="HTML")
            except Exception as exc:
                logger.warning("Admin'ga xabar yuborilmadi: %s", exc)

        return web.json_response({"ok": True}, headers=cors_headers)

    webapp.router.add_post("/api/order", order_handler)
    webapp.router.add_post("/api/telegram-order", order_handler)
    webapp.router.add_options("/api/order", options_handler)
    webapp.router.add_options("/api/telegram-order", options_handler)

    runner = web.AppRunner(webapp)
    await runner.setup()
    site = web.TCPSite(runner, HOST, PORT)
    await site.start()
    logger.info("HTTP API ishga tushdi: http://%s:%s/api/order", HOST, PORT)
    return runner


# ---------------------------------------------------------------
# ASOSIY
# ---------------------------------------------------------------
async def post_init(app: Application) -> None:
    """Menu buttonni Mini App ga o'rnatish + HTTP API ishga tushirish."""
    # 1) Chat menu button — Telegram'da bot ochilganda chapdagi 📋 tugma Mini App'ni ochadi
    await app.bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="🛍 VANTEGE WEAR",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    )

    # 2) Buyruqlar ro'yxati
    await app.bot.set_my_commands(
        [
            BotCommand("start", "Botni ishga tushirish"),
            BotCommand("app", "🛍 Do'kon (Mini App)"),
            BotCommand("orders", "📦 Buyurtmalarim"),
            BotCommand("help", "❓ Yordam"),
        ],
        scope=BotCommandScopeDefault(),
    )
    logger.info("Menu button + buyruqlar o'rnatildi: %s", WEBAPP_URL)

    # 3) HTTP API (frontend buyurtmalar uchun)
    http_runner = await handle_order_http(app)
    app.bot_data["http_runner"] = http_runner


async def post_shutdown(app: Application) -> None:
    """Bot to'xtatilganda HTTP serverni toza to'xtatish."""
    runner = app.bot_data.get("http_runner")
    if runner:
        await runner.cleanup()
        logger.info("HTTP API serveri to'xtatildi.")


def main() -> None:
    app = (
        Application.builder()
        .token(TOKEN)
        .post_init(post_init)
        .post_shutdown(post_shutdown)
        .build()
    )

    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("app", cmd_app))
    app.add_handler(CommandHandler("orders", cmd_orders))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CallbackQueryHandler(callback_orders, pattern="^orders$"))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))

    logger.info("Bot ishga tushdi...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
