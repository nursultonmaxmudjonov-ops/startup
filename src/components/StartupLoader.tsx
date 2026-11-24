'use client';

import React, { useEffect, useState } from 'react';

export default function StartupLoader() {
  const [gone, setGone] = useState(false);
  const [fade, setFade] = useState(false);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('vantegewear_loaded') === '1') {
        setGone(true);
        return;
      }
    } catch {}

    const iv = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + Math.random() * 18));
    }, 180);

    const t1 = window.setTimeout(() => setFade(true), 1300);
    const t2 = window.setTimeout(() => {
      setGone(true);
      try {
        sessionStorage.setItem('vantegewear_loaded', '1');
      } catch {}
    }, 1900);

    return () => {
      window.clearInterval(iv);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`loader-overlay${fade ? ' fade' : ''}`} aria-hidden="true">
      <div className="loader-inner">
        <svg className="loader-mark" width="54" height="27" viewBox="0 0 40 20" fill="none" aria-hidden="true">
          <path
            d="M4 13.5C9.5 13.5 14 10.6 18.4 6.2C20.1 4.5 22.8 4 25.2 4.8L36 8.3C30.8 8.8 27.6 10.6 24.4 13.4C20.5 16.8 14.8 17.3 9.2 15.6C7.1 15 5.4 14.2 4 13.5Z"
            fill="currentColor"
          />
        </svg>
        <div className="loader-wordmark">VANTEGE&nbsp;’26</div>
        <div className="loader-bar">
          <div className="loader-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <div className="loader-status">YUKLANMOQDA…</div>
      </div>
    </div>
  );
}
