'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';

export interface CheckoutItem {
  key: string;
  lookName: string;
  name: string;
  price: number;
  thumbStyle?: React.CSSProperties;
}

interface CheckoutModalProps {
  open: boolean;
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  total: number;
  onClose: () => void;
  onComplete: (info: { name: string; phone: string; address: string; cardLast4: string; orderId: string }) => void;
  onShowToast: (msg: string) => void;
}

type Errors = Partial<Record<'name' | 'phone' | 'address' | 'cardNumber' | 'cardExpiry' | 'cardCvv', string>>;

const formatCard = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const luhnOk = (num: string) => {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

export default function CheckoutModal({
  open,
  items,
  subtotal,
  discount,
  total,
  onClose,
  onComplete,
  onShowToast,
}: CheckoutModalProps) {
  const { user, addOrder } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<{ orderId: string; cardLast4: string } | null>(null);

  useEffect(() => {
    if (open) {
      setName(user?.name || '');
      setAddress(user ? `${user.city}, ` : '');
      setErrors({});
      setProcessing(false);
      setDone(null);
    }
  }, [open, user]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const texts = {
    uz: {
      title: 'Buyurtmani rasmiylashtirish',
      sub: 'To‘lov kartasi orqali xavfsiz amalga oshiriladi',
      contact: 'Aloqa ma’lumotlari',
      payment: 'Karta to‘lovi',
      fullName: 'Ism va Familiya',
      phone: 'Telefon raqam',
      address: 'Yetkazib berish manzili',
      cardNumber: 'Karta raqami',
      cardExpiry: 'Amal qilish muddati',
      cardCvv: 'CVV',
      cardHolder: 'Karta egasining ismi',
      pay: `To‘lash: $${total.toFixed(2)}`,
      secure: '256-bit shifrlash · UzCard / Humo / Visa / Mastercard',
      orderSuccess: 'Buyurtma muvaffaqiyatli rasmiylashtirildi!',
      orderId: 'Buyurtma raqami',
      tracking: 'Kuzatuv raqami',
      closeBtn: 'Yopish',
      errRequired: 'Bu maydon to‘ldirilishi shart',
      errCard: 'Karta raqami noto‘g‘ri',
      errExpiry: 'MM/YY formatida kiriting',
      errCvv: '3 ta raqam kiriting',
      processing: 'To‘lov amalga oshirilmoqda…',
      summary: 'Buyurtma tarkibi',
    },
    ru: {
      title: 'Оформление заказа',
      sub: 'Оплата производится безопасно через карту',
      contact: 'Контактные данные',
      payment: 'Оплата картой',
      fullName: 'Имя и фамилия',
      phone: 'Номер телефона',
      address: 'Адрес доставки',
      cardNumber: 'Номер карты',
      cardExpiry: 'Срок действия',
      cardCvv: 'CVV',
      cardHolder: 'Имя владельца карты',
      pay: `Оплатить: $${total.toFixed(2)}`,
      secure: '256-битное шифрование · UzCard / Humo / Visa / Mastercard',
      orderSuccess: 'Заказ успешно оформлен!',
      orderId: 'Номер заказа',
      tracking: 'Номер отслеживания',
      closeBtn: 'Закрыть',
      errRequired: 'Обязательное поле',
      errCard: 'Неверный номер карты',
      errExpiry: 'Введите в формате MM/YY',
      errCvv: 'Введите 3 цифры',
      processing: 'Обработка платежа…',
      summary: 'Состав заказа',
    },
    en: {
      title: 'Checkout',
      sub: 'Secured card payment',
      contact: 'Contact details',
      payment: 'Card payment',
      fullName: 'Full name',
      phone: 'Phone number',
      address: 'Delivery address',
      cardNumber: 'Card number',
      cardExpiry: 'Expiry date',
      cardCvv: 'CVV',
      cardHolder: 'Cardholder name',
      pay: `Pay $${total.toFixed(2)}`,
      secure: '256-bit encryption · UzCard / Humo / Visa / Mastercard',
      orderSuccess: 'Order placed successfully!',
      orderId: 'Order ID',
      tracking: 'Tracking number',
      closeBtn: 'Close',
      errRequired: 'This field is required',
      errCard: 'Invalid card number',
      errExpiry: 'Enter as MM/YY',
      errCvv: 'Enter 3 digits',
      processing: 'Processing payment…',
      summary: 'Order summary',
    },
  }[language] ?? {
    title: 'Buyurtmani rasmiylashtirish',
    sub: 'To‘lov kartasi orqali xavfsiz amalga oshiriladi',
    contact: 'Aloqa ma’lumotlari',
    payment: 'Karta to‘lovi',
    fullName: 'Ism va Familiya',
    phone: 'Telefon raqam',
    address: 'Yetkazib berish manzili',
    cardNumber: 'Karta raqami',
    cardExpiry: 'Amal qilish muddati',
    cardCvv: 'CVV',
    cardHolder: 'Karta egasining ismi',
    pay: `To‘lash: $${total.toFixed(2)}`,
    secure: '256-bit shifrlash · UzCard / Humo / Visa / Mastercard',
    orderSuccess: 'Buyurtma muvaffaqiyatli rasmiylashtirildi!',
    orderId: 'Buyurtma raqami',
    tracking: 'Kuzatuv raqami',
    closeBtn: 'Yopish',
    errRequired: 'Bu maydon to‘ldirilishi shart',
    errCard: 'Karta raqami noto‘g‘ri',
    errExpiry: 'MM/YY formatida kiriting',
    errCvv: '3 ta raqam kiriting',
    processing: 'To‘lov amalga oshirilmoqda…',
    summary: 'Buyurtma tarkibi',
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!name.trim()) e.name = texts.errRequired;
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) e.phone = texts.errRequired;
    if (!address.trim()) e.address = texts.errRequired;
    if (!luhnOk(cardNumber)) e.cardNumber = texts.errCard;
    const exp = cardExpiry.replace(/\D/g, '');
    if (exp.length !== 4 || Number(exp.slice(0, 2)) < 1 || Number(exp.slice(0, 2)) > 12) e.cardExpiry = texts.errExpiry;
    if (cardCvv.replace(/\D/g, '').length !== 3) e.cardCvv = texts.errCvv;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setProcessing(true);
    window.setTimeout(() => {
      const orderItems = items.map((it) => ({
        id: it.key,
        name: it.name,
        price: it.price,
        size: user?.sizePreference || 'L',
        quantity: 1,
      }));
      const addr = `${address.trim()} · ${phone.trim()}`;
      const ord = addOrder(orderItems, total, addr);
      const last4 = cardNumber.replace(/\D/g, '').slice(-4);
      setProcessing(false);
      setDone({ orderId: ord.id, cardLast4: last4 });
      onComplete({ name: name.trim(), phone: phone.trim(), address: address.trim(), cardLast4: last4, orderId: ord.id });
    }, 1600);
  };

  const handleCloseAfterSuccess = () => {
    onShowToast(`🎉 ${texts.orderSuccess}`);
    onClose();
  };

  const inputCls = (field: keyof Errors) => `checkout-input${errors[field] ? ' has-error' : ''}`;

  return (
    <div className="checkout-backdrop" onClick={processing ? undefined : onClose}>
      <div
        className="checkout-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={texts.title}
      >
        {!done && (
          <button className="checkout-close" type="button" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {done ? (
          <div className="checkout-success">
            <div className="checkout-success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="7 12.5 10.5 16 17 9" />
              </svg>
            </div>
            <h3>{texts.orderSuccess}</h3>
            <div className="checkout-success-grid">
              <div>
                <span>{texts.orderId}</span>
                <strong>{done.orderId}</strong>
              </div>
              <div>
                <span>{texts.tracking}</span>
                <strong>UZ-EXP-{Math.floor(1000000 + Math.random() * 9000000)}</strong>
              </div>
              <div>
                <span>{texts.cardNumber}</span>
                <strong>**** **** **** {done.cardLast4}</strong>
              </div>
              <div>
                <span>{texts.pay.split(':')[0]}</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>
            <p className="checkout-success-note">
              {language === 'uz'
                ? 'Concierge jamoasi tez orada siz bilan bog‘lanadi. Buyurtmalaringiz «Buyurtmalarim» bo‘limida saqlanadi.'
                : language === 'ru'
                ? 'Консьерж свяжется с вами в ближайшее время. Заказ доступен в разделе «Мои заказы».'
                : 'Our concierge will reach out shortly. The order is saved under “My Orders”.'}
            </p>
            <button type="button" className="checkout-submit" onClick={handleCloseAfterSuccess}>
              {texts.closeBtn}
            </button>
          </div>
        ) : (
          <>
            <div className="checkout-header">
              <div className="checkout-badge">
                <span className="checkout-badge-dot" />
                VANTEGE SECURE CHECKOUT
              </div>
              <h2>{texts.title}</h2>
              <p>{texts.sub}</p>
            </div>

            <div className="checkout-summary">
              <div className="checkout-summary-head">{texts.summary}</div>
              <div className="checkout-summary-items">
                {items.map((it) => (
                  <div className="checkout-summary-item" key={it.key}>
                    {it.thumbStyle && <div className="checkout-summary-thumb" style={it.thumbStyle} />}
                    <div className="checkout-summary-name">
                      <span>{it.name}</span>
                      <em>{it.lookName}</em>
                    </div>
                    <div className="checkout-summary-price">${it.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="checkout-summary-totals">
                <div>
                  <span>{language === 'uz' ? 'Oraliq jami' : language === 'ru' ? 'Подитог' : 'Subtotal'}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="save">
                    <span>{language === 'uz' ? '10% chegirma' : language === 'ru' ? 'Скидка 10%' : '10% bundle discount'}</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="grand">
                  <span>{language === 'uz' ? 'Jami' : language === 'ru' ? 'Итого' : 'Total'}</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="checkout-form" noValidate>
              <div className="checkout-section-title">{texts.contact}</div>

              <div className="checkout-grid-2">
                <div className="checkout-field">
                  <label>{texts.fullName}</label>
                  <input
                    className={inputCls('name')}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jasur Rahimov"
                  />
                  {errors.name && <em className="checkout-err">{errors.name}</em>}
                </div>
                <div className="checkout-field">
                  <label>{texts.phone}</label>
                  <input
                    className={inputCls('phone')}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                  />
                  {errors.phone && <em className="checkout-err">{errors.phone}</em>}
                </div>
              </div>

              <div className="checkout-field">
                <label>{texts.address}</label>
                <input
                  className={inputCls('address')}
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={language === 'uz' ? 'Toshkent, Amir Temur ko‘chasi 108, kv. 45' : 'Tashkent, Amir Temur st. 108, apt. 45'}
                />
                {errors.address && <em className="checkout-err">{errors.address}</em>}
              </div>

              <div className="checkout-section-title">{texts.payment}</div>

              <div className="checkout-card-visual">
                <div className="checkout-card-chip" />
                <div className="checkout-card-number">
                  {formatCard(cardNumber) || '•••• •••• •••• ••••'}
                </div>
                <div className="checkout-card-meta">
                  <span>{name.trim() || texts.cardHolder.toUpperCase()}</span>
                  <span>{cardExpiry || 'MM/YY'}</span>
                </div>
                <div className="checkout-card-brand">VANTEGE PAY</div>
              </div>

              <div className="checkout-field">
                <label>{texts.cardNumber}</label>
                <input
                  className={inputCls('cardNumber')}
                  type="text"
                  inputMode="numeric"
                  value={formatCard(cardNumber)}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="8600 1234 5678 9012"
                />
                {errors.cardNumber && <em className="checkout-err">{errors.cardNumber}</em>}
              </div>

              <div className="checkout-grid-2">
                <div className="checkout-field">
                  <label>{texts.cardExpiry}</label>
                  <input
                    className={inputCls('cardExpiry')}
                    type="text"
                    inputMode="numeric"
                    value={formatExpiry(cardExpiry)}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                  />
                  {errors.cardExpiry && <em className="checkout-err">{errors.cardExpiry}</em>}
                </div>
                <div className="checkout-field">
                  <label>{texts.cardCvv}</label>
                  <input
                    className={inputCls('cardCvv')}
                    type="password"
                    inputMode="numeric"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="•••"
                  />
                  {errors.cardCvv && <em className="checkout-err">{errors.cardCvv}</em>}
                </div>
              </div>

              <button type="submit" className="checkout-submit" disabled={processing}>
                {processing ? (
                  <>
                    <span className="checkout-spinner" />
                    {texts.processing}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {texts.pay}
                  </>
                )}
              </button>
              <p className="checkout-secure-note">🔒 {texts.secure}</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
