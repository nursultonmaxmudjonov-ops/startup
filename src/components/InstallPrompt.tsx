'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onAvailable = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = (window as any).__pwaInstallPrompt as BeforeInstallPromptEvent | undefined;
      if (e) {
        setDeferred(e);
        setVisible(true);
      }
    };

    window.addEventListener('pwa-install-available', onAvailable);
    onAvailable();

    return () => window.removeEventListener('pwa-install-available', onAvailable);
  }, []);

  if (!visible || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setVisible(false);
    // rejected bo'lsa ham keyinchalik yana ko'rsatish uchun promptni yangilaymiz
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__pwaInstallPrompt = null;
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#111',
        color: '#f5f5f5',
        borderRadius: 14,
        padding: '12px 16px',
        boxShadow: '0 8px 30px rgba(0,0,0,.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: '92vw',
      }}
    >
      <Download size={20} />
      <span style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
        Ilovani o&apos;rnatish
      </span>
      <button
        onClick={install}
        style={{
          background: '#f5f5f5',
          color: '#111',
          border: 'none',
          borderRadius: 999,
          padding: '8px 14px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        O&apos;rnatish
      </button>
      <button
        aria-label="Yopish"
        onClick={() => setVisible(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#f5f5f5',
          cursor: 'pointer',
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}
