'use client';

import React, { useState } from 'react';
import ShellLayout from '@/src/components/ShellLayout';
import ShellBagConsumer from '@/src/components/ShellBagConsumer';
import { useLanguage } from '@/src/context/LanguageContext';

interface FaqItem {
  qUz: string;
  qEn: string;
  aUz: string;
  aEn: string;
  category: 'Product' | 'Fitting' | 'Shipping' | 'Warranty';
}

const FAQS: FaqItem[] = [
  {
    category: 'Product',
    qUz: 'HexaWeave™ 3-qatlamli grafen membranasi qanday ishlaydi?',
    qEn: 'How does the HexaWeave™ 3-layer graphene membrane work?',
    aUz: 'Bizning membranalarimiz atom qalinligidagi grafen panjarasi bilan mustahkamlangan mikroporoz polimer qatlamlaridan iborat. Suv tomchilari (hajmi ~100 mikron) g‘ovaklardan (hajmi 0.002 mikron) 50,000 baravar kattaroq bo‘lgani uchun tashqi yomg‘ir va qor mutlaqo ichkariga kirmaydi. Biroq tana bug‘i (hajmi 0.0004 mikron) erkin tashqariga chiqadi. Bu har qanday ob-havoda quruq va qulay qolishingizni kafolatlaydi.',
    aEn: 'Our membrane consists of microporous polymer layers reinforced with an atomic-thick graphene honeycomb. Rain droplets (~100 microns) are 50,000 times larger than the microscopic pores (0.002 microns), making external water penetration physically impossible. Meanwhile, perspiration vapor molecules (0.0004 microns) vent freely, preventing perspiration buildup.',
  },
  {
    category: 'Product',
    qUz: 'Kurtkani kir yuvish mashinasida yuvsa bo‘ladimi?',
    qEn: 'Can I wash the technical shell in a standard washing machine?',
    aUz: 'Ha, ammo texnik membranalar uchun maxsus yuvish vositalaridan (masalan, Grangers Performance Wash yoki Nikwax Tech Wash) foydalanish tavsiya etiladi. 30°C da nozik rejimda (delicate cycle) yuving. Hech qachon mato yumshatgich (conditioner) yoki oqartiruvchi ishlatmang, chunki ular mikroporozlarni yopib qo‘yishi mumkin. Yuvgandan keyin soyada quriting.',
    aEn: 'Yes, but using technical garment wash solutions (like Nikwax Tech Wash or Grangers) is recommended. Machine wash cold at 30°C on a gentle cycle. Never use fabric softeners or bleach, as they clog the membrane micropores. Drip dry in the shade.',
  },
  {
    category: 'Fitting',
    qUz: 'Virtual Fitting Room o‘lchamni qanchalik aniq ko‘rsatadi?',
    qEn: 'How accurate is the Virtual Fitting Room v2.6?',
    aUz: 'Bizning neyron tarmoqlarimiz mato zichligi, yelka chizig‘i va kiyimning erkin tushishini (draping) 98.9% aniqlik bilan hisoblab chiqadi. Fitting xonasiga o‘z suratingizni yuklaganingizda yoki standart modellarni tanlaganingizda, kiyimning haqiqiy gavdaga qanday turishini 3D formatda ko‘rasiz.',
    aEn: 'Our neural drape simulation calculates fabric tension, shoulder alignment, and fall with 98.9% anatomical accuracy. When you upload your photo or select preset silhouettes, it simulates real cloth physics in real time.',
  },
  {
    category: 'Shipping',
    qUz: 'Yetkazib berish qancha vaqt oladi?',
    qEn: 'What are the delivery timelines?',
    aUz: 'Toshkent shahrida: tezkor kuryer orqali buyurtma berilgan kunda yoki 24 soat ichida yetkaziladi. Samarqand, Buxoro va O‘zbekiston viloyatlariga: 1-2 ish kuni. Olmaota, Bishkek va Qozog‘iston/Qirg‘izistonga: 2-3 ish kuni. Dubay va xalqaro jo‘natmalar: DHL Express orqali 3-5 ish kuni ichida yetib boradi.',
    aEn: 'In Tashkent: same-day or 24-hour night dispatch. Regional Uzbekistan (Samarkand, Bukhara): 1-2 business days. Kazakhstan & Kyrgyzstan: 2-3 business days. Dubai & GCC: 2-4 business days via express air courier.',
  },
  {
    category: 'Warranty',
    qUz: 'NFC Identity chipi va umrlik kafolat nima?',
    qEn: 'What is the NFC identity chip and lifetime repair guarantee?',
    aUz: 'Har bir VANTEGE WEAR kurtkasining chap cho‘ntak yoki qulf qismida ko‘rinmas NFC chip o‘rnatilgan. Smartfoningizni unga yaqinlashtirganingizda, mahsulotning haqiqiyligi (autentifikatsiya) va kafolat pasporti ochiladi. Agar kiyimiz tasodifan shikastlansa yoki yirtilsa, bizning flagman studiyalarimiz uni bepul ta’mirlab, tikuvlarini qayta ultratovush bilan payvandlab beradi.',
    aEn: 'Every authentic VANTEGE WEAR shell has an embedded NFC cryptographic passport behind the storm placket. Tapping it with any smartphone proves authenticity and logs service records. We provide complimentary ultrasonic seam repairs at all flagship laboratories worldwide.',
  },
  {
    category: 'Warranty',
    qUz: 'Kiyim to‘g‘ri kelmasa almashtirish yoki qaytarish mumkinmi?',
    qEn: 'What is the return and exchange policy?',
    aUz: 'Albatta! Agar o‘lcham yoki model sizga ma’qul kelmasa, mahsulot yetkazilgan kundan boshlab 14 kun ichida uni mutlaqo bepul almashtirishingiz yoki pulingizni 100% qaytarib olishingiz mumkin.',
    aEn: 'We offer a 14-day hassle-free return and exchange window. If the fit isn’t perfect, our concierge arranges courier collection at zero additional cost.',
  },
];

