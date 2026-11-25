"""
VANTEGE WEAR — Telegram Bot + Mini App (Kengaytirilgan)

Funksiyalar:
  /start          — botni ishga tushirish, Mini App tugmasi
  /app            — Mini App'ni ochish
  /orders         — oxirgi 5 buyurtma
  /order <id>     — bitta buyurtma tafsilotlari
  /cancel <id>    — yangi buyurtmani bekor qilish
  /catalog        — do'kondagi mahsulotlar ro'yxati
  /search <matn>  — mahsulot qidirish
  /profile        — profil ma'lumotlari
  /support <xabar> — operatorga xabar yuborish
  /faq            — tez-tez so'raladigan savollar
  /sizes          — o'lchamlar jadvali
  /delivery       — yetkazib berish ma'lumotlari
  /promo          — faol chegirmalar
  /stats          — (faqat admin) statistika
  /pending        — (faqat admin) tasdiqlanmagan buyurtmalar
  /confirm <id>   — (faqat admin) buyurtmani tasdiqlash
  /broadcast <matn> — (faqat admin) hamma foydalanuvchiga xabar
  /help           — yordam
  💬 Oddiy matn   — operatorga yo'naltiriladi (support sifatida)

Ishga tushirish:
  set TELEGRAM_BOT_TOKEN=...
  set WEBAPP_URL=https://night-26.vercel.app
  set ADMIN_CHAT_ID=...
  python bot/bot.py
"""

import json
import logging
import os
import time
import asyncio
from datetime import datetime
from typing import Any

