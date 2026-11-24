'use client';

import React, { useState } from 'react';
import { LOOKS, getThumbCropStyle } from '@/src/data/looks';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import CheckoutModal, { type CheckoutItem } from '@/src/components/CheckoutModal';

interface BagDrawerProps {
  open: boolean;
  bag: Set<string>;
  onClose: () => void;
  onRemoveItem: (lookIdx: number, pieceIdx: number) => void;
  onShowToast: (msg: string) => void;
}

export default function BagDrawer({
  open,
  bag,
  onClose,
  onRemoveItem,
  onShowToast,
}: BagDrawerProps) {
  const [sweeping, setSweeping] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { t, language } = useLanguage();
  const { user, openAuthModal, addOrder } = useAuth();

  const items = Array.from(bag).map((key) => {
    const [li, pi] = key.split('-').map(Number);
    return { key, li, pi, look: LOOKS[li], piece: LOOKS[li].pieces[pi] };
  });

  const subtotal = items.reduce((acc, it) => acc + it.piece.price, 0);
  let discount = 0;
  for (let i = 0; i < LOOKS.length; i++) {
    if (bag.has(`${i}-0`) && bag.has(`${i}-1`)) {
      discount += (LOOKS[i].pieces[0].price + LOOKS[i].pieces[1].price) * 0.1;
    }
  }
  const total = subtotal - discount;

  const handleCheckout = () => {
    setSweeping(false);
    requestAnimationFrame(() => setSweeping(true));
    if (bag.size === 0) {
      onShowToast(language === 'uz' ? 'Savatingiz bo‘sh' : 'Your bag is empty');
      return;
    }

    if (!user) {
      onShowToast(language === 'uz' ? 'Buyurtma berish uchun telefon raqamingiz bilan ro‘yxatdan o‘ting' : 'Please sign in with your phone to complete checkout');
      openAuthModal('phone');
      return;
    }

    setCheckoutOpen(true);
  };

  const checkoutItems: CheckoutItem[] = items.map((it) => ({
    key: it.key,
    lookName: it.look.name,
    name: it.piece.name,
    price: it.piece.price,
    thumbStyle: getThumbCropStyle(it.look.url, it.piece.crop, 54, 67.5),
  }));

  return (
    <>
      <div
        id="bagBackdrop"
        className={open ? 'on' : ''}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside id="bagDrawer" className={open ? 'on' : ''} aria-label="Shopping bag">
        <div className="bag-hdr">
          <h3>
            {language === 'uz' ? 'Xarid ' : language === 'ru' ? 'Ваша ' : 'Your '}
            <span>{language === 'uz' ? 'Savatingiz' : language === 'ru' ? 'Корзина' : 'Bag'}</span>
          </h3>
          <button className="bag-close" type="button" onClick={onClose} aria-label="Close bag">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <line x1="3" y1="3" x2="11" y2="11" />
              <line x1="11" y1="3" x2="3" y2="11" />
            </svg>
          </button>
        </div>

        <div id="bagItems">
          {items.length === 0 ? (
            <div className="bag-empty">
              {language === 'uz' ? (
                <>
                  Savatingiz hozircha bo‘sh.
                  <br />
                  Runway yoki Katalogdan kiyimlarni tanlang.
                </>
              ) : language === 'ru' ? (
                <>
                  Корзина пуста.
                  <br />
                  Нажмите + на любой модели в Подиуме или Каталоге.
                </>
              ) : (
                <>
                  Your bag is empty.
                  <br />
                  Tap + on any piece in the runway or catalog.
                </>
              )}
            </div>
          ) : (
            items.map(({ key, li, pi, look, piece }) => (
              <div className="bag-item" key={key}>
                <div
                  className="bag-item-thumb"
                  style={getThumbCropStyle(look.url, piece.crop, 54, 67.5)}
                />
                <div className="bag-item-info">
                  <div className="bag-item-look">{look.name}</div>
                  <div className="bag-item-name">{piece.name}</div>
                  <div className="bag-item-price">${piece.price.toFixed(2)}</div>
                </div>
                <button
                  type="button"
                  className="slot-rm"
                  aria-label={`Remove ${piece.name}`}
                  onClick={() => onRemoveItem(li, pi)}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
                    <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bag-foot">
          <div className="bag-line">
            <span>{language === 'uz' ? 'Oraliq jami' : language === 'ru' ? 'Подитог' : 'Subtotal'}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="bag-line save">
              <span>{language === 'uz' ? '10% To‘liq Look chegirmasi' : '10% Look Bundle Savings'}</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="bag-total">
            <span>{t.total}</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button
            className="primary-cta"
            id="checkoutBtn"
            type="button"
            onClick={handleCheckout}
          >
            <span className={`sweep${sweeping ? ' go' : ''}`} />
            <span className="btn-txt">{t.checkout.toUpperCase()}</span>
          </button>
        </div>
      </aside>

      <CheckoutModal
        open={checkoutOpen}
        items={checkoutItems}
        subtotal={subtotal}
        discount={discount}
        total={total}
        onClose={() => setCheckoutOpen(false)}
        onComplete={() => undefined}
        onShowToast={onShowToast}
      />
    </>
  );
}
