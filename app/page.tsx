'use client';

import React, { useState } from 'react';
import ShellLayout from '@/src/components/ShellLayout';
import RunwaySection from '@/src/components/RunwaySection';
import ShellBagConsumer from '@/src/components/ShellBagConsumer';
import { useLanguage } from '@/src/context/LanguageContext';

export default function Home() {
  const { t, language } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  const uz = language === 'uz';
  const ru = language === 'ru';

  return (
    <ShellLayout activeSection="stage">
      <ShellBagConsumer>
        {({ bag, toggleBagItem, showToast }) => (
          <>
            {/* 3D Runway Hero Section */}
            <RunwaySection
              bag={bag}
              onToggleBagItem={toggleBagItem}
              onAddFullLook={() => undefined}
              onShowToast={showToast}
            />

            {/* Deep Material & Engineering Architecture */}
            <section className="home-innovation-section">
              <div className="home-section-head">
                <span className="cat-kicker-tag">
                  {uz ? 'MATERIALLAR MUHANDISLIGI' : ru ? 'ИНЖЕНЕРИЯ МАТЕРИАЛОВ' : 'MATERIAL ARCHITECTURE'}
                </span>
                <h2>
                  {uz
                    ? 'Ekstremal Tungi Sharoit Uchun Muhandislik'
                    : ru
                    ? 'Высокотехнологичная инженерия для ночного мегаполиса'
                    : 'Engineered for the Uncompromising Night'}
                </h2>
                <p className="home-section-sub">
                  {uz
                    ? '3 qatlamli grafen membranasi, ultratovushli ignasiz tikuvlar va sun’iy intellekt virtual fitting tajribasi.'
                    : ru
                    ? '3-слойная графеновая мембрана, ультразвуковая сварка швов и пространственная 3D-примерочная.'
                    : '3-layer graphene membranes, zero-puncture sonic seams, and neural spatial body draping.'}
                </p>
              </div>

              <div className="home-tech-grid">
                <div className="home-tech-card">
                  <div className="home-tech-num">01</div>
                  <h3>HexaWeave™ 3L Membrane</h3>
                  <div className="tech-stat-pill">25,000mm Hydrostatic</div>
                  <p>
                    {uz
                      ? 'Atom qalinligidagi grafen panjarasi suv tomchilarini to‘liq to‘sadi, biroq tana bug‘ini sekundiga 32,000 g/m² tezlikda chiqaradi.'
                      : 'Atomic graphene honeycomb grid that stops driving rain while venting body humidity at 32,000 g/m²/24h.'}
                  </p>
                </div>

                <div className="home-tech-card">
                  <div className="home-tech-num">02</div>
                  <h3>SonicWelding™ Seams</h3>
                  <div className="tech-stat-pill">0 Needle Holes</div>
                  <p>
                    {uz
                      ? '40,000 Hz ultratovushli payvandlash igna teshiklarini butunlay yo‘q qiladi va suv kirishining oldini 100% oladi.'
                      : 'High-frequency ultrasonic seam fusion eliminating needle punctures and ensuring 100% airtight joins.'}
                  </p>
                </div>

                <div className="home-tech-card">
                  <div className="home-tech-num">03</div>
                  <h3>Spatial AI Fitting v2.6</h3>
                  <div className="tech-stat-pill">Sub-mm Precision</div>
                  <p>
                    {uz
                      ? 'Kompyuter ko‘rishi orqali kiyimning harakatdagi tarangligini va tana chiziqlarini hisoblovchi virtual sinov tizimi.'
                      : 'Sub-millimeter 3D spatial drape simulator predicting exact fabric tension points and anatomical movement.'}
                  </p>
                </div>

                <div className="home-tech-card">
                  <div className="home-tech-num">04</div>
                  <h3>AeroGel-40™ Thermal Core</h3>
                  <div className="tech-stat-pill">4× Thermal Density</div>
                  <p>
                    {uz
                      ? 'Silika aerogel nanoto‘rlari an’anaviy parga qaraganda 4 baravar ixcham hajmda maksimal issiqlik izolyatsiyasini beradi.'
                      : 'Silica aerogel nanospheres providing maximum thermal retention at a fraction of traditional down bulk.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Navigation Cards */}
            <section className="home-cta">
              <div className="home-cta-header">
                <h2>{uz ? 'VANTEGE WEAR — To‘liq Tajriba' : 'Explore VANTEGE WEAR'}</h2>
                <p>
                  {uz
                    ? 'Fitting Room, to‘liq katalog, do‘konlar tarmog‘i va materiallar jurnali'
                    : 'Fitting Studio, complete catalog, flagship stores, and research journal.'}
                </p>
              </div>

              <div className="home-cta-links">
                <a className="home-card" href="/fitting">
                  <span className="home-card-tag">STUDIO</span>
                  <h3>Fitting Room</h3>
                  <p>{uz ? 'Modelni kiydirib ko‘ring yoki suratingizni yuklang — 18 kiyim' : 'Dress 3D model or upload your photo'}</p>
                </a>

                <a className="home-card" href="/catalog">
                  <span className="home-card-tag">SHOP</span>
                  <h3>{uz ? 'Kiyimlar Katalogi' : 'Garment Catalog'}</h3>
                  <p>{uz ? '18 ta buyum: kurtkalar, anoraklar, shimlar va narxlar' : '18 pieces with full material breakdown'}</p>
                </a>

                <a className="home-card" href="/network">
                  <span className="home-card-tag">DATA</span>
                  <h3>Network</h3>
                  <p>{uz ? 'Real vaqtda do‘konlar zaxirasi va ob-havo sensorlari' : 'Live IoT telemetry and inventory ping'}</p>
                </a>

                <a className="home-card" href="/stores">
                  <span className="home-card-tag">DO‘KONLAR</span>
                  <h3>{uz ? 'Flagman Do‘konlar' : 'Flagship Stores'}</h3>
                  <p>{uz ? '6 do‘kon, 5 shahar — VIP xususiy sinovni band qilish' : '6 studios across 5 cities with VIP booking'}</p>
                </a>

                <a className="home-card" href="/journal">
                  <span className="home-card-tag">JOURNAL</span>
                  <h3>Journal</h3>
                  <p>{uz ? 'Mato fizikasi va Toshkent tungi marshrutlari' : 'Material science and design field notes'}</p>
                </a>

                <a className="home-card" href="/faq">
                  <span className="home-card-tag">HELP</span>
                  <h3>{uz ? 'Savol-Javob' : 'FAQ & Support'}</h3>
                  <p>{uz ? 'O‘lchamlar, kafolat, nanotexnik yuvish qoidalari' : 'Care guide, sizing, and international logistics'}</p>
                </a>
              </div>
            </section>

            {/* VIP List Subscription */}
            <section className="home-newsletter-box">
              <div className="newsletter-card-inner">
                <span className="cat-kicker-tag">VANTEGE DISPATCH · EXCLUSIVE ACCESS</span>
                <h3>{uz ? 'Cheklangan relizlardan birinchi bo‘lib xabardor bo‘ling' : 'Reserve Early Access for New Releases'}</h3>
                <p>
                  {uz
                    ? 'Yangi kapsula relizlari, laboratoriya yangiliklari va xususiy tadbirlarga taklifnomalar.'
                    : 'Early notification for upcoming capsules, laboratory reports, and private flagship invitations.'}
                </p>

                {newsletterSent ? (
                  <div className="newsletter-success-box">
                    <span>✓ {uz ? 'Rahmat! Siz VANTEGE VIP ro‘yxatiga muvaffaqiyatli qo‘shildingiz.' : 'Confirmed! You are on the VANTEGE VIP list.'}</span>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newsletterEmail) {
                        setNewsletterSent(true);
                        showToast(uz ? 'VANTEGE VIP ro‘yxatiga qo‘shildingiz!' : 'Subscribed to VANTEGE VIP dispatch!');
                      }
                    }}
                    className="newsletter-form"
                  >
                    <input
                      type="email"
                      required
                      placeholder="you@vantegewear.com"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button type="submit" className="primary-cta">
                      <span>{uz ? 'A’ZO BO‘LISH' : 'JOIN VIP DISPATCH'}</span>
                    </button>
                  </form>
                )}
              </div>
            </section>
          </>
        )}
      </ShellBagConsumer>
    </ShellLayout>
  );
}
