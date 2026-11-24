'use client';

import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import Header, { type HeaderSectionId } from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import BagDrawer from '@/src/components/BagDrawer';
import TickerStrip from '@/src/components/TickerStrip';
import HandCameraControl from '@/src/components/HandCameraControl';
import AuthModal from '@/src/components/AuthModal';
import UserOrdersModal from '@/src/components/UserOrdersModal';
import { LOOKS } from '@/src/data/looks';
import { useAuth } from '@/src/context/AuthContext';

interface ShellLayoutProps {
  children: React.ReactNode;
  activeSection: HeaderSectionId;
  toastSlot?: React.ReactNode;
  ticker?: boolean;
}

export default function ShellLayout({
  children,
  activeSection,
  toastSlot,
  ticker = true,
}: ShellLayoutProps) {
  const [bag, setBag] = useState<Set<string>>(() => new Set());
  const [shownBagCount, setShownBagCount] = useState(0);
  const [bumpKey, setBumpKey] = useState(0);
  const [bagOpen, setBagOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const { user, openAuthModal } = useAuth();

  // Boshida kirishda: Loading tugagach, agar ro'yxatdan o'tmagan bo'lsa telefon orqali ro'yxatdan o'tishni so'rash
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem('vantegewear_user');
        if (!saved && !user) {
          openAuthModal('phone');
        }
      } catch {
        if (!user) openAuthModal('phone');
      }
    }, 2100);
    return () => window.clearTimeout(timer);
  }, [user, openAuthModal]);

  const bagBtnRef = useRef<HTMLButtonElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastOn(false);
    }, 2200);
  }, []);

  const launchFlyerFromEl = useCallback((thumb: HTMLElement | null) => {
    const bagBtn = bagBtnRef.current;
    if (!thumb || !bagBtn) return;
    const tr = thumb.getBoundingClientRect();
    const br = bagBtn.getBoundingClientRect();
    if (!tr.width || !br.width) return;

    const flyer = document.createElement('div');
    flyer.className = 'flyer';
    flyer.style.left = `${tr.left}px`;
    flyer.style.top = `${tr.top}px`;
    flyer.style.width = `${tr.width}px`;
    flyer.style.height = `${tr.height}px`;
    flyer.style.borderRadius = '10px';
    flyer.style.backgroundColor = 'var(--card-2)';
    flyer.style.backgroundImage = thumb.style.backgroundImage;
    flyer.style.backgroundSize = thumb.style.backgroundSize;
    flyer.style.backgroundPosition = thumb.style.backgroundPosition;
    flyer.style.opacity = '1';
    document.body.appendChild(flyer);

    void flyer.offsetWidth;

    requestAnimationFrame(() => {
      flyer.style.left = `${br.left + br.width / 2 - 6}px`;
      flyer.style.top = `${br.top + br.height / 2 - 6}px`;
      flyer.style.width = '12px';
      flyer.style.height = '12px';
      flyer.style.borderRadius = '50%';
      flyer.style.opacity = '.85';
    });

    window.setTimeout(() => {
      flyer.remove();
    }, 780);
  }, []);

  const toggleBagItem = useCallback(
    (lookIdx: number, pieceIdx: number, thumbEl: HTMLElement | null) => {
      const key = `${lookIdx}-${pieceIdx}`;
      const piece = LOOKS[lookIdx]?.pieces?.[pieceIdx];
      if (!piece) return;

      setBag((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
          setShownBagCount((c) => Math.min(c, next.size));
          setBumpKey((b) => b + 1);
          showToast(`Savatdan olib tashlandi: ${piece.name}`);
        } else {
          next.add(key);
          launchFlyerFromEl(thumbEl);
          showToast(`Savatga qo‘shildi: ${piece.name}`);
          window.setTimeout(() => {
            setShownBagCount((c) => Math.min(next.size, c + 1));
            setBumpKey((b) => b + 1);
          }, 700);
        }
        return next;
      });
    },
    [launchFlyerFromEl, showToast]
  );

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBagOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <ShellBagContext.Provider value={{ bag, toggleBagItem, showToast }}>
      <Header
        activeSection={activeSection}
        bagBtnRef={bagBtnRef}
        shownBagCount={shownBagCount}
        bumpKey={bumpKey}
        onOpenBag={() => setBagOpen(true)}
      />

      {ticker && <TickerStrip />}

      <HandCameraControl onShowToast={showToast} />

      <main>{children}</main>

      <Footer onShowToast={showToast} />

      <BagDrawer
        open={bagOpen}
        bag={bag}
        onClose={() => setBagOpen(false)}
        onRemoveItem={(li, pi) => toggleBagItem(li, pi, null)}
        onShowToast={showToast}
      />

      <AuthModal onShowToast={showToast} />
      <UserOrdersModal />

      <div id="toast" className={toastOn ? 'on' : ''} role="status" aria-live="polite">
        {toastMsg}
      </div>
      {toastSlot}
    </ShellBagContext.Provider>
  );
}

export interface ShellBagCtx {
  bag: Set<string>;
  toggleBagItem: (li: number, pi: number, el: HTMLElement | null) => void;
  showToast: (msg: string) => void;
}

export const ShellBagContext = createContext<ShellBagCtx>({
  bag: new Set(),
  toggleBagItem: () => undefined,
  showToast: () => undefined,
});

export const useShellBag = () => useContext(ShellBagContext);
