import { NextResponse } from 'next/server';

/**
 * POST /api/telegram-order
 * Buyurtma ma'lumotlarini Telegram Bot API orqali adminga (bot egasiga) yuboradi.
 * Telegram chat_id'siz ham ishlaydi — xabar bot egasining shaxsiy chatiga boradi.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9261454449:AAH-FCbUCisi4Upa_x12yxnojVxNvlv-r5E';
// Bot egasining chat_id'si — /start yozganingizda bot buni saqlaydi.
// Avval bo'sh: bot foydalanuvchiga /start yozgach, uni shu yerga qo'ying.
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '';

interface OrderPayload {
  id?: string;
  name?: string;
  phone?: string;
  address?: string;
  cardLast4?: string;
  total?: number;
  items?: Array<{ name?: string; lookName?: string; price?: number; qty?: number }>;
}

function formatOrder(order: OrderPayload): string {
  const items = (order.items || [])
    .map(
      (it) =>
        `  • ${it.name || '-'}${it.lookName ? ` (${it.lookName})` : ''} × ${it.qty || 1} — $${((it.price || 0) * (it.qty || 1)).toFixed(2)}`
    )
    .join('\n');

  return (
    `✅ <b>Yangi buyurtma!</b>\n\n` +
    `🧾 <b>ID:</b> <code>${order.id || '-'}</code>\n` +
    `👤 <b>Mijoz:</b> ${order.name || '-'}\n` +
    `📞 <b>Telefon:</b> ${order.phone || '-'}\n` +
    `📍 <b>Manzil:</b> ${order.address || '-'}\n` +
    (order.cardLast4 ? `💳 <b>Karta:</b> ****${order.cardLast4}\n` : '') +
    `\n<b>Mahsulotlar:</b>\n${items}\n\n` +
    `💰 <b>Jami: $${(order.total || 0).toFixed(2)}</b>`
  );
}

export async function POST(request: Request) {
  try {
    const order = (await request.json()) as OrderPayload;
    const text = formatOrder(order);

    // 1) Adminga yuborish (ADMIN_CHAT_ID berilgan bo'lsa)
    if (ADMIN_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' }),
      });
    }

    // 2) Bot egasining shaxsiy chatiga — getUpdates orqali topilgan oxirgi chat_id
    //    (foydalanuvchi botga /start yozgan bo'lsa ishlaydi)
    try {
      const updatesRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100`);
      const updates = (await updatesRes.json()) as {
        ok: boolean;
        result?: Array<{ message?: { chat?: { id?: number } } }>;
      };
      const chatIds = new Set<number>();
      for (const u of updates.result || []) {
        if (u.message?.chat?.id) chatIds.add(u.message.chat.id);
      }
      for (const cid of chatIds) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: cid, text, parse_mode: 'HTML' }),
        });
      }
    } catch {
      // getUpdates muvaffaqiyatsiz bo'lsa (masalan polling bot bilan bog'langanda) — xatosiz davom etamiz
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }
}