export default function FaqPage() {
  const { language } = useLanguage();
  const uz = language === 'uz';

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter((f) => {
    if (activeCategory !== 'All' && f.category !== activeCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.qUz.toLowerCase().includes(q) ||
        f.qEn.toLowerCase().includes(q) ||
        f.aUz.toLowerCase().includes(q) ||
        f.aEn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ShellLayout activeSection="faq">
      <ShellBagConsumer>
        {({ showToast }) => (
          <div className="faq-page-container">
            <div className="faq-header">
              <span className="cat-kicker-tag">SUPPORT & KNOWLEDGE BASE</span>
              <h1>
                {uz ? 'Ko‘p Beriladigan ' : 'Frequently Asked '}
                <span>{uz ? 'Savollar' : 'Questions'}</span>
              </h1>
              <p className="faq-subtitle">
                {uz
                  ? 'Mato texnologiyalari, o‘lchamlar, parvarish va global yetkazib berish bo‘yicha to‘liq qo‘llanma.'
                  : 'Everything you need to know about nanotechnology membranes, sizing accuracy, and lifetime warranty.'}
              </p>

              <div className="faq-search-wrap">
                <input
                  type="text"
                  placeholder={uz ? 'Savolingizni yozing (masalan: yuvish, kafolat, o‘lcham)...' : 'Search answers...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="faq-search-input"
                />
              </div>

              <div className="faq-cat-chips">
                {['All', 'Product', 'Fitting', 'Shipping', 'Warranty'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`look-chip ${activeCategory === cat ? 'on' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="faq-accordion-list">
              {filtered.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                    >
                      <span className="faq-q-text">{uz ? faq.qUz : faq.qEn}</span>
                      <span className="faq-arrow">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                      <div className="faq-answer-box">
                        <p>{uz ? faq.aUz : faq.aEn}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Concierge Help Callout */}
            <div className="faq-contact-card">
              <div className="faq-contact-info">
                <h3>{uz ? 'Javob topa olmadingizmi?' : 'Still have questions?'}</h3>
                <p>
                  {uz
                    ? 'Bizning shaxsiy stilist va muhandis konsyerj xizmati 24/7 rejimida yordam berishga tayyor.'
                    : 'Our 24/7 dedicated concierge is standing by to assist with sizing, custom tailoring, or corporate orders.'}
                </p>
              </div>
              <div className="faq-contact-actions">
                <a href="/contact" className="primary-cta">
                  <span>{uz ? 'Konsyerj bilan Bog‘lanish' : 'Message Concierge'}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </ShellBagConsumer>
    </ShellLayout>
  );
}
