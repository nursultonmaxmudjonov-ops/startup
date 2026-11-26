'use client';

import { useEffect } from 'react';

/**
 * PWA yuklanadigan ilova sifatida o'rnatish uchun kerakli:
 * - manifest.webmanifest + ikonlar (head'da link orqali)
 * - service worker (sw.js) ro'yxatdan o'tkazish
 * - o'rnatish promptini (Android/desktop Chrome/Edge) ushlash
 */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => { });
    }

    // Safari iOS: joylashuvni aytib o'tamiz (versiya bilan yangilab turish uchun)
    // NOT: oldin bu yerda `return` bor edi — u Chrome'da ham event listenerni o'rnatb qo'yar,
    // shu tufayli ruxsat (install prompt) chiqmas edi. O'chirildi.

    // Desktop/Android "Install" prompti — A2HS (Add to Home Screen)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: Event) => {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__pwaInstallPrompt = e;
      window.dispatchEvent(new Event('pwa-install-available'));
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return null;
}
