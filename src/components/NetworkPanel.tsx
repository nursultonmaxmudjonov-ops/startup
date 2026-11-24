'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReveal } from '@/src/components/useReveal';
import { useLanguage } from '@/src/context/LanguageContext';

interface Metric {
  label: string;
  value: number;
  suffix: string;
}

const FEED = [
  { t: '23:41', city: 'Tashkent', msg: 'Flagship — Try-On Studio 2 kabinet band, Cobalt Shell kiyilmoqda' },
  { t: '23:38', city: 'Almaty', msg: 'VANTEGE Post — yangi Storm Hooded Shell keldi (12 dona)' },
  { t: '23:31', city: 'Tashkent', msg: 'Chilonzor — VIP VANTEGE List a’zosi 3 dona buyurtma berdi' },
  { t: '23:24', city: 'Samarkand', msg: 'Registan Concept — 3D lazer skaner kalibratsiyasi muvaffaqiyatli' },
  { t: '23:19', city: 'Tashkent', msg: 'Tarmoq sinxronizatsiya: barcha 6 do‘kon va markaziy ombor ONLINE' },
  { t: '23:14', city: 'Dubai', msg: 'City Walk Hub — 4 dona Mirror Down Parka jo‘natildi' },
  { t: '23:07', city: 'Bishkek', msg: 'Shell Lab — ertangi -14°C sovuq sinovlariga tayyor' },
];

interface WeatherStation {
  city: string;
  temp: string;
  weather: string;
  wind: string;
  advisory: string;
  recommendedGarment: string;
}

const WEATHER_TELEMETRY: WeatherStation[] = [
  {
    city: 'Tashkent',
    temp: '+9°C',
    weather: 'Yomg‘ir & Tuman',
    wind: '18 km/h',
    advisory: 'Namlik 88% · Kuchli yomg‘ir yog‘moqda',
    recommendedGarment: 'Cobalt Rain Shell (25,000mm)',
  },
  {
    city: 'Samarkand',
    temp: '+5°C',
    weather: 'Sovuq shamol',
    wind: '24 km/h',
    advisory: 'Kechasi -2°C gacha tushadi',
    recommendedGarment: 'Hooded Long Parka',
  },
  {
    city: 'Almaty',
    temp: '-3°C',
    weather: 'Qor & Muz',
    wind: '12 km/h',
    advisory: 'Tog‘dan esuvchi qor shamoli',
    recommendedGarment: 'Glacier Puffer Jacket',
  },
  {
    city: 'Bishkek',
    temp: '-6°C',
    weather: 'Kuchli qor',
    wind: '15 km/h',
    advisory: 'Sub-zero sharoit',
    recommendedGarment: 'Mirror Down Parka',
  },
  {
    city: 'Dubai',
    temp: '+22°C',
    weather: 'Ochiq osmon',
    wind: '8 km/h',
    advisory: 'Mo‘tadil tungi shabada',
    recommendedGarment: 'Violet Tech Anorak',
  },
];

function useCountUp(target: number, run: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return val;
}

function MetricCell({ m, run }: { m: Metric; run: boolean }) {
  const v = useCountUp(m.value, run);
  return (
    <div className="nw-metric reveal">
      <span className="nw-metric-val">
        {v.toLocaleString('en-US')}
        {m.suffix}
      </span>
      <span className="nw-metric-label">{m.label}</span>
    </div>
  );
}

export default function NetworkPanel() {
  const rootRef = useReveal<HTMLElement>();
  const { language } = useLanguage();
  const uz = language === 'uz';

  const [runCounters, setRunCounters] = useState(false);
  const [feedIdx, setFeedIdx] = useState(0);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const METRICS: Metric[] = [
    { label: uz ? 'Do‘konlar tarmog‘i' : 'Global Hubs', value: 6, suffix: '' },
    { label: uz ? 'Faol mijozlar soni' : 'Active Shell Wearers', value: 48200, suffix: '+' },
    { label: uz ? 'Oylik Try-On sessiyalari' : 'Monthly 3D Fitting Sessions', value: 1240, suffix: '' },
    { label: uz ? 'Tizim barqarorligi (Uptime)' : 'Telemetry Uptime', value: 99.98, suffix: '%' },
  ];

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRunCounters(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setFeedIdx((i) => i + 1);
    }, 2600);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const visible = [0, 1, 2].map((k) => FEED[(feedIdx + k) % FEED.length]);

  return (
    <section id="network-data" ref={rootRef} aria-label="Data network panel">
      <div className="nw-head">
        <div>
          <span className="cat-kicker-tag">GLOBAL IOT & TELEMETRY</span>
          <h2>
            Data<span>Network</span>
          </h2>
          <p className="lb-sub">
            {uz
              ? 'Barcha do‘konlar, sensorlar va omborlar yagona telemetriya tarmog‘ida: zaxira, ob-havo tavsiyasi va kuryer oqimi real vaqtda.'
              : 'Real-time telemetry linking our 6 flagship labs, atmospheric sensors, and autonomous order fulfillment.'}
          </p>
        </div>
        <span className="side-count nw-live">
          <i className="nw-pulse" /> LIVE TELEMETRY STREAM
        </span>
      </div>

      <div className="nw-stats" ref={statsRef}>
        {METRICS.map((m) => (
          <MetricCell key={m.label} m={m} run={runCounters} />
        ))}
      </div>

      {/* Atmospheric Weather Telemetry Advisory Grid */}
      <div className="nw-weather-grid">
        <div className="nw-weather-head">
          <h3>
            {uz ? 'Jonli Meva Sensorlari va Kiyim Tavsiyasi' : 'Atmospheric Sensors & Garment Advisory'}
          </h3>
          <span className="dim-sub">Sensor Ping: 18ms</span>
        </div>

        <div className="weather-cards-strip">
          {WEATHER_TELEMETRY.map((w) => (
            <div key={w.city} className="weather-station-card">
              <div className="ws-top">
                <span className="ws-city">{w.city}</span>
                <span className="ws-temp">{w.temp}</span>
              </div>
              <div className="ws-condition">{w.weather} · {w.wind}</div>
              <div className="ws-advisory">{w.advisory}</div>
              <div className="ws-recom">
                <span className="ws-recom-lbl">Tavsiya kiyim:</span>
                <strong>{w.recommendedGarment}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time terminal console */}
      <div className="nw-console reveal">
        <div className="nw-console-bar">
          <span className="nw-dot" />
          <span className="nw-dot nw-dot-amber" />
          <span className="nw-dot nw-dot-green" />
          <span className="nw-console-title">vantege-wear://telemetry/node-tashkent-hub — live websocket feed</span>
        </div>
        <ul className="nw-feed">
          {visible.map((f, k) => (
            <li key={`${f.t}-${k}`} className="nw-feed-item" style={{ animationDelay: `${k * 120}ms` }}>
              <span className="nw-feed-time">{f.t}</span>
              <span className="nw-feed-city">{f.city}</span>
              <span className="nw-feed-msg">{f.msg}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
