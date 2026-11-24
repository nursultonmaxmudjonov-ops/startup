'use client';

import React, { useMemo, useState } from 'react';
import { onShowToastType } from '@/src/data/shared';
import { useReveal } from '@/src/components/useReveal';
import { useLanguage } from '@/src/context/LanguageContext';

interface StoresSectionProps {
  onShowToast: onShowToastType;
}

interface Store {
  id: string;
  city: string;
  name: string;
  addr: string;
  hours: string;
  phone: string;
  status: 'open' | 'closing' | 'closed';
  flagships: boolean;
  amenities: string[];
}

const STORES: Store[] = [
  {
    id: 'st-01',
    city: 'Tashkent',
    name: 'Vantege Wear Flagship & Lab',
    addr: 'Amir Temur ko‘chasi 108, Tashkent City Mall, Level 2',
    hours: '10:00 — 23:00',
    phone: '+998 (71) 200-26-01',
    status: 'open',
    flagships: true,
    amenities: ['3D Lazer Skaner', 'Private Fitting Suite', 'Espresso Bar', 'Master Tailor'],
  },
  {
    id: 'st-02',
    city: 'Tashkent',
    name: 'Chilonzor Industrial Studio',
    addr: 'Bunyodkor shoh ko‘chasi 24 (Metro Chilonzor)',
    hours: '10:00 — 22:00',
    phone: '+998 (71) 200-26-02',
    status: 'open',
    flagships: false,
    amenities: ['Seam-Tape Repair Hub', 'Rapid Pickup Locker', 'Styling Lounge'],
  },
  {
    id: 'st-03',
    city: 'Samarkand',
    name: 'Registan Concept Space',
    addr: 'Registon maydoni yon ko‘chasi 4',
    hours: '09:30 — 21:00',
    phone: '+998 (66) 230-19-26',
    status: 'closing',
    flagships: false,
    amenities: ['Heritage Architecture Lounge', 'Archive Fitting', 'Private VIP Hour'],
  },
  {
    id: 'st-04',
    city: 'Almaty',
    name: 'Almaty VANTEGE Post Studio',
    addr: 'Dostyk ave. 132, Kok-Tobe District',
    hours: '10:00 — 22:00',
    phone: '+7 (727) 349-26-00',
    status: 'open',
    flagships: false,
    amenities: ['Mountain Weather Testing Chamber', 'Express Courier Hub', 'Fitting Room'],
  },
  {
    id: 'st-05',
    city: 'Bishkek',
    name: 'Bishkek Shell Lab',
    addr: 'Chuy ave. 214, Ala-Too Plaza',
    hours: '10:00 — 21:00',
    phone: '+996 (312) 98-26-26',
    status: 'closed',
    flagships: false,
    amenities: ['Sub-Zero Testing Room', 'Direct Try-on', 'Custom Hemming'],
  },
  {
    id: 'st-06',
    city: 'Dubai',
    name: 'Dubai Archive Corner & Hub',
    addr: 'City Walk Bldg 8, Design District Area',
    hours: '12:00 — 00:00',
    phone: '+971 (4) 890-2626',
    status: 'open',
    flagships: true,
    amenities: ['Climate Controlled Vault', 'VIP Concierge Delivery', 'Champagne Bar'],
  },
];

const CITY_FILTERS = ['All', 'Tashkent', 'Samarkand', 'Almaty', 'Bishkek', 'Dubai'] as const;

