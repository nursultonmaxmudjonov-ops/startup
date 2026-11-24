'use client';

import React from 'react';
import { useReveal } from '@/src/components/useReveal';
import { useLanguage, type Language } from '@/src/context/LanguageContext';

interface FooterProps {
  onShowToast: (msg: string) => void;
}

const SOCIALS: Array<{ label: string; href: string; icon: React.ReactNode }> = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Telegram',
    href: 'https://telegram.org',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 4.5 2.8 11.7c-.9.35-.85 1.6.08 1.9l4.7 1.5 1.8 5.4c.3.85 1.4.95 1.9.2l2.5-3.6 4.9 3.6c.8.55 1.9.1 2.1-.85l3-13.4c.2-1-.7-1.85-1.68-1.5Z" />
        <path d="M7.6 15.1 21.5 4.5 9.4 15.3l.4 4.9" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5.5" width="20" height="13" rx="4" />
        <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3v10.6a4.4 4.4 0 1 1-3.6-4.33" />
        <path d="M14 3c.4 2.6 2.1 4.6 4.9 4.9" />
      </svg>
    ),
  },
];

export default function Footer({ onShowToast }: FooterProps) {
  const rootRef = useReveal<HTMLElement>();
  const { language, setLanguage, t } = useLanguage();

  const handleLang = (lng: Language) => {
    setLanguage(lng);
    onShowToast(t.toastLanguageChanged);
  };

  return (
    <footer id="siteFooter" ref={rootRef} aria-label="Site footer">
      <div className="ft-top">
        <div className="ft-brand">
          <svg width="34" height="17" viewBox="0 0 40 20" fill="none" aria-hidden="true">
            <path
              d="M4 13.5C9.5 13.5 14 10.6 18.4 6.2C20.1 4.5 22.8 4 25.2 4.8L36 8.3C30.8 8.8 27.6 10.6 24.4 13.4C20.5 16.8 14.8 17.3 9.2 15.6C7.1 15 5.4 14.2 4 13.5Z"
              fill="#fff"
            />
            <path d="M13.5 12.6C17.2 11.4 20.6 9.3 23.8 6.8" stroke="#0d0e10" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <div>
            <div className="ft-wordmark">VANTEGE WEAR SHELL ARCHIVE</div>
            <p className="ft-tag">
              {language === 'uz'
                ? 'Hech kim ko‘rmaydigan tungi soatlar uchun texnik tashqi kiyim. Toshkentda loyihalangan, butun dunyoda qorong‘uda kiyiladi.'
                : language === 'ru'
                ? 'Технологичная верхняя одежда для ночных часов. Спроектировано в Ташкенте, носится по всему миру после полуночи.'
                : 'Technical outerwear for the hours nobody sees. Engineered in Tashkent, worn everywhere after dark.'}
            </p>
          </div>
        </div>

        <div className="ft-links">
          <div className="ft-col">
            <div className="ft-col-head">{language === 'uz' ? 'Kolleksiya' : language === 'ru' ? 'Коллекция' : 'Archive'}</div>
            <a href="/" className="ft-link">{t.navRunway}</a>
            <a href="/fitting" className="ft-link">{t.navFitting}</a>
            <a href="/catalog" className="ft-link">{t.navCatalog}</a>
          </div>

          <div className="ft-col">
            <div className="ft-col-head">{language === 'uz' ? 'Studiyalar & Laboratoriya' : language === 'ru' ? 'Студии и Наука' : 'Studios & Labs'}</div>
            <a href="/network" className="ft-link">{t.navNetwork}</a>
            <a href="/stores" className="ft-link">{t.navStores}</a>
            <a href="/journal" className="ft-link">{t.navJournal}</a>
          </div>

          <div className="ft-col">
            <div className="ft-col-head">{language === 'uz' ? 'Yordam & Platforma' : language === 'ru' ? 'Поддержка' : 'Support & Access'}</div>
            <a href="/faq" className="ft-link">{t.navFaq}</a>
            <a href="/contact" className="ft-link">{t.navContact}</a>
            <a href="/admin" className="ft-link ft-admin-link">⚡ {t.navAdmin}</a>
          </div>
        </div>
      </div>

      <div className="ft-mid">
        <div className="ft-social">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              className="ft-social-btn"
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
        </div>

        <div className="ft-lang-pills">
          <button
            type="button"
            className={`ft-lang-btn ${language === 'uz' ? 'active' : ''}`}
            onClick={() => handleLang('uz')}
          >
            🇺🇿 O‘zbekcha
          </button>
          <button
            type="button"
            className={`ft-lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleLang('en')}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            className={`ft-lang-btn ${language === 'ru' ? 'active' : ''}`}
            onClick={() => handleLang('ru')}
          >
            🇷🇺 Русский
          </button>
        </div>

        <div className="ft-contact">
          <span>concierge@vantegewear.com</span>
          <span className="ft-sep">·</span>
          <span>+998 (71) 200-26-26</span>
          <span className="ft-sep">·</span>
          <span>Tashkent City Mall, Level 2, UZ</span>
        </div>
      </div>

      <div className="ft-bottom">
        <span>© 2026 VANTEGE WEAR Shell Archive LLC. All rights reserved.</span>
        <span className="ft-dim">HexaWeave™ Membrane · SonicWelding™ · Spatial Fitting AI v2.6</span>
      </div>
    </footer>
  );
}
