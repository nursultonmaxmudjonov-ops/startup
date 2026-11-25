'use client';

import React, { useEffect, useState, useRef } from 'react';

const DURATION_MS = 15000; // 15 soniya

const TELEMETRY_PHASES = [
  { t: 0, text: 'VANTEGE SYSTEM ARCHITECTURE INITIALIZING…' },
  { t: 2200, text: 'CALIBRATING QUANTUM GRAPHENE FIBER MATRICES…' },
  { t: 4800, text: 'ESTABLISHING SECURE TELEMETRY EDGE NODES…' },
  { t: 7200, text: 'SYNCHRONIZING CENTRAL ASIA FLAGSHIP SERVERS…' },
  { t: 9800, text: 'DEPLOYING ENCRYPTED CLIENT ACCESS PROTOCOL…' },
  { t: 12200, text: 'FINALIZING HIGH-SECURITY ONBOARDING GATEWAY…' },
  { t: 14200, text: 'ACCESS GRANTED · VANTEGE 2026' },
];

export default function StartupLoader() {
  const [gone, setGone] = useState(false);
  const [fade, setFade] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [statusText, setStatusText] = useState(TELEMETRY_PHASES[0].text);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const isLoaded = sessionStorage.getItem('vantegewear_loaded');
      const hasUser = localStorage.getItem('vantegewear_user');
      // Foydalanuvchi allaqachon ro'yxatdan o'tgan va ushbu sessiyada ko'rgan bo'lsa o'tkazib yuborish
      if (isLoaded === '1' && hasUser) {
        setGone(true);
        return;
      }
    } catch {}

    startTimeRef.current = Date.now();

    const interval = window.setInterval(() => {
      if (!startTimeRef.current) return;
      const curElapsed = Math.min(DURATION_MS, Date.now() - startTimeRef.current);
      setElapsed(curElapsed);

      // Status matnini bosqich bo'yicha yangilash
      for (let i = TELEMETRY_PHASES.length - 1; i >= 0; i--) {
        if (curElapsed >= TELEMETRY_PHASES[i].t) {
          setStatusText(TELEMETRY_PHASES[i].text);
          break;
        }
      }

      // 14.3 soniyada fade boshlanadi
      if (curElapsed >= 14300) {
        setFade(true);
      }

      // 15 soniyada to'liq tugaydi
      if (curElapsed >= DURATION_MS) {
        window.clearInterval(interval);
        setGone(true);
        try {
          sessionStorage.setItem('vantegewear_loaded', '1');
        } catch {}
        window.dispatchEvent(new CustomEvent('vantege_loader_finished'));
      }
    }, 40);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  if (gone) return null;

  const pct = Math.min(100, (elapsed / DURATION_MS) * 100);
  const secondsElapsed = (elapsed / 1000).toFixed(1);

  return (
    <div
      className={`vantege-15s-loader ${fade ? 'loader-fade-out' : ''}`}
      aria-label="Tizim yuklanmoqda"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="loader-scanlines" />
      <div className="loader-glow-orb" />

      <div className="loader-15s-content">
        {/* Top telemetry badge */}
        <div className="loader-top-badge">
          <span className="loader-pulse-dot" />
          <span className="loader-badge-mono">VANTEGE TELEMETRY · 15S BOOT SEQUENCE</span>
        </div>

        {/* Brand Monogram Mark */}
        <div className="loader-mark-wrap">
          <svg className="loader-mark-svg" width="68" height="34" viewBox="0 0 40 20" fill="none">
            <path
              d="M4 13.5C9.5 13.5 14 10.6 18.4 6.2C20.1 4.5 22.8 4 25.2 4.8L36 8.3C30.8 8.8 27.6 10.6 24.4 13.4C20.5 16.8 14.8 17.3 9.2 15.6C7.1 15 5.4 14.2 4 13.5Z"
              fill="url(#loaderGrad)"
            />
            <defs>
              <linearGradient id="loaderGrad" x1="4" y1="4" x2="36" y2="16" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" />
                <stop offset="0.5" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Wordmark */}
        <div className="loader-title-row">
          <h1 className="loader-brand-title">VANTEGE&nbsp;’26</h1>
          <span className="loader-brand-sub">HIGH-TECH LUXURY SUITE</span>
        </div>

        {/* Live Timer and Percentage */}
        <div className="loader-metrics-row">
          <div className="loader-timer-box">
            <span className="timer-label">TIME ELAPSED:</span>
            <strong className="timer-val">{secondsElapsed}s / 15.0s</strong>
          </div>
          <div className="loader-percent-box">
            <span className="percent-label">INITIALIZED:</span>
            <strong className="percent-val">{Math.round(pct)}%</strong>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="loader-bar-shell">
          <div
            className="loader-bar-progress"
            style={{ width: `${pct}%` }}
          >
            <div className="loader-bar-sheen" />
          </div>
        </div>

        {/* Live Status text */}
        <div className="loader-telemetry-status">
          <span className="status-cursor">&gt;</span>
          <span className="status-text">{statusText}</span>
        </div>

        {/* Bottom subtle specs */}
        <div className="loader-bottom-specs">
          <span>LATENCY: 12ms</span>
          <span>PROTOCOL: TLS 1.3 / E2EE</span>
          <span>LOCATION: TASHKENT HUB</span>
        </div>
      </div>
    </div>
  );
}