export default function StoresSection({ onShowToast }: StoresSectionProps) {
  const [city, setCity] = useState<(typeof CITY_FILTERS)[number]>('All');
  const [bookingStore, setBookingStore] = useState<Store | null>(null);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-11-20');
  const [bookingTime, setBookingTime] = useState('18:00');

  const rootRef = useReveal<HTMLElement>();
  const { t, language } = useLanguage();
  const uz = language === 'uz';

  const visible = useMemo(
    () => (city === 'All' ? STORES : STORES.filter((s) => s.city === city)),
    [city]
  );

  const openCount = STORES.filter((s) => s.status === 'open').length;

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingStore) return;
    onShowToast(`✓ ${bookingStore.name} da ${bookingDate} soat ${bookingTime} ga VIP sinov band qilindi!`);
    setBookingStore(null);
  };

  return (
    <section id="stores" ref={rootRef} aria-label="Store network">
      <div className="lb-head">
        <div>
          <span className="cat-kicker-tag">GLOBAL HUBS & FLAGSHIPS</span>
          <h2>
            {uz ? 'Bizning ' : 'Our '}
            <span>{uz ? 'Do‘konlarimiz' : 'Flagship Studios'}</span>
          </h2>
          <p className="lb-sub">
            {STORES.length} {uz ? 'do‘kon' : 'studios'} · {openCount} {uz ? 'hozir ochiq' : 'open right now'} · {uz ? 'Har birida 3D Lazer Lidar o‘lchov studiyasi mavjud' : 'Equipped with 3D LiDAR body scanner'}
          </p>
        </div>
        <span className="side-count">CENTRAL ASIA + GCC</span>
      </div>

      <div className="city-chips">
        {CITY_FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            className={`look-chip${city === c ? ' on' : ''}`}
            onClick={() => setCity(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="st-grid">
        {visible.map((s) => (
          <article key={s.id} className={`st-card reveal${s.flagships ? ' flagship' : ''}`}>
            <div className="st-top">
              <span className="st-city">{s.city}</span>
              <span className={`st-status st-${s.status}`}>
                {s.status === 'open' ? '✓ OCHIQ' : s.status === 'closing' ? '⏳ TEZ ORADA YOPILADI' : '✕ YOPILGAN'}
              </span>
            </div>
            <h3>{s.name}</h3>
            <p className="st-addr">{s.addr}</p>

            <div className="st-amenities-tags">
              {s.amenities.map((a, i) => (
                <span key={i} className="st-amenity-pill">✦ {a}</span>
              ))}
            </div>

            <div className="st-foot">
              <div>
                <span className="st-hours">🕒 {s.hours}</span>
                <span className="st-phone-num">📞 {s.phone}</span>
              </div>
              <div className="st-actions">
                <button
                  type="button"
                  className="st-route"
                  onClick={() => onShowToast(`${s.name} — Yandex & Google Xaritalarda yo‘nalish ochildi`)}
                >
                  Xarita →
                </button>
                <button
                  type="button"
                  className="st-book-btn"
                  onClick={() => setBookingStore(s)}
                >
                  VIP Band qilish
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingStore && (
        <div className="auth-modal-backdrop" onClick={() => setBookingStore(null)}>
          <div
            className="auth-modal-card booking-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="auth-modal-close"
              onClick={() => setBookingStore(null)}
              type="button"
            >
              ✕
            </button>

            <div className="booking-modal-header">
              <span className="auth-badge-pill">VIP CONCIERGE · PRIVATE TRY-ON</span>
              <h2>{bookingStore.name}</h2>
              <p className="auth-sub">
                {uz
                  ? 'Shaxsiy stilist, 3D tana lazer skaneri va espresso hamrohligida xususiy sinov seansi.'
                  : '1-on-1 private fitting room session with 3D LiDAR measurements and complimentary refreshments.'}
              </p>
            </div>

            <form onSubmit={handleBookSubmit} className="auth-form">
              <div className="auth-field">
                <label>Ismingiz:</label>
                <input
                  type="text"
                  required
                  placeholder="Jasur Alimov"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Telefon raqamingiz:</label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                />
              </div>

              <div className="auth-grid-2">
                <div className="auth-field">
                  <label>Sana:</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="auth-input-date"
                  />
                </div>
                <div className="auth-field">
                  <label>Vaqt:</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="auth-select"
                  >
                    <option value="12:00">12:00 — 13:00</option>
                    <option value="15:00">15:00 — 16:00</option>
                    <option value="18:00">18:00 — 19:00</option>
                    <option value="20:00">20:00 — 21:00 (Midnight slot)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="primary-cta">
                <span>SEANSNI TASDIQLASH</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
