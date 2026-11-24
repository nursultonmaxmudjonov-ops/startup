'use client';

import React, { useState } from 'react';
import { useReveal } from '@/src/components/useReveal';
import type { onShowToastType } from '@/src/data/shared';
import { useLanguage } from '@/src/context/LanguageContext';

interface JournalSectionProps {
  onShowToast: onShowToastType;
}

interface Article {
  id: string;
  cat: string;
  title: string;
  read: string;
  author: string;
  date: string;
  text: string;
  body: string[];
  takeaway: string;
}

const POSTS: Article[] = [
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
    title: 'Nine ways to wear one hooded long parka',
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
];

export default function JournalSection({ onShowToast }: JournalSectionProps) {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const rootRef = useReveal<HTMLElement>();
  const { t, language } = useLanguage();
  const uz = language === 'uz';

  return (
    <section id="journal" ref={rootRef} aria-label="Journal and newsletter">
      <div className="jn-head">
        <div>
          <span className="cat-kicker-tag">MATERIAL RESEARCH & URBAN ARCHITECTURE</span>
          <h2>
            VANTEGE <span>Journal</span>
          </h2>
          <p className="lb-sub">
            {uz
              ? 'Mato fizikasi, ultratovushli tikuvlar va shahar tungi arxitekturasi bo‘yicha ilmiy maqolalar.'
              : 'Field notes, aerodynamic textile research, and technical design essays.'}
          </p>
        </div>
        <span className="side-count">{POSTS.length} ENTRIES · 2026</span>
      </div>

      <div className="jn-grid">
        {POSTS.map((p) => (
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
              <span className="jn-more">{uz ? 'Maqolani o‘qish →' : 'Read entry →'}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter subscribe */}
      <div className="jn-news reveal">
        <div>
          <h3>{uz ? 'VANTEGE List a’zosiga aylaning' : 'Join the VANTEGE List'}</h3>
          <p>
            {uz
              ? 'Yangi ilmiy relizlar, laboratoriya sinovlari va yopiq tadbirlar. Hech qanday spam yo‘q.'
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
          >
            <button
              className="auth-modal-close"
              onClick={() => setActiveArticle(null)}
              type="button"
            >
              ✕
            </button>

            <div className="article-modal-header">
              <div className="article-tag-row">
                <span className="lb-tag">{activeArticle.cat}</span>
                <span className="jn-read">{activeArticle.read}</span>
              </div>
              <h2>{activeArticle.title}</h2>
              <div className="article-meta-row">
                <span>By <strong>{activeArticle.author}</strong></span>
                <span>·</span>
                <span>{activeArticle.date}</span>
                <span>·</span>
                <span>VANTEGE Research Lab</span>
              </div>
            </div>

            <div className="article-modal-body">
              {activeArticle.body.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}

              <div className="article-takeaway-box">
                <span className="takeaway-label">KEY LAB TAKEAWAY:</span>
                <p>{activeArticle.takeaway}</p>
              </div>
            </div>

            <div className="article-modal-footer">
              <button
                type="button"
                className="secondary-btn-border"
                onClick={() => {
                  onShowToast('Maqola havolasi nusxalandi');
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
