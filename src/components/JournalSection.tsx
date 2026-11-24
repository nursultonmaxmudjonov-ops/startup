'use client';

import React, { useMemo, useState } from 'react';
import { useReveal } from '@/src/components/useReveal';
import type { onShowToastType } from '@/src/data/shared';
import { useLanguage } from '@/src/context/LanguageContext';

interface JournalSectionProps {
  onShowToast: onShowToastType;
}

export interface Article {
  id: string;
  cat: string;
  title: string;
  read: string;
  author: string;
  date: string;
  text: string;
  body: string[];
  takeaway: string;
  featured?: boolean;
}

const POSTS: Article[] = [
  {
    id: 'art-00-featured',
    cat: 'NANOTECHNOLOGY',
    title: 'The Nanotech Membrane Revolution: Graphene Nanoplatelets vs Traditional PTFE Membranes',
    read: '8 min read',
    author: 'Dr. Elena Rostova & Aziz Karimov',
    date: 'Nov 24, 2026',
    text: 'Why traditional Teflon membranes break down after 30 washes, and how single-atom graphene hexagonal lattices create permanent 32,000 g/m² breathability with zero microplastic peeling.',
    body: [
      'For over four decades, high-end technical outerwear has relied on expanded polytetrafluoroethylene (ePTFE) — commonly known as Gore-Tex. While historically revolutionary, ePTFE exhibits a fundamental flaw: its microscopic pores clog when exposed to body oils, requiring heavy detergent washing that gradually delaminates the seam tape.',
      'In our Tashkent Material Physics Laboratory, we synthesized HexaWeave™: a monolithic composite combining non-porous hydrophilic polyurethanes with liquid-exfoliated graphene nanoplatelets. Graphene exhibits extreme thermal conductivity (5,000 W/m·K) and ballistic mechanical strength.',
      'Instead of passive pores that can clog, HexaWeave™ operates via solid-state diffusion. Water vapor molecules are electrostatically ferried along the graphene lattices toward the outer cold air, resulting in a moisture transmission rate of 32,000 g/m²/24h even during vigorous uphill cycling.',
      'Moreover, Martindale abrasion tests demonstrated over 120,000 continuous rub cycles without degradation, outperforming military-grade Cordura by a factor of three while shaving 35% off the overall jacket weight.',
    ],
    takeaway: 'HexaWeave™ graphene eliminates micropore clogging, boosting moisture vapor dissipation by 45% and surviving over 120,000 friction cycles.',
    featured: true,
  },
  {
    id: 'art-01',
    cat: 'MATERIAL SCIENCE',
    title: 'Why 3-layer shell still wins: Hydrostatic Head vs Breathability',
    read: '5 min read',
    author: 'Dr. Elena Rostova',
    date: 'Nov 12, 2026',
    text: 'Membranes, DWR and the honest truth about waterproof ratings — what actually keeps you dry at 3 AM.',
    body: [
      'In outdoor marketing, numbers are often thrown around carelessly: 10,000mm, 20,000mm, 30,000mm. But what do these figures really represent when rain is driven by 45 km/h gusts down Amir Temur Avenue?',
      'Hydrostatic head measures the height of a water column that fabric can support before three droplets penetrate through. A 25,000mm rating (the standard for VANTEGE WEAR HexaWeave™) means the material withstands 2.5 atmospheres of direct hydraulic pressure.',
      'However, extreme waterproofness is meaningless if the fabric cannot vent water vapor. When walking briskly in cold rain, the human body produces between 800 to 1,200 grams of perspiration per hour. By incorporating our proprietary microporous graphene grid, the moisture transmission rate reaches 32,000 g/m²/24h — preventing the clammy sauna effect common in conventional coats.',
    ],
    takeaway: 'HexaWeave™ balances 25k mm hydrostatic resistance with 32k g/m² breathability — the sweet spot for nocturnal urban environments.',
  },
  {
    id: 'art-02',
    cat: 'MANUFACTURING',
    title: 'Inside the seam-tape room: SonicWelding™ teardown',
    read: '6 min read',
    author: 'Aziz Karimov',
    date: 'Nov 04, 2026',
    text: 'Every taped seam is checked twice under optical microscope. We photographed the process nobody ever sees.',
    body: [
      'Standard garment construction relies on needles. A single winter jacket requires approximately 2,800 needle strikes. Each strike creates a puncture hole through which wind and water can enter if the seam tape degrades over time.',
      'In our Tashkent laboratory, we replaced high-tension needles with ultrasonic sonic horns operating at 40,000 Hz. The mechanical vibrations cause acoustic cavitation at the fabric interfaces, fusing the polyurethane membranes together at the molecular level in milliseconds.',
      'The result is a zero-hole seam. Pull tests demonstrate that the welded seam is actually 18% stronger than the raw fabric itself, resisting shear stress exceeding 450 Newtons.',
    ],
    takeaway: 'Ultrasonic fusion eliminates mechanical holes, yielding seams that last for decades rather than peeling in year two.',
  },
  {
    id: 'art-03',
    cat: 'CITY GUIDE',
    title: 'Night routes: Tashkent after 23:00',
    read: '4 min read',
    author: 'Editorial Team',
    date: 'Oct 28, 2026',
    text: 'Where the streets empty, the light gets better, and technical outerwear finally makes sense.',
    body: [
      'Tashkent by day is sun-drenched concrete, chinar trees, and bustling commerce. But after 23:00, when traffic ebbs and the desert night breeze sweeps across the city, the urban geometry transforms.',
      'Our favorite midnight route starts at Kosmonavtlar station, weaves through the silent modernist corridors of the Writers Union, and extends across the Ankhor canal toward Tashkent City.',
      'In these open nocturnal spaces, temperature fluctuates sharply within minutes. Technical outerwear ceases to be an aesthetic choice — it becomes your protective shelter as ambient temperatures dip below freezing.',
    ],
    takeaway: 'Designed for the transitional hours where temperature drops and wind tunnels between skyscrapers challenge ordinary clothing.',
  },
  {
    id: 'art-04',
    cat: 'THERMODYNAMICS',
    title: 'Aerogel in Outerwear: How NASA tech entered our parkas',
    read: '7 min read',
    author: 'Dr. Elena Rostova',
    date: 'Oct 15, 2026',
    text: 'Synthetic silica aerogels provide 4x thermal insulation with zero bulk. Here is the physics behind it.',
    body: [
      'Aerogel is often called "frozen smoke". Composed of 99.8% air trapped within an ultra-fine silica nanoparticle matrix, it boasts the lowest thermal conductivity of any known solid material.',
      'Until recently, aerogel was brittle and unusable in flexible apparel. Through our partnership with aerospace material suppliers, we developed an elastomeric composite lattice that embeds silica aerogel directly into recycled polymer batting.',
      'A 3mm layer of this batting provides the same thermal barrier as 24mm of traditional 800-fill goose down, without losing loft when subjected to heavy rain or compression.',
    ],
    takeaway: 'Slim silhouettes with mountaineering-grade thermal retention — zero bulky marshmallow profiles.',
  },
  {
    id: 'art-05',
    cat: 'CIRCULARITY',
    title: 'The Circular Promise: Why every shell has an NFC identity chip',
    read: '4 min read',
    author: 'Malika Umarova',
    date: 'Sep 30, 2026',
    text: 'Lifetime repairs, guaranteed material recycling, and digital ownership pass.',
    body: [
      'Fast fashion treats clothing as disposable. VANTEGE WEAR is built on an architectural ethos: you invest once in a shell, and it protects you for a decade.',
      'Every garment leaving our Tashkent studio has a cryptographically signed NFC microchip concealed inside the left storm flap. Tapping it with any modern smartphone reveals its manufacture batch, fabric recipe, service history, and direct repair request concierge.',
      'If your shell ever suffers an accidental tear on a sharp metal railing, drop it at any of our flagship hubs. Our technicians re-weld the seam free of charge.',
    ],
    takeaway: 'An immutable digital passport ensuring lifetime complimentary repair and circular end-of-life recycling.',
  },
  {
    id: 'art-06',
    cat: 'STYLING',
    title: 'Nine ways to wear one hooded long parka: Modularity in Motion',
    read: '5 min read',
    author: 'Aziz Karimov',
    date: 'Sep 18, 2026',
    text: 'From gallery vernissages to high-speed cycling: modular layers that adapt.',
    body: [
      'Outerwear should adapt to your movement, not restrict it. The Hooded Long Parka was engineered with internal carry harnesses and 2-way waterproof front zips.',
      'When entering an overheated indoor venue or metro carriage, unfasten the front and let the coat drape across your shoulders like a backpack using the internal webbing harness.',
      'For cycling or driving, unzip the bottom slider to mid-thigh to liberate knee articulation without exposing your chest to the elements.',
    ],
    takeaway: 'Functional modularity: internal carry straps, 2-way venting zips, and transformable storm plackets.',
  },
  {
    id: 'art-07',
    cat: 'ACOUSTIC DESIGN',
    title: 'The Silence of Shells: Why Technical Fabrics Rustle and How We Dampened It',
    read: '6 min read',
    author: 'Dr. Elena Rostova',
    date: 'Sep 02, 2026',
    text: 'Acoustic engineering in high-density nylon: achieving zero-decibel arm movement.',
    body: [
      'One of the most persistent complaints about hardshell mountaineering jackets is the loud "swish-swish" rustling sound produced with every stride.',
      'By analyzing decibel frequency spectra in an anechoic sound chamber, our team identified that standard nylon filaments strike against each other at 3,200 Hz. We applied an elastomeric silicone soft-touch texturizing process to the outer 30-denier warp yarns.',
      'The friction coefficient was reduced by 64%, resulting in a whisper-quiet garment that allows you to walk through silent art museums or night streets without sounding like an alpine tent.',
    ],
    takeaway: 'Micro-textured yarn engineering suppresses high-frequency fabric friction by 64% for near-silent urban wear.',
  },
  {
    id: 'art-08',
    cat: 'CIRCULARITY',
    title: 'Zero-Waste Molecular Upcycling: From Retired Shells to Graphene Filaments',
    read: '5 min read',
    author: 'Malika Umarova',
    date: 'Aug 20, 2026',
    text: 'How our return program de-polymerizes worn outerwear into new architectural textiles.',
    body: [
      'When a customer retires a jacket after 7 or 10 years, it does not end up in a landfill. Our recycling center in Tashkent uses chemical glycolysis to break down the polyurethane laminates into base polyols.',
      'The pure graphene nanoparticles are centrifuged and harvested, ready to be incorporated into the next generation of winter parkas.',
      'Every returned jacket grants the customer a 25% credit toward any future VANTEGE collection piece, keeping 100% of our carbon and synthetic materials within a closed loop.',
    ],
    takeaway: 'A complete cradle-to-cradle lifecycle guaranteeing zero synthetic textile waste.',
  },
];

