'use client';

import React, { useMemo, useState } from 'react';
import { onShowToastType } from '@/src/data/shared';
import { useReveal } from '@/src/components/useReveal';
import { useLanguage } from '@/src/context/LanguageContext';

interface StoresSectionProps {
  onShowToast: onShowToastType;
}

export interface Store {
  id: string;
  city: string;
  name: string;
  addr: string;
  metro?: string;
  hours: string;
  phone: string;
  status: 'open' | 'closing' | 'closed';
  flagships: boolean;
  spaceM2: number;
  suitesCount: number;
  scannerType: string;
  latLng: string;
  amenities: string[];
  description: string;
}

const STORES: Store[] = [
  {
    id: 'st-01',
    city: 'Tashkent',
    name: 'Vantege Wear Flagship & 3D Lab',
    addr: 'Amir Temur ko‘chasi 108, Tashkent City Mall, Level 2',
    metro: 'Metro: Paxtakor / O‘zbekiston',
    hours: '10:00 — 23:00',
    phone: '+998 (71) 200-26-01',
    status: 'open',
    flagships: true,
    spaceM2: 480,
    suitesCount: 4,
    scannerType: 'LiDAR Dual-Array 0.2mm',
    latLng: '41.31108, 69.24056',
    amenities: ['3D Lazer Skaner', 'Private VIP Fitting Suite', 'Espresso Bar', 'Master Tailor Studio', 'Valet Parking'],
    description: 'Bizning markaziy flagmanimiz. 3D tana skaneri, sovuq shamol simulyatori va xususiy qabul xonalari bilan jihozlangan.',
  },
  {
    id: 'st-02',
    city: 'Tashkent',
    name: 'Chilonzor Industrial Atelier & Archive',
    addr: 'Bunyodkor shoh ko‘chasi 24 (Metro Chilonzor)',
    metro: 'Metro: Chilonzor',
    hours: '10:00 — 22:00',
    phone: '+998 (71) 200-26-02',
    status: 'open',
    flagships: false,
    spaceM2: 320,
    suitesCount: 3,
    scannerType: 'Optical Photogrammetry v3',
    latLng: '41.27210, 69.20430',
    amenities: ['Seam-Tape Repair Hub', 'Rapid 15-min Pickup Locker', 'Styling Lounge', 'Hardware Swap'],
    description: 'Tikuvlarni ultratovushli qayta yopishtirish, ta’mirlash va zudlik bilan olib ketish uchun ixtisoslashgan texnik markaz.',
  },
  {
    id: 'st-03',
    city: 'Samarkand',
    name: 'Registan Heritage Concept Space',
    addr: 'Registon maydoni yon ko‘chasi 4, Tarixiy markaz',
    metro: 'Markaziy avtovokzal: 10 min',
    hours: '09:30 — 21:00',
    phone: '+998 (66) 230-19-26',
    status: 'closing',
    flagships: false,
    spaceM2: 260,
    suitesCount: 2,
    scannerType: 'Mobile LiDAR Pod',
    latLng: '39.65470, 66.97580',
    amenities: ['Heritage Architecture Lounge', 'Archive Fitting Room', 'Private VIP Hour', 'Cold Brew Bar'],
    description: 'Qadimiy shahar arxitekturasi va zamonaviy grafen kurtkalarining uyg‘unligi namoyish etilgan konseptual makon.',
  },
  {
    id: 'st-04',
    city: 'Bukhara',
    name: 'Bukhara Caravan Lab & Vault',
    addr: 'Naqshbandiy ko‘chasi 88, Ark qal’asi ro‘parasi',
    metro: 'Buxoro 1 temir yo‘l vokzali',
    hours: '10:00 — 20:30',
    phone: '+998 (65) 221-26-88',
    status: 'open',
    flagships: false,
    spaceM2: 210,
    suitesCount: 2,
    scannerType: 'Spatial Depth Mesh v2',
    latLng: '39.77470, 64.42860',
    amenities: ['Desert Wind Testing Chamber', 'Private Try-On', 'Express Delivery Hub'],
    description: 'Cho‘l chang-to‘foni va kuchli quyosh nurlariga chidamlilikni sinovdan o‘tkazish stansiyasi va kiyim ombori.',
  },
  {
    id: 'st-05',
    city: 'Almaty',
    name: 'Almaty Kok-Tobe Studio & Alpine Lab',
    addr: 'Dostyk ave. 132, Kok-Tobe District',
    metro: 'Metro: Abay',
    hours: '10:00 — 22:00',
    phone: '+7 (727) 349-26-00',
    status: 'open',
    flagships: true,
    spaceM2: 410,
    suitesCount: 4,
    scannerType: 'LiDAR Dual-Array 0.2mm',
    latLng: '43.23894, 76.94546',
    amenities: ['Mountain Weather Testing Chamber (-18°C)', 'Express Courier Hub', 'VIP Fitting Room', 'Ski-Shell Tuner'],
    description: 'Tyan-Shan tog‘ etaklaridagi eng yirik markazimiz. Sub-nol haroratlarda matoning issiqlikni saqlashini sinovchi kamera bilan jihozlangan.',
  },
  {
    id: 'st-06',
    city: 'Astana',
    name: 'Astana North Wind Pavilion',
    addr: 'Mangilik El ave. 55, EXPO Business District',
    metro: 'LRT Stansiyasi: EXPO',
    hours: '10:00 — 22:00',
    phone: '+7 (7172) 79-26-26',
    status: 'open',
    flagships: false,
    spaceM2: 340,
    suitesCount: 3,
    scannerType: 'LiDAR Spatial Sensor',
    latLng: '51.09080, 71.41830',
    amenities: ['Extreme Blizzards Wind Chamber (65 km/h)', 'Heated Fitting Suite', 'Direct Try-on Locker'],
    description: 'Ostonaning kuchli qishki izg‘irinlariga qarshi kiyimlar sinovi va shaxsiy o‘lchov studiyasi.',
  },
  {
    id: 'st-07',
    city: 'Bishkek',
    name: 'Bishkek Ala-Too Shell Lab',
    addr: 'Chuy ave. 214, Ala-Too Plaza, 1-qavat',
    metro: 'Markaziy vokzal: 15 min',
    hours: '10:00 — 21:00',
    phone: '+996 (312) 98-26-26',
    status: 'closed',
    flagships: false,
    spaceM2: 250,
    suitesCount: 2,
    scannerType: 'Optical Mesh v3',
    latLng: '42.87460, 74.56980',
    amenities: ['Sub-Zero Testing Room', 'Direct Try-on', 'Custom Hemming & Laser Trim'],
    description: 'Bishkek shahri markazidagi rasmiy do‘kon va mijozlarga moslashtirish ustaxonasi.',
  },
  {
    id: 'st-08',
    city: 'Dubai',
    name: 'Dubai Archive Vault & Design District Hub',
    addr: 'City Walk Bldg 8, Design District Area',
    metro: 'Metro: Burj Khalifa / Dubai Mall',
    hours: '12:00 — 00:00',
    phone: '+971 (4) 890-2626',
    status: 'open',
    flagships: true,
    spaceM2: 520,
    suitesCount: 5,
    scannerType: 'LiDAR Ultra-Precision 0.1mm',
    latLng: '25.20780, 55.26320',
    amenities: ['Climate Controlled Vault', 'VIP Concierge Delivery', 'Champagne Bar', 'Midnight Fitting Sessions'],
    description: 'Yaqin Sharqdagi bosh markazimiz. Kechki soat 00:00 gacha xizmat ko‘rsatuvchi xususiy VIP lojalar va kuryerlik xizmati.',
  },
  {
    id: 'st-09',
    city: 'Doha',
    name: 'Doha The Pearl Concept Corner',
    addr: 'Porto Arabia Boardwalk, Tower 22',
    metro: 'Metro: Legtaifiya / Pearl Tram',
    hours: '13:00 — 23:00',
    phone: '+974 4499-2626',
    status: 'open',
    flagships: false,
    spaceM2: 290,
    suitesCount: 3,
    scannerType: 'LiDAR Spatial v2',
    latLng: '25.36980, 51.55100',
    amenities: ['Private Waterfront Fitting', 'Humidity Testing Chamber', 'VIP Concierge'],
    description: 'Fors ko‘rfazi sohilidagi premium tajriba zali. Issiq va nam iqlim uchun yengil nafas oluvchi membranalar ko‘rgazmasi.',
  },
];