from aiohttp import web
from telegram import (
    BotCommand,
    BotCommandScopeDefault,
    BotCommandScopeChat,
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

ORDERS_FILE = os.path.join(os.path.dirname(__file__), "orders.json")
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")

# ---------------------------------------------------------------
# KATALOG (do'kon mahsulotlari)
# ---------------------------------------------------------------
CATALOG: list[dict] = [
    {"id": "cobalt-shell", "name": "Cobalt Rain Shell", "look": "Cobalt Shell", "price": 425, "type": "OUTERWEAR", "color": "Cobalt Blue", "mat": "Grafen membrana"},
    {"id": "cobalt-cargo", "name": "Wide Cargo Pant", "look": "Cobalt Shell", "price": 165, "type": "TROUSERS", "color": "Cobalt Blue", "mat": "Tex-nylon"},
    {"id": "mirror-parka", "name": "Mirror Down Parka", "look": "Silver Signal", "price": 650, "type": "OUTERWEAR", "color": "Silver", "mat": "Down + aluminat qoplama"},
    {"id": "tech-trouser", "name": "Straight Tech Trouser", "look": "Silver Signal", "price": 180, "type": "TROUSERS", "color": "Silver", "mat": "Stretch wool"},
    {"id": "night-jacket", "name": "Night Run Bomber", "look": "Night Run", "price": 380, "type": "OUTERWEAR", "color": "Anthracite", "mat": "3L ripstop"},
    {"id": "night-pant", "name": "Tapered Track Pant", "look": "Night Run", "price": 140, "type": "TROUSERS", "color": "Anthracite", "mat": "Merino blend"},
]

PROMOS: list[dict] = [
    {"code": "OUTFIT10", "desc": "Kurtka + shim kombo — 10% chegirma", "expires": "Cheksiz"},
    {"code": "FW26LAUNCH", "desc": "FW '26 ochilishi — 15% chegirma", "expires": "2026-12-31"},
    {"code": "TGONLY", "desc": "Telegram muxlislari uchun maxsus 5%", "expires": "2026-01-31"},
]

FAQ_ITEMS: list[tuple[str, str]] = [
    ("Buyurtma qachon yetib keladi?", "Toshkent bo'ylab 24 soat, viloyatlarga 2-3 ish kuni. Xalqaro yetkazish 5-7 ish kuni."),
    ("O'lcham mos kelmasa almashtirasizmi?", "Ha! 14 kun ichida bepul almashtirish yoki qaytarish mavjud."),
    ("To'lov turlari?", "Karta (UzCard/Humo/Visa), Payme, Click va naqd qabulda."),
    ("Kiyim materiallari xavfsizmi?", "Barcha mahsulotlar OEKO-TEX sertifikatiga ega matolardan tikilgan."),
    ("Aksessuarlar ham sotiladimi?", "Hozircha faqat outerwear va trousers. Aksessuarlar kolleksiyasi qishda chiqadi."),
]

SIZE_TABLE = (
    "📏 <b>O'LCHAMLAR JADVALI (Erkak)</b>\n\n"
    "S  — ko'krak 92-96 · bel 76-80 · bo'y 170-175\n"
    "M  — ko'krak 96-100 · bel 80-84 · bo'y 175-180\n"
    "L  — ko'krak 100-104 · bel 84-88 · bo'y 180-185\n"
    "XL — ko'krak 104-110 · bel 88-94 · bo'y 185-190\n\n"
    "📏 <b>O'LCHAMLAR JADVALI (Ayol)</b>\n\n"
    "XS — ko'krak 80-84 · bel 60-64\n"
    "S  — ko'krak 84-88 · bel 64-68\n"
    "M  — ko'krak 88-92 · bel 68-72\n"
    "L  — ko'krak 92-98 · bel 72-78"
)

DELIVERY_TEXT = (
    "🚚 <b>YETKAZIB BERISH</b>\n\n"
    "• Toshkent shahar — 24 soat ichida, 15 000 so'm\n"
    "• Toshkent viloyati — 1-2 kun, 20 000 so'm\n"
    "• Boshqa viloyatlar — 2-3 kun, 25 000 so'm\n"
    "• Xalqaro (Rossiya, Qozog'iston, Turkiya) — 5-7 kun, kuryer orqali\n\n"
    "💵 <b>50$ dan yuqori buyurtmaga yetkazib berish BEPUL!</b>\n\n"
    "Buyurtma holatini bot orqali kuzatib borishingiz mumkin 📦"
)

STATUSES: dict[str, str] = {
    "new": "🆕 Yangi",
    "confirmed": "✅ Tasdiqlangan",
    "shipped": "🚚 Yuborilgan",
    "delivered": "📦 Yetkazilgan",
    "cancelled": "❌ Bekor qilingan",
}


def parse_chat_id(chat_id_val: Any) -> int | str:
    s = str(chat_id_val).strip()
    if s.lstrip("-").isdigit():
        return int(s)
    return s


# ---------------------------------------------------------------
# UMUMIY SAQLASH (orders + users)
# ---------------------------------------------------------------
def _load_json(path: str, default: Any) -> Any:
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning("%s o'qishda xatolik: %s", path, e)
    return default


def _save_json(path: str, data: Any) -> None:
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning("%s saqlashda xatolik: %s", path, e)


def load_orders() -> dict[int | str, list[dict]]:
    raw = _load_json(ORDERS_FILE, {})
    return {parse_chat_id(k): v for k, v in raw.items()}


ORDERS: dict[int | str, list[dict]] = load_orders()
USERS: dict[str, dict] = _load_json(USERS_FILE, {})


def save_orders() -> None:
    _save_json(ORDERS_FILE, {str(k): v for k, v in ORDERS.items()})


def save_users() -> None:
    _save_json(USERS_FILE, USERS)


def all_user_ids() -> list[int]:
    ids: set[int] = set()
    for k in ORDERS.keys():
        try:
            ids.add(int(k))
        except (ValueError, TypeError):
            pass
    for k in USERS.keys():
        try:
            ids.add(int(k))
        except (ValueError, TypeError):
            pass
    return sorted(ids)


def register_user(update: Update) -> None:
    u = update.effective_user
    if not u:
        return
    key = str(u.id)
    if key not in USERS:
        USERS[key] = {
            "id": u.id,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
            "username": u.username or "",
            "lang": u.language_code or "uz",
            "joined": datetime.now().isoformat(timespec="seconds"),
        }
        save_users()


def is_admin(update: Update) -> bool:
    if not ADMIN_CHAT_ID:
        return False
    u = update.effective_user
    return bool(u and str(u.id) == str(ADMIN_CHAT_ID).strip())


# ---------------------------------------------------------------
# XABAR FORMATLASH YORDAMCHILARI
# ---------------------------------------------------------------
def format_order_message(order: dict, title: str = "Buyurtma qabul qilindi!") -> str:
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
    ts = order.get("ts") or order.get("date")
    date_str = f"🕒 <b>Sana:</b> {ts}\n" if ts else ""

    return (
        f"✅ <b>{title}</b>\n\n"
        f"🧾 <b>Buyurtma ID:</b> <code>{order_id}</code>\n"
        f"👤 <b>Mijoz:</b> {name}\n"
        f"📞 <b>Telefon:</b> {phone}\n"
        f"📍 <b>Manzil:</b> {addr}\n"
        f"{card_str}"
        f"{date_str}"
        f"\n<b>Mahsulotlar:</b>\n"
        f"{items_str}\n\n"
        f"💰 <b>Jami: ${total:.2f}</b>\n\n"
        "Tez orada operator siz bilan bog'lanadi ☎️"
    )


def format_orders_summary(orders: list[dict]) -> str:
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
        status = STATUSES.get(str(o.get("status", "new")), "🆕 Yangi")
        msg += (
            f"<b>{i}. {o.get('id', '-')}</b> {status}\n"
            f"{items_str}\n"
            f"💰 <b>${total:.2f}</b>\n"
            f"📍 {o.get('address', '-')}\n\n"
        )
    msg += "Tafsilotlar uchun: /order <id> · Bekor qilish: /cancel <id>"
    return msg


def find_order(chat_id: Any, order_id: str) -> dict | None:
    """Buyurtmani ID bo'yicha topish (qisman moslik ham qo'llaniladi)."""
    orders = ORDERS.get(chat_id) or ORDERS.get(str(chat_id), [])
    order_id = order_id.strip().upper()
    # To'liq moslik
    for o in orders:
        if str(o.get("id", "")).upper() == order_id:
            return o
    # Qisman moslik
    for o in orders:
        if order_id and order_id in str(o.get("id", "")).upper():
            return o
    return None


# ---------------------------------------------------------------
# BUYRUQLAR
# ---------------------------------------------------------------
SHOP_KB = InlineKeyboardMarkup(
    [
        [InlineKeyboardButton("🛍 Do'konni ochish", web_app=WebAppInfo(url=WEBAPP_URL))],
        [
            InlineKeyboardButton("📦 Buyurtmalarim", callback_data="orders"),
            InlineKeyboardButton("🎯 Chegirmalar", callback_data="promo"),
        ],
        [
            InlineKeyboardButton("📏 O'lchamlar", callback_data="sizes"),
            InlineKeyboardButton("🚚 Yetkazish", callback_data="delivery"),
        ],
        [
            InlineKeyboardButton("❓ FAQ", callback_data="faq"),
            InlineKeyboardButton("💬 Operator", callback_data="support"),
        ],
    ]
)


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    register_user(update)
    user = update.effective_user
    kb = SHOP_KB

    await update.message.reply_html(
        f"👋 Salom, <b>{user.first_name if user else 'mehmon'}</b>!\n\n"
        "Bu — <b>VANTEGE WEAR</b> rasmiy boti.\n"
        "🛍 High-tech luxury kiyimlar do'koni\n\n"
        "Pastdagi tugmalar orqali do'kon, buyurtmalar, "
        "chegirmalar va yordamga tez o'tishingiz mumkin 👇\n\n"
        "💬 Savollaringiz bo'lsa, oddiy xabar yozing — operator ko'radi.",
        reply_markup=kb,
    )


async def cmd_app(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "🛍 Do'kon ochilmoqda...",
        reply_markup=InlineKeyboardMarkup(
            [[InlineKeyboardButton("🛍 VANTEGE WEAR Do'kon", web_app=WebAppInfo(url=WEBAPP_URL))]]
        ),
    )


async def cmd_orders(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    orders = ORDERS.get(chat_id) or ORDERS.get(str(chat_id), [])
    text = format_orders_summary(orders)
    await update.message.reply_html(text, reply_markup=orders_kb(orders))


def orders_kb(orders: list[dict]) -> InlineKeyboardMarkup:
    """Oxirgi 5 buyurtma uchun inline tugmalar."""
    if not orders:
        kb: list[list[InlineKeyboardButton]] = [
            [InlineKeyboardButton("🛍 Do'konga o'tish", web_app=WebAppInfo(url=WEBAPP_URL))]
        ]
        return InlineKeyboardMarkup(kb)
    rows = []
    for o in orders[-5:]:
        oid = str(o.get("id", "-"))
        try:
            total = float(o.get("total", 0))
        except (ValueError, TypeError):
            total = 0.0
        rows.append(
            [InlineKeyboardButton(f"🧾 {oid[:12]} — ${total:.2f}", callback_data=f"order:{oid}")]
        )
    rows.append([InlineKeyboardButton("🛍 Do'konga o'tish", web_app=WebAppInfo(url=WEBAPP_URL))])
    return InlineKeyboardMarkup(rows)


async def cmd_order_detail(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Buyurtma tafsiloti: /order <id>"""
    chat_id = update.effective_chat.id
    if not context.args:
        await update.message.reply_text("❗ Foydalanish: /order <buyurtma_id>")
        return
    oid = " ".join(context.args)
    order = find_order(chat_id, oid)
    if not order:
        await update.message.reply_text(f"❌ <code>{oid}</code> buyurtma topilmadi.", parse_mode="HTML")
        return
    await update.message.reply_html(format_order_message(order, title="Buyurtma tafsiloti"))


async def cmd_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Buyurtmani bekor qilish: /cancel <id>"""
    chat_id = update.effective_chat.id
    if not context.args:
        await update.message.reply_text("❗ Foydalanish: /cancel <buyurtma_id>")
        return
    oid = " ".join(context.args)
    orders = ORDERS.get(chat_id) or ORDERS.get(str(chat_id), [])
    order = find_order(chat_id, oid)
    if not order:
        await update.message.reply_text(f"❌ <code>{oid}</code> buyurtma topilmadi.", parse_mode="HTML")
        return
    if str(order.get("status", "new")) not in ("new", "confirmed"):
        await update.message.reply_text(
            "⚠️ Bu buyurtma allaqachon jo'natilgan — bekor qilib bo'lmaydi."
        )
        return
    order["status"] = "cancelled"
    order["cancelled_at"] = datetime.now().isoformat(timespec="seconds")
    save_orders()
    await update.message.reply_html(
        f"❌ <b>Buyurtma bekor qilindi:</b> <code>{order.get('id')}</code>\n"
        "Agar to'lov bo'lsa, 3-5 ish kuni ichida qaytariladi 💳"
    )
    await notify_admin(update, context,
        f"⚠️ <b>Buyurtma bekor qilindi</b>\n🧾 ID: <code>{order.get('id')}</code>\n"
        f"👤 {update.effective_user.first_name if update.effective_user else '-'}"
    )


async def cmd_catalog(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Mahsulotlar katalogi."""
    msg = "🛍 <b>VANTEGE WEAR — FW '26 KOLLEKSIYA</b>\n\n"
    for p in CATALOG:
        msg += (
            f"<b>{p['name']}</b>\n"
            f"  {p['type']} · {p['color']}\n"
            f"  💰 <b>${p['price']}</b> · {p['mat']}\n\n"
        )
    msg += "To'liq ko'rish va kiyib ko'rish uchun Mini App'ni oching 👇"
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🛍 Mini App'da ko'rish", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton("🔍 Qidirish: /search nom", callback_data="noop")],
    ])
    await update.message.reply_html(msg, reply_markup=kb)


async def cmd_search(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/search <matn> — mahsulot qidirish."""
    if not context.args:
        await update.message.reply_text("❗ Foydalanish: /search <mahsulot nomi> (masalan: /search parka)")
        return
    q = " ".join(context.args).lower()
    found = [
        p for p in CATALOG
        if q in p["name"].lower()
        or q in p["look"].lower()
        or q in p["type"].lower()
        or q in p["color"].lower()
        or q in p["mat"].lower()
    ]
    if not found:
        await update.message.reply_html(
            f"🔍 <code>{q}</code> bo'yicha hech narsa topilmadi.\n"
            "Barcha mahsulotlar: /catalog"
        )
        return
    msg = f"🔍 <b>{q!r}</b> bo'yicha topildi ({len(found)}):\n\n"
    for p in found:
        msg += f"• <b>{p['name']}</b> — ${p['price']} · {p['type']}\n"
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🛍 Mini App'da ko'rish", web_app=WebAppInfo(url=WEBAPP_URL))],
    ])
    await update.message.reply_html(msg, reply_markup=kb)


async def cmd_promo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Faol chegirmalar."""
    msg = "🎯 <b>FAOL CHEGIRMALAR</b>\n\n"
    for pr in PROMOS:
        msg += f"🏷 <code>{pr['code']}</code>\n   {pr['desc']}\n   ⏳ {pr['expires']}\n\n"
    msg += "Chegirma kodi Mini App'da checkout'da kiritiladi 🛍"
    await update.message.reply_html(
        msg,
        reply_markup=InlineKeyboardMarkup(
            [[InlineKeyboardButton("🛍 Kodni ishlatish", web_app=WebAppInfo(url=WEBAPP_URL))]]
        ),
    )


async def cmd_profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Profil ma'lumotlari."""
    u = update.effective_user
    if not u:
        return
    key = str(u.id)
    info = USERS.get(key, {})
    chat_orders = ORDERS.get(update.effective_chat.id) or ORDERS.get(str(update.effective_chat.id), [])
    try:
        spent = sum(float(o.get("total", 0)) for o in chat_orders if str(o.get("status", "")) != "cancelled")
    except Exception:
        spent = 0.0
    # VIP daraja
    if spent >= 1000:
        tier = "💎 VIP Gold"
    elif spent >= 500:
        tier = "🥈 Silver"
    elif spent >= 100:
        tier = "🥉 Bronze"
    else:
        tier = "⚪ Yangi mijoz"

    msg = (
        "👤 <b>PROFILINGIZ</b>\n\n"
        f"🆔 ID: <code>{u.id}</code>\n"
        f"👤 Ism: {u.first_name} {u.last_name or ''}\n"
        f"🔗 Username: @{u.username}" if u.username else "🔗 Username: —"
    )
    msg = (
        "👤 <b>PROFILINGIZ</b>\n\n"
        f"🆔 ID: <code>{u.id}</code>\n"
        f"👤 Ism: {u.first_name} {u.last_name or ''}\n"
        f"🔗 Username: {'@' + u.username if u.username else '—'}\n"
        f"📅 Ro'yxatdan o'tgan: {(info.get('joined') or '—').split('T')[0]}\n"
        f"📦 Buyurtmalar soni: {len(chat_orders)}\n"
        f"💰 Umumiy xarid: <b>${spent:.2f}</b>\n"
        f"🏆 Daraja: {tier}\n\n"
        f"{'🎁 VIP mijozlarga har xaridda 15% chegirma!' if spent >= 1000 else 'Yana xarid qilib darajani oshiring! 🚀'}"
    )
    await update.message.reply_html(msg)


async def cmd_sizes(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_html(SIZE_TABLE)


async def cmd_delivery(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_html(DELIVERY_TEXT)


async def cmd_faq(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = "❓ <b>TEZ-TEZ SO'RALADIGAN SAVOLLAR</b>\n\n"
    for i, (q, a) in enumerate(FAQ_ITEMS, 1):
        msg += f"<b>{i}. {q}</b>\n{a}\n\n"
    msg += "Boshqa savollar uchun: /support <savolingiz>"
    await update.message.reply_html(msg)


async def cmd_support(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Operatorga xabar yuborish: /support <matn>"""
    if not context.args:
        await update.message.reply_text(
            "💬 Operator bilan bog'lanish:\n\n"
            "Oddiy xabar yozing yoki:\n"
            "<code>/support savolingiz matni</code>",
            parse_mode="HTML",
        )
        return
    text = " ".join(context.args)
    u = update.effective_user
    await update.message.reply_html(
        "✅ <b>Xabaringiz operatorga yuborildi!</b>\n"
        "Tez orada javob olasiz ☎️"
    )
    if ADMIN_CHAT_ID:
        try:
            await context.bot.send_message(
                parse_chat_id(ADMIN_CHAT_ID),
                f"💬 <b>Yangi support xabari</b>\n\n"
                f"👤 {u.first_name if u else '-'} (<code>{u.id if u else '-'}</code>)\n"
                f"🔗 {'@' + u.username if u and u.username else '—'}\n\n"
                f"✉️ {text}",
                parse_mode="HTML",
            )
        except Exception as exc:
            logger.warning("Admin'ga support xabari yuborilmadi: %s", exc)


# ---------------------------------------------------------------
# ADMIN BUYRUQLARI
# ---------------------------------------------------------------
async def admin_only(update: Update) -> bool:
    if not is_admin(update):
        await update.message.reply_text("⛔ Bu buyruq faqat admin uchun.")
        return False
    return True


async def cmd_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """(Admin) Umumiy statistika."""
    if not await admin_only(update):
        return
    total_orders = sum(len(v) for v in ORDERS.values())
    total_revenue = 0.0
    cancelled = 0
    for orders in ORDERS.values():
        for o in orders:
            if str(o.get("status", "")) == "cancelled":
                cancelled += 1
                continue
            try:
                total_revenue += float(o.get("total", 0))
            except (ValueError, TypeError):
                pass
    users = len(USERS) or len(all_user_ids())
    top_items: dict[str, int] = {}
    for orders in ORDERS.values():
        for o in orders:
            if str(o.get("status", "")) == "cancelled":
                continue
            for it in o.get("items", []):
                name = it.get("name", "?")
                try:
                    qty = int(it.get("qty", it.get("quantity", 1)))
                except (ValueError, TypeError):
                    qty = 1
                top_items[name] = top_items.get(name, 0) + qty
    top = sorted(top_items.items(), key=lambda x: -x[1])[:5]
    top_str = "\n".join(f"  {i+1}. {n} × {q}" for i, (n, q) in enumerate(top)) or "  (hali yo'q)"

    msg = (
        "📊 <b>ADMIN STATISTIKA</b>\n\n"
        f"👥 Foydalanuvchilar: <b>{users}</b>\n"
        f"📦 Buyurtmalar: <b>{total_orders}</b>\n"
        f"❌ Bekor qilingan: <b>{cancelled}</b>\n"
        f"💰 Umumiy tushum: <b>${total_revenue:.2f}</b>\n"
        f"📈 O'rtacha chek: <b>${(total_revenue / max(1, total_orders - cancelled)):.2f}</b>\n\n"
        f"🔥 <b>TOP mahsulotlar:</b>\n{top_str}\n\n"
        f"📅 {datetime.now().strftime('%d.%m.%Y %H:%M')}"
    )
    await update.message.reply_html(msg)


async def cmd_pending(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """(Admin) Yangi/tasdiqlanmagan buyurtmalar."""
    if not await admin_only(update):
        return
    rows: list[tuple[str, dict, int | str]] = []
    for chat_id, orders in ORDERS.items():
        for o in orders:
            if str(o.get("status", "new")) in ("new", "confirmed"):
                rows.append((str(o.get("id", "-")), o, chat_id))
    if not rows:
        await update.message.reply_text("✅ Tasdiqlanmagan buyurtma yo'q — hammasi ishlangan.")
        return
    msg = f"⏳ <b>TASDIQLANMAGAN BUYURTMALAR ({len(rows)}):</b>\n\n"
    kb_rows = []
    for oid, o, chat_id in rows[-10:]:
        items_str = ", ".join(
            f"{it.get('name', '?')} × {it.get('qty', 1)}" for it in o.get("items", [])
        ) or "-"
        msg += (
            f"🧾 <b>{oid}</b>\n"
            f"👤 {o.get('name', '-')} · 📞 {o.get('phone', '-')}\n"
            f"🛍 {items_str}\n"
            f"💰 ${float(o.get('total', 0)):.2f}\n\n"
        )
        kb_rows.append([
            InlineKeyboardButton(f"✅ {oid[:10]}", callback_data=f"admconfirm:{oid}:{chat_id}"),
            InlineKeyboardButton(f"❌ {oid[:10]}", callback_data=f"admcancel:{oid}:{chat_id}"),
        ])
    await update.message.reply_html(msg, reply_markup=InlineKeyboardMarkup(kb_rows) if kb_rows else None)


async def cmd_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """(Admin) Buyurtmani tasdiqlash: /confirm <id>"""
    if not await admin_only(update):
        return
    if not context.args:
        await update.message.reply_text("❗ Foydalanish: /confirm <buyurtma_id>")
        return
    oid = " ".join(context.args)
    for chat_id, orders in ORDERS.items():
        for o in orders:
            if str(o.get("id", "")) == oid or oid in str(o.get("id", "")):
                o["status"] = "confirmed"
                o["confirmed_at"] = datetime.now().isoformat(timespec="seconds")
                save_orders()
                await update.message.reply_html(f"✅ <b>Buyurtma tasdiqlandi:</b> <code>{o.get('id')}</code>")
                # Xaridorga xabar
                try:
                    await context.bot.send_message(
                        chat_id,
                        f"✅ <b>Buyurtmangiz tasdiqlandi!</b>\n"
                        f"🧾 ID: <code>{o.get('id')}</code>\n"
                        f"💰 ${float(o.get('total', 0)):.2f}\n"
                        "Tez orada kuryer bog'lanadi 🚚",
                        parse_mode="HTML",
                    )
                except Exception as exc:
                    logger.warning("Xaridorga tasdiq xabari yuborilmadi: %s", exc)
                return
    await update.message.reply_text(f"❌ <code>{oid}</code> topilmadi.")


async def cmd_broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """(Admin) Barcha foydalanuvchilarga xabar: /broadcast <matn>"""
    if not await admin_only(update):
        return
    if not context.args:
        await update.message.reply_text("❗ Foydalanish: /broadcast <xabar matni>")
        return
    text = " ".join(context.args)
    ids = all_user_ids()
    sent = failed = 0
    await update.message.reply_text(f"📡 {len(ids)} foydalanuvchiga yuborilmoqda...")
    for uid in ids:
        try:
            await context.bot.send_message(
                uid,
                f"📢 <b>VANTEGE WEAR</b>\n\n{text}\n\n🛍 " + WEBAPP_URL,
                parse_mode="HTML",
            )
            sent += 1
            await asyncio.sleep(0.05)  # flood limit
        except Exception:
            failed += 1
    await update.message.reply_html(f"✅ Yuborildi: <b>{sent}</b>\n❌ Yuborilmadi: <b>{failed}</b>")


# ---------------------------------------------------------------
# CALLBACK TUGMALAR
# ---------------------------------------------------------------
async def notify_admin(update: Update, context: ContextTypes.DEFAULT_TYPE, msg: str) -> None:
    if ADMIN_CHAT_ID:
        try:
            await context.bot.send_message(parse_chat_id(ADMIN_CHAT_ID), msg, parse_mode="HTML")
        except Exception as exc:
            logger.warning("Admin'ga xabar yuborilmadi: %s", exc)


async def callback_router(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Barcha callback tugmalar uchun umumiy router."""
    query = update.callback_query
    if not query:
        return
    data = query.data or ""
    await query.answer()

    # 📦 Buyurtmalarim
    if data == "orders":
        chat_id = update.effective_chat.id
        orders = ORDERS.get(chat_id) or ORDERS.get(str(chat_id), [])
        await query.message.reply_html(format_orders_summary(orders), reply_markup=orders_kb(orders))
        return

    # 🧾 Bitta buyurtma
    if data.startswith("order:"):
        oid = data.split(":", 1)[1]
        chat_id = update.effective_chat.id
        order = find_order(chat_id, oid)
        if order:
            await query.message.reply_html(format_order_message(order, title="Buyurtma tafsiloti"))
        else:
            await query.message.reply_text("❌ Buyurtma topilmadi.")
        return

    # 🎯 Chegirmalar
    if data == "promo":
        await cmd_promo(update, context)
        return

    # 📏 O'lchamlar
    if data == "sizes":
        await query.message.reply_html(SIZE_TABLE)
        return

    # 🚚 Yetkazib berish
    if data == "delivery":
        await query.message.reply_html(DELIVERY_TEXT)
        return

    # ❓ FAQ
    if data == "faq":
        await cmd_faq(update, context)
        return

    # 💬 Operator
    if data == "support":
        await cmd_support(update, context)
        return

    # 🛍 Admin: tasdiqlash tugmasi
    if data.startswith("admconfirm:"):
        _, oid, chat_id_s = data.split(":", 2)
        chat_id = parse_chat_id(chat_id_s)
        orders = ORDERS.get(chat_id, [])
        for o in orders:
            if str(o.get("id", "")) == oid:
                o["status"] = "confirmed"
                o["confirmed_at"] = datetime.now().isoformat(timespec="seconds")
                save_orders()
                await query.message.reply_html(f"✅ <b>Tasdiqlandi:</b> <code>{oid}</code>")
                try:
                    await context.bot.send_message(
                        chat_id,
                        f"✅ <b>Buyurtmangiz tasdiqlandi!</b>\n🧾 <code>{oid}</code>",
                        parse_mode="HTML",
                    )
                except Exception as exc:
                    logger.warning("Xaridorga xabar yuborilmadi: %s", exc)
                return
        await query.message.reply_text("❌ Topilmadi.")
        return

    # 🛍 Admin: bekor qilish tugmasi
    if data.startswith("admcancel:"):
        _, oid, chat_id_s = data.split(":", 2)
        chat_id = parse_chat_id(chat_id_s)
        orders = ORDERS.get(chat_id, [])
        for o in orders:
            if str(o.get("id", "")) == oid:
                o["status"] = "cancelled"
                o["cancelled_at"] = datetime.now().isoformat(timespec="seconds")
                save_orders()
                await query.message.reply_html(f"❌ <b>Bekor qilindi:</b> <code>{oid}</code>")
                try:
                    await context.bot.send_message(
                        chat_id,
                        f"❌ Buyurtmangiz bekor qilindi: <code>{oid}</code>",
                        parse_mode="HTML",
                    )
                except Exception as exc:
                    logger.warning("Xaridorga xabar yuborilmadi: %s", exc)
                return
        await query.message.reply_text("❌ Topilmadi.")
        return

    if data == "noop":
        return


# ---------------------------------------------------------------
# ODDIY MATN XABARLARI (support sifatida)
# ---------------------------------------------------------------
async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    register_user(update)
    u = update.effective_user
    text = update.effective_message.text or ""
    # Buyruqga o'xshamasa operatorga yo'naltirish
    await update.effective_message.reply_html(
        "💬 <b>Xabaringiz qabul qilindi!</b>\n"
        "Operator ko'radi va tez orada javob beradi ☎️\n\n"
        "🛍 Do'kon: /app · Buyurtmalar: /orders · Yordam: /help"
    )
    if ADMIN_CHAT_ID:
        try:
            await context.bot.send_message(
                parse_chat_id(ADMIN_CHAT_ID),
                f"💬 <b>Support xabari</b>\n\n"
                f"👤 {u.first_name if u else '-'} (<code>{u.id if u else '-'}</code>)\n"
                f"🔗 {'@' + u.username if u and u.username else '—'}\n\n"
                f"✉️ {text[:1000]}",
                parse_mode="HTML",
            )
        except Exception as exc:
            logger.warning("Admin'ga xabar yuborilmadi: %s", exc)


# ---------------------------------------------------------------
# /help
# ---------------------------------------------------------------
async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_html(
        "🤖 <b>BUYRUQLAR</b>\n\n"
        "🛍 <b>Do'kon:</b>\n"
        "/app — Mini App do'kon\n"
        "/catalog — mahsulotlar katalogi\n"
        "/search <matn> — qidirish\n"
        "/promo — faol chegirmalar\n\n"
        "📦 <b>Buyurtmalar:</b>\n"
        "/orders — buyurtmalarim\n"
        "/order <id> — tafsilotlari\n"
        "/cancel <id> — bekor qilish\n"
        "/profile — profil va daraja\n\n"
        "ℹ️ <b>Ma'lumot:</b>\n"
        "/sizes — o'lchamlar jadvali\n"
        "/delivery — yetkazib berish\n"
        "/faq — savol-javob\n"
        "/support <matn> — operator\n\n"
        "🤖 <b>Admin:</b>\n"
        "/stats — statistika\n"
        "/pending — yangi buyurtmalar\n"
        "/confirm <id> — tasdiqlash\n"
        "/broadcast <matn> — umumiy xabar"
    )


# ---------------------------------------------------------------
# WEB APP DATA (Mini App sendData orqali yuborgan buyurtma)
# ---------------------------------------------------------------
async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Mini App sendData orqali yuborgan buyurtma."""
    if not update.effective_message or not update.effective_message.web_app_data:
        return
    register_user(update)

    data = update.effective_message.web_app_data.data

    try:
        order = json.loads(data)
    except json.JSONDecodeError:
        await update.message.reply_text("❌ Buyurtma ma'lumotini o'qib bo'lmadi.")
        return

    chat_id = update.effective_chat.id
    order.setdefault("status", "new")
    order.setdefault("id", f"VW{int(time.time())}")
    ORDERS.setdefault(chat_id, []).append(order)
    save_orders()

    msg = format_order_message(order, title="Buyurtma qabul qilindi!")
    await update.message.reply_html(msg)
    await notify_admin(update, context, msg)


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

        order.setdefault("status", "new")
        order.setdefault("id", f"VW{int(time.time())}")

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
    # 1) Chat menu button
    await app.bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="🛍 VANTEGE WEAR",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    )

    # 2) Umumiy buyruqlar
    await app.bot.set_my_commands(
        [
            BotCommand("start", "🚀 Botni ishga tushirish"),
            BotCommand("app", "🛍 Do'kon (Mini App)"),
            BotCommand("catalog", "🛍 Mahsulotlar katalogi"),
            BotCommand("search", "🔍 Mahsulot qidirish"),
            BotCommand("promo", "🎯 Chegirmalar"),
            BotCommand("orders", "📦 Buyurtmalarim"),
            BotCommand("profile", "👤 Profil va daraja"),
            BotCommand("sizes", "📏 O'lchamlar jadvali"),
            BotCommand("delivery", "🚚 Yetkazib berish"),
            BotCommand("faq", "❓ FAQ"),
            BotCommand("support", "💬 Operator bilan bog'lanish"),
            BotCommand("help", "❔ Yordam"),
        ],
        scope=BotCommandScopeDefault(),
    )

    # 3) Admin uchun qo'shimcha buyruqlar
    if ADMIN_CHAT_ID:
        try:
            await app.bot.set_my_commands(
                [
                    BotCommand("stats", "📊 Statistika"),
                    BotCommand("pending", "⏳ Yangi buyurtmalar"),
                    BotCommand("confirm", "✅ Buyurtmani tasdiqlash"),
                    BotCommand("broadcast", "📡 Umumiy xabar yuborish"),
                ],
                scope=BotCommandScopeChat(chat_id=parse_chat_id(ADMIN_CHAT_ID)),
            )
        except Exception as exc:
            logger.warning("Admin buyruqlari o'rnatilmadi: %s", exc)

    logger.info("Menu button + buyruqlar o'rnatildi: %s", WEBAPP_URL)

    # 4) HTTP API (frontend buyurtmalar uchun)
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

    # Do'kon buyruqlari
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("app", cmd_app))
    app.add_handler(CommandHandler("orders", cmd_orders))
    app.add_handler(CommandHandler("order", cmd_order_detail))
    app.add_handler(CommandHandler("cancel", cmd_cancel))
    app.add_handler(CommandHandler("catalog", cmd_catalog))
    app.add_handler(CommandHandler("search", cmd_search))
    app.add_handler(CommandHandler("promo", cmd_promo))
    app.add_handler(CommandHandler("profile", cmd_profile))
    app.add_handler(CommandHandler("sizes", cmd_sizes))
    app.add_handler(CommandHandler("delivery", cmd_delivery))
    app.add_handler(CommandHandler("faq", cmd_faq))
    app.add_handler(CommandHandler("support", cmd_support))
    app.add_handler(CommandHandler("help", cmd_help))

    # Admin buyruqlari
    app.add_handler(CommandHandler("stats", cmd_stats))
    app.add_handler(CommandHandler("pending", cmd_pending))
    app.add_handler(CommandHandler("confirm", cmd_confirm))
    app.add_handler(CommandHandler("broadcast", cmd_broadcast))

    # Callback router (barcha tugmalar)
    app.add_handler(CallbackQueryHandler(callback_router))

    # Web App data (Mini App buyurtma)
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))

    # Oddiy matn — operator xabari sifatida
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))

    logger.info("Bot ishga tushdi...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