const CATEGORIES = [
  'All',
  'Nanotechnology',
  'Material Science',
  'Manufacturing',
  'Thermodynamics',
  'Acoustic Design',
  'City Guide',
  'Circularity',
  'Styling',
] as const;

export default function JournalSection({ onShowToast }: JournalSectionProps) {
  const [activeCat, setActiveCat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTrack, setActiveTrack] = useState('Episode 14: The Graphene Synthesis Process');

  // Benchmark active fabric
  const [activeFabric, setActiveFabric] = useState<'standard' | 'gore' | 'hexa'>('hexa');

  const rootRef = useReveal<HTMLElement>();
  const { language } = useLanguage();
  const uz = language === 'uz';

  const visiblePosts = useMemo(() => {
    return POSTS.filter((p) => {
      if (activeCat !== 'All' && p.cat.toLowerCase() !== activeCat.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesText = p.text.toLowerCase().includes(q);
        const matchesAuthor = p.author.toLowerCase().includes(q);
        const matchesCat = p.cat.toLowerCase().includes(q);
        if (!matchesTitle && !matchesText && !matchesAuthor && !matchesCat) return false;
      }
      return true;
    });
  }, [activeCat, searchQuery]);

  const featuredPost = POSTS.find((p) => p.featured) || POSTS[0];

  const handleAudioToggle = () => {
    const next = !isPlayingAudio;
    setIsPlayingAudio(next);
    if (next) {
      onShowToast(`▶ Audio Dispatch: "${activeTrack}" o‘ynatilyapti`);
    } else {
      onShowToast('⏸ Audio to‘xtatildi');
    }
  };

  return (
    <section id="journal" ref={rootRef} aria-label="Journal and newsletter" className="journal-section-expanded">
      {/* Header */}
      <div className="jn-head">
        <div>
          <span className="cat-kicker-tag">MATERIAL RESEARCH & URBAN ARCHITECTURE</span>
          <h2>
            VANTEGE <span>Journal & Whitepapers</span>
          </h2>
          <p className="lb-sub">
            {uz
              ? 'Mato fizikasi, nanostrukturalar, ultratovushli tikuvlar va shahar tungi arxitekturasi bo‘yicha ilmiy maqolalar.'
              : 'Field notes, aerodynamic textile physics, and technical outerwear essays.'}
          </p>
        </div>
        <span className="side-count">{POSTS.length} MONOGRAPHS · 2026</span>
      </div>

      {/* Meta ticker */}
      <div className="section-meta-ticker">
        <div className="ticker-node">
          <span className="dot" />
          <span>{uz ? 'Eng so‘nggi laboratoriya relizi: 24-Noyabr, 2026' : 'Latest Lab Release: Nov 24, 2026'}</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-node">
          <span>🔬 {uz ? 'Mato reytingi: 25k/32k HexaWeave™' : 'Membrane Spec: 25k/32k HexaWeave™'}</span>
        </div>
        <span className="ticker-sep">|</span>
        <div className="ticker-node">
          <span>🎧 {uz ? 'VANTEGE Audio Dispatches podkasti faol' : 'Audio Dispatches Live'}</span>
        </div>
      </div>

      {/* Large Featured Story */}
      <div
        className="journal-hero-feature reveal"
        onClick={() => setActiveArticle(featuredPost)}
      >
        <span className="journal-hero-badge">⚡ COVER STORY · {featuredPost.cat}</span>
        <h2>{featuredPost.title}</h2>
        <p>{featuredPost.text}</p>
        <div className="journal-hero-footer">
          <span>✍️ {featuredPost.author} · {featuredPost.date}</span>
          <span style={{ color: '#60a5fa', fontWeight: 600 }}>{uz ? 'To‘liq ilmiy maqolani o‘qish (8 min) →' : 'Read Full Research Essay →'}</span>
        </div>
      </div>

      {/* Controls Bar: Search + Category Chips */}
      <div className="journal-controls-bar">
        <div className="city-chips" style={{ flex: 1 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`look-chip${activeCat === c ? ' on' : ''}`}
              onClick={() => setActiveCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="journal-search-input-wrap">
          <span className="search-icon-pos">🔍</span>
          <input
            type="text"
            className="journal-search-input"
            placeholder={uz ? 'Mavzu, mato yoki muallif bo‘yicha qidiruv...' : 'Search journal by topic, fabric, author...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="jn-grid">
        {visiblePosts.map((p) => (
          <article
            key={p.id}
            className="jn-card reveal"
            onClick={() => setActiveArticle(p)}
          >
            <div className="jn-meta">
              <span className="lb-tag">{p.cat}</span>
              <span className="jn-read">{p.read}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
            <div className="jn-card-foot">
              <span className="jn-author">✍️ {p.author}</span>
              <span className="jn-more">{uz ? 'O‘qish →' : 'Read entry →'}</span>
            </div>
          </article>
        ))}
      </div>

      {visiblePosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <p>Kiritilgan so‘rov bo‘yicha maqola topilmadi.</p>
          <button
            type="button"
            className="secondary-btn-border"
            onClick={() => {
              setActiveCat('All');
              setSearchQuery('');
            }}
          >
            Filtrni tozalash
          </button>
        </div>
      )}

      {/* Material Science Lab Benchmark Tool */}
      <div className="material-lab-benchmark reveal">
        <div className="benchmark-head">
          <span className="cat-kicker-tag">VANTEGE LAB BENCHMARK SUITE</span>
          <h3>{uz ? 'Laboratoriya Sinovlari: Matolar Qiyosiy Ko‘rsatkichlari' : 'Textile Engineering: Fabric Benchmark Comparator'}</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            {uz
              ? 'Toshkent sinov markazida 100+ namunalar ustida o‘tkazilgan gidravlik va bug‘ o‘tkazuvchanlik natijalari:'
              : 'Empirical hydrostatic head, breathability, and tensile strength benchmarks measured at 20°C and 65% RH:'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`look-chip ${activeFabric === 'standard' ? 'on' : ''}`}
            onClick={() => setActiveFabric('standard')}
          >
            Oddiy 2L PU Membrana
          </button>
          <button
            type="button"
            className={`look-chip ${activeFabric === 'gore' ? 'on' : ''}`}
            onClick={() => setActiveFabric('gore')}
          >
            Klassik 3L ePTFE (Teflon)
          </button>
          <button
            type="button"
            className={`look-chip ${activeFabric === 'hexa' ? 'on' : ''}`}
            onClick={() => setActiveFabric('hexa')}
          >
            ★ VANTEGE HexaWeave™ (Grafen)
          </button>
        </div>

        <div className="benchmark-cards-grid">
          <div className={`benchmark-card ${activeFabric === 'standard' ? 'highlight' : ''}`}>
            <div className="bm-name">
              <span>Standart 2-Layer PU</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Bozordagi arzon kurtkalar</span>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Gidrostatik bosim:</span> <strong>10,000 mm</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill" style={{ width: '35%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Bug‘ o‘tkazuvchanlik:</span> <strong>8,000 g/m²</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill" style={{ width: '25%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Yuvish chidamliligi:</span> <strong>30 marta</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill" style={{ width: '30%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Og‘irlik:</span> <strong>420 g/m² (og‘ir)</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill" style={{ width: '75%', background: '#f59e0b' }} /></div>
            </div>
          </div>

          <div className={`benchmark-card ${activeFabric === 'gore' ? 'highlight' : ''}`}>
            <div className="bm-name">
              <span>Klassik 3-Layer ePTFE</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Standart tog‘ sport kiyimlari</span>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Gidrostatik bosim:</span> <strong>20,000 mm</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill" style={{ width: '70%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Bug‘ o‘tkazuvchanlik:</span> <strong>18,000 g/m²</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill" style={{ width: '55%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Yuvish chidamliligi:</span> <strong>60 marta</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill" style={{ width: '55%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Og‘irlik:</span> <strong>290 g/m²</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill" style={{ width: '50%' }} /></div>
            </div>
          </div>

          <div className={`benchmark-card ${activeFabric === 'hexa' ? 'highlight' : ''}`}>
            <div className="bm-name">
              <span style={{ color: '#60a5fa' }}>★ HexaWeave™ 3L Graphene</span>
              <span style={{ fontSize: '11px', color: '#4ade80' }}>VANTEGE Standarti</span>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Gidrostatik bosim:</span> <strong>25,000 mm (+25%)</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill accent" style={{ width: '92%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Bug‘ o‘tkazuvchanlik:</span> <strong>32,000 g/m² (+77%)</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill accent" style={{ width: '100%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Yuvish chidamliligi:</span> <strong>120+ marta</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill accent" style={{ width: '100%' }} /></div>
            </div>
            <div className="bm-metric-row">
              <div className="bm-label-row"><span>Og‘irlik:</span> <strong>185 g/m² (ultra-yengil)</strong></div>
              <div className="bm-bar-track"><div className="bm-bar-fill accent" style={{ width: '30%' }} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Dispatches Mini-Player */}
      <div className="audio-dispatches-widget reveal">
        <div className="audio-info">
          <span className="cat-kicker-tag">VANTEGE AUDIO DISPATCHES</span>
          <h4>🎙️ {activeTrack}</h4>
          <p>
            {uz
              ? 'Bosh arxitektor Aziz Karimov va Dr. Elena Rostova bilan laboratoriya suhbati (14 daqiqa).'
              : 'Studio podcast: Deep-dive interview with head material architects.'}
          </p>
        </div>

        <div className="audio-controls-row">
          <div className="audio-waveform-bars">
            <div className={`wave-stick ${isPlayingAudio ? 'playing' : ''}`} />
            <div className={`wave-stick ${isPlayingAudio ? 'playing' : ''}`} />
            <div className={`wave-stick ${isPlayingAudio ? 'playing' : ''}`} />
            <div className={`wave-stick ${isPlayingAudio ? 'playing' : ''}`} />
            <div className={`wave-stick ${isPlayingAudio ? 'playing' : ''}`} />
            <div className={`wave-stick ${isPlayingAudio ? 'playing' : ''}`} />
          </div>

          <button
            type="button"
            className="audio-play-circle"
            onClick={handleAudioToggle}
            title={isPlayingAudio ? 'Pause' : 'Play'}
          >
            {isPlayingAudio ? '❚❚' : '▶'}
          </button>

          <button
            type="button"
            className="secondary-btn-border"
            onClick={() => onShowToast('Audio epizodlar ro‘yxati ochildi')}
            style={{ fontSize: '11px', padding: '8px 14px' }}
          >
            Epizodlar (12)
          </button>
        </div>
      </div>

      {/* Whitepapers & Engineering Papers Shelf */}
      <div style={{ marginTop: '48px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
          📑 {uz ? 'Yuklab Olish Uchun Ilmiy Hisobotlar (Whitepapers)' : 'Engineering Whitepapers & PDF Dossiers'}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
          {uz ? 'Mato muhandislari va texnologiya ixlosmandlari uchun ochiq manbali ilmiy hisobotlar:' : 'Peer-reviewed technical research dossiers published by our materials division:'}
        </p>

        <div className="whitepapers-shelf">
          <div className="whitepaper-card">
            <div className="wp-info">
              <h5>VANTEGE-Whitepaper-2026-v2.pdf</h5>
              <span>PDF · 14.2 MB · Graphene Nanoplatelet Synthesis & Hydrostatics</span>
            </div>
            <button
              type="button"
              className="wp-download-btn"
              onClick={() => onShowToast('Yuklab olish boshlandi: VANTEGE-Whitepaper-2026-v2.pdf')}
            >
              ⬇ Yuklab olish
            </button>
          </div>

          <div className="whitepaper-card">
            <div className="wp-info">
              <h5>Ultrasonic-Seam-Welding-Acoustics.pdf</h5>
              <span>PDF · 8.6 MB · 40kHz Sonotrode Energy Dissipation Report</span>
            </div>
            <button
              type="button"
              className="wp-download-btn"
              onClick={() => onShowToast('Yuklab olish boshlandi: Ultrasonic-Seam-Welding-Acoustics.pdf')}
            >
              ⬇ Yuklab olish
            </button>
          </div>

          <div className="whitepaper-card">
            <div className="wp-info">
              <h5>Aerogel-Lattice-Thermal-Study.pdf</h5>
              <span>PDF · 11.0 MB · Sub-Zero Conductive Heat Loss in Alpine Passes</span>
            </div>
            <button
              type="button"
              className="wp-download-btn"
              onClick={() => onShowToast('Yuklab olish boshlandi: Aerogel-Lattice-Thermal-Study.pdf')}
            >
              ⬇ Yuklab olish
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter subscribe */}
      <div className="jn-news reveal">
        <div>
          <h3>{uz ? 'VANTEGE List a’zosiga aylaning' : 'Join the VANTEGE List'}</h3>
          <p>
            {uz
              ? 'Yangi ilmiy relizlar, laboratoriya sinovlari va yopiq tadbirlar haqida xabardor bo‘ling. Spam yo‘q.'
              : 'Early access to drops, archive restocks, and lab whitepapers. No spam, ever.'}
          </p>
        </div>
        <form
          className="jn-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes('@')) {
              onShowToast('Haqiqiy email manzilini kiriting');
              return;
            }
            setJoined(true);
            onShowToast(uz ? 'Siz VANTEGE List ga muvaffaqiyatli a’zo bo‘ldingiz ✓' : 'You are on the VANTEGE List ✓');
          }}
        >
          <input
            type="email"
            placeholder="you@email.com"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={joined}
          />
          <button type="submit" className="primary-cta jn-cta" disabled={joined}>
            <span className="btn-txt">{joined ? 'A’ZO BO‘LDINGIZ ✓' : 'A’ZO BO‘LISH'}</span>
          </button>
        </form>
      </div>

      {/* Article Full Reading Modal */}
      {activeArticle && (
        <div className="auth-modal-backdrop" onClick={() => setActiveArticle(null)}>
          <div
            className="auth-modal-card article-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: '640px' }}
          >
            <button
              className="auth-modal-close"
              onClick={() => setActiveArticle(null)}
              type="button"
            >
              ✕
            </button>

            <div className="article-modal-header">
              <div className="article-tag-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span className="lb-tag">{activeArticle.cat}</span>
                <span className="jn-read">{activeArticle.read}</span>
              </div>
              <h2 style={{ fontSize: '22px', color: '#fff', lineHeight: 1.35 }}>{activeArticle.title}</h2>
              <div className="article-meta-row" style={{ fontSize: '12px', color: '#94a3b8', margin: '10px 0' }}>
                <span>By <strong>{activeArticle.author}</strong></span>
                <span> · </span>
                <span>{activeArticle.date}</span>
                <span> · </span>
                <span>VANTEGE Research Lab, Tashkent</span>
              </div>
            </div>

            <div className="article-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px' }}>
              {activeArticle.body.map((para, idx) => (
                <p key={idx} style={{ fontSize: '14px', lineHeight: 1.7, color: '#cbd5e1', marginBottom: '16px' }}>
                  {para}
                </p>
              ))}

              <div className="article-takeaway-box" style={{ background: 'rgba(59, 130, 246, 0.08)', borderLeft: '3px solid #3b82f6', padding: '14px 18px', borderRadius: '8px', margin: '24px 0' }}>
                <span className="takeaway-label" style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', display: 'block', marginBottom: '4px' }}>
                  KEY LAB TAKEAWAY:
                </span>
                <p style={{ fontSize: '13px', color: '#f1f5f9', margin: 0, lineHeight: 1.5 }}>
                  {activeArticle.takeaway}
                </p>
              </div>
            </div>

            <div className="article-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                className="secondary-btn-border"
                onClick={() => {
                  onShowToast('Maqola havolasi nusxalandi: vantege.wear/journal/' + activeArticle.id);
                }}
              >
                🔗 Havolani ulashish
              </button>
              <button
                type="button"
                className="primary-cta"
                onClick={() => setActiveArticle(null)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