const CITY_FILTERS = ['All', 'Tashkent', 'Samarkand', 'Bukhara', 'Almaty', 'Astana', 'Bishkek', 'Dubai', 'Doha'] as const;

export default function StoresSection({ onShowToast }: StoresSectionProps) {
  const [city, setCity] = useState<(typeof CITY_FILTERS)[number]>('All');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyFlagships, setOnlyFlagships] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [bookingStore, setBookingStore] = useState<Store | null>(null);
  const [tourStore, setTourStore] = useState<Store | null>(null);

  // Booking form state
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-11-26');
  const [bookingTime, setBookingTime] = useState('18:00');
  const [bookingService, setBookingService] = useState('Full 3D LiDAR Body Scan & Styling');
  const [bookingStylist, setBookingStylist] = useState('Aziz Karimov (Head Architect)');

  // FAQ state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const rootRef = useReveal<HTMLElement>();
  const { language } = useLanguage();
  const uz = language === 'uz';

  const visible = useMemo(() => {
    return STORES.filter((s) => {
      if (city !== 'All' && s.city !== city) return false;
      if (onlyOpen && s.status !== 'open') return false;
      if (onlyFlagships && !s.flagships) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesCity = s.city.toLowerCase().includes(q);
        const matchesAddr = s.addr.toLowerCase().includes(q);
        const matchesAmenities = s.amenities.some((a) => a.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesAddr && !matchesAmenities) return false;
      }
      return true;
    });
  }, [city, onlyOpen, onlyFlagships, searchQuery]);

  const openCount = STORES.filter((s) => s.status === 'open').length;
  const totalSuites = STORES.reduce((sum, s) => sum + s.suitesCount, 0);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingStore) return;
    onShowToast(`✓ ${bookingStore.name} da ${bookingDate} soat ${bookingTime} ga "${bookingService}" tasdiqlandi! SMS yuborildi.`);
    setBookingStore(null);
    setBookingName('');
    setBookingPhone('');
  };

  const FAQS = [
    {
      q: uz ? 'Do‘konga borishdan oldin oldindan navbat olish shartmi?' : 'Do I need to book an appointment before visiting?',
      a: uz
        ? 'Yo‘q, umumiy ko‘rgazma zallarimizga istalgan vaqtda kelishingiz mumkin. Biroq 3D Lazer Skaner va xususiy stilist xonasidan foydalanish uchun VIP seansni oldindan band qilish qulayroq — kutish vaqti 0 daqiqa bo‘ladi.'
        : 'Walk-ins are always welcome in our main galleries. However, to experience the 3D LiDAR scanner and private styling suite with zero wait time, we recommend reserving a VIP session in advance.',
    },
    {
      q: uz ? '3D Lazer Lidar o‘lchov skaneri qanday ishlaydi?' : 'How does the 3D LiDAR body scanner work?',
      a: uz
        ? 'Skaner 14 ta infraqizil sensor yordamida tanangizning 180 dan ortiq anatomik o‘lchamlarini 45 soniyada 0.2mm aniqlikda raqamlashtiradi. Natijada sizning qaddingizga mukammal tushadigan kurtka o‘lchami (S, M, L yoki maxsus uzunlik) aniqlanadi.'
        : 'The optical scanner uses 14 infrared sensors to capture over 180 anatomical measurement points in 45 seconds at 0.2mm precision, pinpointing your exact ergonomic silhouette.',
    },
    {
      q: uz ? 'Oldin sotib olingan VANTEGE kurtkalarni do‘konga ta’mirlashga olib kelsa bo‘ladimi?' : 'Can I bring previously purchased jackets for service or repair?',
      a: uz
        ? 'Albatta! Har bir VANTEGE kurtkasi umrbod bepul tikuv kafolatiga ega. Seam-Tape choklarini yangilash, DWR gidrofob qatlamini qayta purkash yoki furnituralarni almashtirish uchun istalgan Flagman do‘konimizga olib kelishingiz mumkin.'
        : 'Yes! Every VANTEGE shell includes lifetime seam-tape warranty. Bring your piece to any Flagship Atelier for ultrasonic re-welding, DWR re-impregnation, or hardware replacement.',
    },
    {
      q: uz ? 'Do‘konlarda xususiy VIP kiyinish xonalari bormi?' : 'Are there private fitting suites available for clients?',
      a: uz
        ? 'Ha, barcha flagmanlarimizda to‘liq ovoz izolyatsiyalangan, shaxsiy yorug‘lik simulyatorlari (Kunduzgi quyosh, Tungi neon, Yomg‘irli oqshom) va qulay ichimliklar bariga ega bo‘lgan xususiy VIP suitlar mavjud.'
        : 'Yes, each flagship features fully soundproofed private suites equipped with multi-spectrum lighting simulators (Daylight, Night Neon, Overcast Rain) and complimentary refreshments.',
    },
    {
      q: uz ? 'Do‘kondan to‘g‘ridan-to‘g‘ri mehmonxona yoki ofisga yetkazib berish xizmati mavjudmi?' : 'Can garments be delivered directly from the store to a hotel or residence?',
      a: uz
        ? 'Ha. Toshkent, Olmaota va Dubay shaharlarida tanlangan kiyimni xarid qilganingizdan so‘ng 90 daqiqa ichida shaxsiy kuryerimiz orqali maxsus germetik g‘ilofda xohlagan manzilingizga yetkazib beramiz.'
        : 'Yes. In Tashkent, Almaty, and Dubai, our white-glove concierge delivers tailored garments in sealed protective cases within 90 minutes directly to your door.',
    },
    {
      q: uz ? 'To‘lov usullari qanday qabul qilinadi?' : 'What payment methods are supported at studios?',
      a: uz
        ? 'Barcha xalqaro va mahalliy to‘lovlar: Uzcard, Humo, Visa, Mastercard, Apple Pay, Google Pay hamda kripto to‘lovlar (USDT / TON) qo‘llab-quvvatlanadi.'
        : 'All payment gateways: Uzcard, Humo, Visa, Mastercard, Apple Pay, Google Pay, and on-chain USDT / TON transfers are processed securely.',
    },
  ];

  return (
    <section id="stores" ref={rootRef} aria-label="Store network" className="stores-section-expanded">
      {/* Header */}
      <div className="lb-head">
        <div>
          <span className="cat-kicker-tag">GLOBAL HUBS & BESPOKE STUDIOS</span>
          <h2>
            {uz ? 'Bizning ' : 'Our '}
            <span>{uz ? 'Flagman Do‘konlarimiz' : 'Flagship Studios'}</span>
          </h2>
          <p className="lb-sub">
            {uz
              ? 'Markaziy Osiyo va Yaqin Sharq bo‘ylab 9 ta texnologik studiya · Har birida 3D Lazer Lidar o‘lchov va ultratovushli tikuv ustaxonasi.'
              : '9 state-of-the-art spatial studios across Central Asia & Middle East · Equipped with 3D LiDAR scanners & ultrasonic seam-welding.'}
          </p>
        </div>
        <span className="side-count">9 GLOBAL NODES · 2026 ACTIVE</span>
      </div>

      {/* Meta ticker */}
      <div className="section-meta-ticker">
        <div className="ticker-node">
          <span className="dot" />
          <span>{openCount} / {STORES.length} {uz ? 'Do‘kon hozir ochiq' : 'Studios Open Now'}</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-node">
          <span>🎯 {totalSuites} {uz ? 'ta xususiy sinov xonasi' : 'Private Suites'}</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-node">
          <span>⚡ {uz ? '3D Skaner aniqligi: 0.2mm' : 'LiDAR Accuracy: 0.2mm'}</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-node">
          <span>☕ {uz ? 'Specialty Qahva & VIP Lojalar' : 'Complimentary Specialty Coffee'}</span>
        </div>
      </div>

      {/* Interactive Global Radar Map Navigator */}
      <div className="stores-radar-container reveal">
        <div className="stores-radar-header">
          <div>
            <h3 style={{ fontSize: '18px', color: '#fff', margin: '0 0 4px', fontWeight: 700 }}>
              🌐 {uz ? 'Global Studiyalar Radari va Telemetriyasi' : 'Global Studio Radar & Spatial Nodes'}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {uz ? 'Studiyani tanlang va uning joylashuvi, ish vaqti va sensorlarini ko‘ring:' : 'Select any node to view real-time studio telemetry and local conditions:'}
            </p>
          </div>
          <span className="node-ping-badge">LIVE PING: 16ms</span>
        </div>

        <div className="radar-map-wrapper">
          {STORES.slice(0, 4).map((st) => (
            <div
              key={st.id}
              className={`radar-node-card ${city === st.city ? 'active' : ''}`}
              onClick={() => {
                setCity(st.city as any);
                onShowToast(`${st.name} — Tanlandi (${st.city})`);
              }}
            >
              <div className="radar-node-top">
                <span className="node-city-title">{st.city} · {st.name.split(' ')[0]}</span>
                <span className={`st-status st-${st.status}`}>
                  {st.status === 'open' ? 'ONLINE' : st.status === 'closing' ? 'CLOSING' : 'OFFLINE'}
                </span>
              </div>
              <div className="radar-node-specs">
                <span>📍 {st.addr.slice(0, 38)}...</span>
                <span>📐 {st.spaceM2} m² · {st.suitesCount} {uz ? 'ta VIP xona' : 'VIP Suites'}</span>
                <span>🔬 {st.scannerType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`look-chip ${onlyOpen ? 'on' : ''}`}
            onClick={() => setOnlyOpen(!onlyOpen)}
            style={{ fontSize: '11px' }}
          >
            {onlyOpen ? '✓ ' : ''}{uz ? 'Faqat ochiqlar' : 'Open Now Only'}
          </button>
          <button
            type="button"
            className={`look-chip ${onlyFlagships ? 'on' : ''}`}
            onClick={() => setOnlyFlagships(!onlyFlagships)}
            style={{ fontSize: '11px' }}
          >
            {onlyFlagships ? '✓ ' : ''}⭐ Flagships
          </button>

          <input
            type="text"
            placeholder={uz ? 'Do‘kon nomi yoki manzil...' : 'Search store or address...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '999px',
              padding: '6px 14px',
              color: '#fff',
              fontSize: '11px',
              outline: 'none',
              minWidth: '180px',
            }}
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="st-grid">
        {visible.map((s) => (
          <article key={s.id} className={`st-card reveal${s.flagships ? ' flagship' : ''}`}>
            <div className="st-top">
              <span className="st-city">
                {s.city} {s.flagships && <strong style={{ color: '#3b82f6', marginLeft: '6px' }}>★ FLAGSHIP</strong>}
              </span>
              <span className={`st-status st-${s.status}`}>
                {s.status === 'open' ? '✓ OCHIQ' : s.status === 'closing' ? '⏳ TEZ ORADA YOPILADI' : '✕ YOPILGAN'}
              </span>
            </div>

            <h3 style={{ fontSize: '17px', margin: '8px 0 6px' }}>{s.name}</h3>
            <p className="st-addr">{s.addr}</p>
            {s.metro && (
              <p style={{ fontSize: '11px', color: '#64748b', margin: '-4px 0 10px' }}>
                🚇 {s.metro}
              </p>
            )}

            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.45, marginBottom: '14px' }}>
              {s.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '14px', fontSize: '11px', color: '#cbd5e1' }}>
              <div>🏢 Maydoni: <strong>{s.spaceM2} m²</strong></div>
              <div>🚪 VIP Suitlar: <strong>{s.suitesCount} ta</strong></div>
              <div style={{ gridColumn: 'span 2' }}>🔬 Skaner: <strong style={{ color: '#60a5fa' }}>{s.scannerType}</strong></div>
            </div>

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
                  onClick={() => setTourStore(s)}
                  title="3D Virtual Sayr"
                >
                  👁️ {uz ? 'Virtual Sayr' : 'Tour'}
                </button>
                <button
                  type="button"
                  className="st-route"
                  onClick={() => onShowToast(`Xaritalarda yo‘nalish: ${s.name} (${s.latLng})`)}
                >
                  {uz ? 'Xarita →' : 'Map →'}
                </button>
                <button
                  type="button"
                  className="st-book-btn"
                  onClick={() => {
                    setBookingStore(s);
                  }}
                >
                  {uz ? 'VIP Band qilish' : 'Book VIP'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
          <p style={{ fontSize: '16px' }}>Qidiruv bo‘yicha do‘kon topilmadi.</p>
          <button
            type="button"
            className="secondary-btn-border"
            onClick={() => {
              setCity('All');
              setOnlyOpen(false);
              setOnlyFlagships(false);
              setSearchQuery('');
            }}
          >
            Filtrlarni tozalash
          </button>
        </div>
      )}

      {/* 4-Step Studio Experience Workflow */}
      <div className="studio-experience-section reveal">
        <div className="exp-heading-row">
          <span className="cat-kicker-tag">THE BESPOKE TRY-ON JOURNEY</span>
          <h3>{uz ? 'Do‘konga Tashrif: 4 Bosqichli Ilmiy Jarayon' : 'The 4-Step In-Store Bespoke Process'}</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '640px', margin: '0 auto' }}>
            {uz
              ? 'Oddiy kiyim do‘konlaridan farqli ravishda, bizda har bir mehmonga shaxsiy laboratoriya muhandisi va individual kiyinish xonasi ajratiladi.'
              : 'Beyond ordinary shopping: each client is guided through a custom fitting journey powered by spatial optics.'}
          </p>
        </div>

        <div className="exp-steps-grid">
          <div className="exp-step-card">
            <div className="exp-step-num">01</div>
            <h4>{uz ? '3D Lidar Tana Skanerlash' : '3D LiDAR Body Scan'}</h4>
            <p>
              {uz
                ? 'Infraqizil to‘lqinlar 45 soniyada 180 ta koordinatada tana o‘lchamlarini oladi. Yelka kengligi, qo‘l uzunligi va harakat trayektoriyasi hisoblanadi.'
                : '14 infrared depth sensors build your digital volumetric twin in 45 seconds to determine your exact sleeve articulation.'}
            </p>
          </div>

          <div className="exp-step-card">
            <div className="exp-step-num">02</div>
            <h4>{uz ? 'Shamol va Sovuq Sinov Xonasi' : 'Sub-Zero Wind Chamber'}</h4>
            <p>
              {uz
                ? 'Kurtkani kiyib, maxsus aero-tunnelga kiring: 60 km/h tezlikdagi sovuq shamol va -15°C sharoitda matoning nafas olishi va issiqlikni saqlashini real sinang.'
                : 'Step into our atmospheric chamber replicating -15°C alpine gales to experience real-world thermal protection before taking it home.'}
            </p>
          </div>

          <div className="exp-step-card">
            <div className="exp-step-num">03</div>
            <h4>{uz ? 'Lazer Gravirovka & Tikuv' : 'Laser Monogram & Tailoring'}</h4>
            <p>
              {uz
                ? 'Kurtkangizning ichki storm-flap qismiga ismingiz yoki maxsus shifrlangan NFC xeshingiz lazer bilan yoziladi. Choklar ultratovush bilan mustahkamlanadi.'
                : 'Our on-site master tailor laser-etches your bespoke monogram and seals seam margins using high-frequency sonic horns.'}
            </p>
          </div>

          <div className="exp-step-card">
            <div className="exp-step-num">04</div>
            <h4>{uz ? 'Yopiq VIP Lounge & Yetkazish' : 'VIP Lounge & White-Glove'}</h4>
            <p>
              {uz
                ? 'Specialty espresso tatib ko‘ring. Xaridingiz germetik sayohat sumkasida topshiriladi yoki 90 daqiqada mehmonxonangizga yetkaziladi.'
                : 'Relax in our acoustic lounge with single-origin coffee while your garment is vacuum-sealed into an archival travel casing.'}
            </p>
          </div>
        </div>
      </div>

      {/* Atelier Capabilities Grid */}
      <div style={{ marginTop: '48px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', color: '#fff', fontWeight: 700, marginBottom: '18px' }}>
          🛠️ {uz ? 'Do‘konlardagi Maxsus Texnologik Xizmatlar' : 'Studio Technical Capabilities'}
        </h3>
        <div className="studio-capabilities-grid">
          <div className="capability-box">
            <div className="capability-icon">⚡</div>
            <div className="capability-content">
              <h4>{uz ? 'SonicWelding™ Ta’mirlash Markazi' : 'Ultrasonic Seam Re-Welding'}</h4>
              <p>{uz ? 'Tasodifiy yirtilgan yoki shikastlangan choklarni 40,000 Hz ultratovush bilan molekulyar darajada bepul qayta eritib tiklash.' : 'Complimentary lifetime seam restoration using 40kHz sonic horns.'}</p>
            </div>
          </div>

          <div className="capability-box">
            <div className="capability-icon">🧪</div>
            <div className="capability-content">
              <h4>{uz ? 'DWR Gidrofob Qatlamini Yangilash' : 'DWR Hydrophobic Chamber'}</h4>
              <p>{uz ? 'Kurtkangizning suv qaytarish xususiyatini nano-darajadagi aerozol bilan 15 daqiqada zavod holatiga qaytarish.' : 'Re-apply nanotech fluorocarbon-free water-repellent coating.'}</p>
            </div>
          </div>

          <div className="capability-box">
            <div className="capability-icon">🧲</div>
            <div className="capability-content">
              <h4>{uz ? 'Fidlock® Magnit va Cobra Furnitura' : 'Hardware Customization Lab'}</h4>
              <p>{uz ? 'Standart tugma va kamarlarni Germaniyaning Fidlock magnit qulflari va titan karabinlariga almashtirish.' : 'Upgrade buckles to Austrian Cobra or Fidlock magnetic latches.'}</p>
            </div>
          </div>

          <div className="capability-box">
            <div className="capability-icon">❄️</div>
            <div className="capability-content">
              <h4>{uz ? 'Klimat Nazoratidagi Kiyim Ombori' : 'Climate-Controlled Vault'}</h4>
              <p>{uz ? 'Mavsumdan tashqari vaqtda qimmatbaho texnik kurtkalaringizni doimiy +18°C va 45% namlikda xavfsiz saqlash.' : 'Year-round archival garment preservation under controlled humidity.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Architectural Materials Palette & Studio Design */}
      <div className="stores-gallery-section reveal">
        <span className="cat-kicker-tag">SPATIAL INTERIOR ARCHITECTURE</span>
        <h3 style={{ fontSize: '20px', color: '#fff', fontWeight: 700, margin: '6px 0 8px' }}>
          {uz ? 'Studiyalarimiz Arxitekturasi va Materiallar Palitrasi' : 'Atelier Spatial Architecture & Material Palette'}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          {uz
            ? 'Har bir studiyamiz brutalist monolit beton, qora anodlangan alyuminiy va akustik izolyatsiya qilingan qora shishadan barpo etilgan.'
            : 'Each interior is crafted from monolithic acoustic concrete, aerospace anodized aluminum, and smoked smart glass.'}
        </p>

        <div className="materials-palette-grid">
          <div className="palette-item">
            <div className="palette-swatch swatch-concrete">MONOLITH CONCRETE</div>
            <strong style={{ fontSize: '12px', color: '#fff' }}>Acoustic Raw Concrete</strong>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Toshkent va Olmaota flagmanlarida tashqi shovqinni -34dB ga yutuvchi monolit devorlar.</span>
          </div>
          <div className="palette-item">
            <div className="palette-swatch swatch-aluminum">ANODIZED AL-7075</div>
            <strong style={{ fontSize: '12px', color: '#fff' }}>Space-Black Aluminum</strong>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Aviatsiya qotishmasidan yasalgan osma kiyim relslari va lazerli o‘lchov arkalari.</span>
          </div>
          <div className="palette-item">
            <div className="palette-swatch swatch-glass">SMOKED SMART GLASS</div>
            <strong style={{ fontSize: '12px', color: '#fff' }}>Switchable Privacy Glass</strong>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Tugma bosilishi bilan shaffofdan to‘liq xususiy qora oynaga aylanuvchi VIP kabinalar.</span>
          </div>
          <div className="palette-item">
            <div className="palette-swatch swatch-carbon">RECYCLED CARBON</div>
            <strong style={{ fontSize: '12px', color: '#fff' }}>Carbon-Graphene Lattice</strong>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Ko‘rgazma stollari va mebellarida qayta ishlangan ultra-yengil uglerod tolalari.</span>
          </div>
        </div>

        {/* Tier comparison table */}
        <div className="tiers-table-container">
          <table className="tiers-table">
            <thead>
              <tr>
                <th>Xizmat parametri</th>
                <th>Standard Walk-In</th>
                <th>Private VIP Appointment</th>
                <th style={{ color: '#60a5fa' }}>Archival Club Member (Tier 1)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kutish vaqti</td>
                <td>Navbat asosida (5-15 min)</td>
                <td>0 daqiqa (Kafolatlangan slot)</td>
                <td>Istalgan vaqtda shaxsiy eshik</td>
              </tr>
              <tr>
                <td>3D LiDAR Tana Skaneri</td>
                <td>Asosiy o‘lchamlar</td>
                <td>To‘liq 180 nuqtali 3D model</td>
                <td>Doimiy yangilanuvchi bulut profili</td>
              </tr>
              <tr>
                <td>Shaxsiy stilist & muhandis</td>
                <td>Umumiy zal maslahatchisi</td>
                <td>1-on-1 Shaxsiy arxitektor</td>
                <td>Bosh dizayner Aziz Karimov bilan</td>
              </tr>
              <tr>
                <td>Ichimliklar & Mehmonxona</td>
                <td>Mineral suv</td>
                <td>Specialty Espresso Bar</td>
                <td>Vintage Champagne & Tasting menu</td>
              </tr>
              <tr>
                <td>Ekspress yetkazib berish</td>
                <td>Standart kuryer</td>
                <td>90 min ichida shahar bo‘ylab</td>
                <td>Shaxsiy diplomatik avtomobilda</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="stores-faq-section reveal">
        <h3 style={{ fontSize: '20px', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
          ❓ {uz ? 'Ko‘p Beriladigan Savollar (Do‘konlar Tarmog‘i)' : 'Frequently Asked Questions'}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
          {uz ? 'Do‘konlarimizga tashrif buyurish, o‘lchovlar va xizmatlar haqida kerakli ma’lumotlar:' : 'Everything you need to know about visiting our bespoke spatial studios:'}
        </p>

        {FAQS.map((faq, idx) => (
          <div key={idx} className="faq-accordion-item">
            <button
              type="button"
              className="faq-trigger"
              onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
            >
              <span>{faq.q}</span>
              <span style={{ fontSize: '16px', color: '#60a5fa' }}>{openFaqIdx === idx ? '−' : '+'}</span>
            </button>
            {openFaqIdx === idx && (
              <div className="faq-content">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* VIP Booking Modal */}
      {bookingStore && (
        <div className="auth-modal-backdrop" onClick={() => setBookingStore(null)}>
          <div
            className="auth-modal-card booking-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: '480px' }}
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
              <h2 style={{ fontSize: '20px', margin: '8px 0 4px', color: '#fff' }}>{bookingStore.name}</h2>
              <p className="auth-sub" style={{ fontSize: '12px' }}>
                {uz
                  ? `Shaxsiy stilist, ${bookingStore.scannerType} tana skaneri va espresso hamrohligida xususiy sinov seansi.`
                  : '1-on-1 private fitting room session with 3D LiDAR measurements and complimentary refreshments.'}
              </p>
            </div>

            <form onSubmit={handleBookSubmit} className="auth-form" style={{ marginTop: '16px' }}>
              <div className="auth-field">
                <label>{uz ? 'To‘liq ismingiz:' : 'Your Name:'}</label>
                <input
                  type="text"
                  required
                  placeholder="Jasur Alimov"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>{uz ? 'Telefon raqamingiz (SMS tasdiq uchun):' : 'Phone Number:'}</label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>{uz ? 'Xizmat turi:' : 'Service Type:'}</label>
                <select
                  value={bookingService}
                  onChange={(e) => setBookingService(e.target.value)}
                  className="auth-select"
                >
                  <option value="Full 3D LiDAR Body Scan & Styling">Full 3D LiDAR Body Scan & Styling (Tavsiya etiladi)</option>
                  <option value="Sub-Zero Weather Chamber Testing">Sub-Zero Weather Chamber Testing (-15°C sinov)</option>
                  <option value="Seam-Tape Ultrasonic Repair">Seam-Tape Choklarini Yangilash & Ta’mirlash</option>
                  <option value="Private VIP Evening Fitting (Champagne Session)">Private VIP Evening Fitting (Do‘stlar bilan)</option>
                </select>
              </div>

              <div className="auth-field">
                <label>{uz ? 'Shaxsiy maslahatchi / Stilist:' : 'Preferred Stylist:'}</label>
                <select
                  value={bookingStylist}
                  onChange={(e) => setBookingStylist(e.target.value)}
                  className="auth-select"
                >
                  <option value="Aziz Karimov (Head Architect)">Aziz Karimov (Bosh Dizayner & Arxitektor)</option>
                  <option value="Dr. Elena Rostova (Material Scientist)">Dr. Elena Rostova (Materiallar Fizikasi)</option>
                  <option value="Malika Umarova (Bespoke Fitting Specialist)">Malika Umarova (Ergonomika Bo‘yicha Mutaxassis)</option>
                </select>
              </div>

              <div className="auth-grid-2">
                <div className="auth-field">
                  <label>{uz ? 'Sana:' : 'Date:'}</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="auth-input-date"
                  />
                </div>
                <div className="auth-field">
                  <label>{uz ? 'Vaqt sloti:' : 'Time Slot:'}</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="auth-select"
                  >
                    <option value="11:00">11:00 — 12:00 (Morning)</option>
                    <option value="14:00">14:00 — 15:00 (Daylight)</option>
                    <option value="17:00">17:00 — 18:00 (Afternoon)</option>
                    <option value="19:30">19:30 — 20:30 (Evening)</option>
                    <option value="21:30">21:30 — 22:30 (Midnight VIP slot)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="primary-cta" style={{ width: '100%', marginTop: '8px' }}>
                <span>{uz ? 'VIP SEANSNI TASDIQLASH (SMS KOD BILAN)' : 'CONFIRM VIP RESERVATION'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3D Virtual Tour Modal */}
      {tourStore && (
        <div className="auth-modal-backdrop" onClick={() => setTourStore(null)}>
          <div
            className="auth-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: '520px', textAlign: 'center' }}
          >
            <button
              className="auth-modal-close"
              onClick={() => setTourStore(null)}
              type="button"
            >
              ✕
            </button>

            <div style={{ padding: '20px 10px' }}>
              <span className="auth-badge-pill">360° SPATIAL ATELIER PREVIEW</span>
              <h2 style={{ fontSize: '20px', color: '#fff', margin: '10px 0 6px' }}>{tourStore.name}</h2>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 20px' }}>
                {tourStore.addr} · {tourStore.spaceM2} m²
              </p>

              <div
                style={{
                  height: '220px',
                  background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '42px', marginBottom: '8px', animation: 'pulseGlowSlow 3s infinite' }}>🏢</div>
                <div style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 600 }}>360° LiDAR Visual Model Loaded</div>
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
                  {tourStore.suitesCount} Suites · {tourStore.scannerType} Active
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    fontSize: '10px',
                    color: '#22c55e',
                    fontFamily: 'monospace',
                  }}
                >
                  LIVE SENSOR FEED: 22.4°C · 42% HUMIDITY
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="secondary-btn-border"
                  onClick={() => onShowToast(`3D VR rejimga o‘tildi: ${tourStore.city} Studiyasi`)}
                >
                  🕶️ VR Rejimda ochish
                </button>
                <button
                  type="button"
                  className="primary-cta"
                  onClick={() => {
                    setBookingStore(tourStore);
                    setTourStore(null);
                  }}
                >
                  Ushbu studiyaga yozilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
