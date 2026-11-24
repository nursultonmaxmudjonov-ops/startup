'use client';

import React, { useState } from 'react';
import { useLanguage, type Language } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';

export type HeaderSectionId =
  | 'stage'
  | 'studio'
  | 'network'
  | 'stores'
  | 'journal'
  | 'catalog'
  | 'admin'
  | 'faq';

interface HeaderProps {
  activeSection: HeaderSectionId;
  bagBtnRef: React.RefObject<HTMLButtonElement | null>;
  shownBagCount: number;
  bumpKey: number;
  onOpenBag: () => void;
}

export default function Header({
  activeSection,
  bagBtnRef,
  shownBagCount,
  bumpKey,
  onOpenBag,
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, openAuthModal, openOrdersModal } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langRef = React.useRef<HTMLDivElement | null>(null);

  // Close language dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    if (langMenuOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [langMenuOpen]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const NAV: Array<{ id: HeaderSectionId; href: string; label: string }> = [
    { id: 'stage', href: '/', label: t.navRunway },
    { id: 'studio', href: '/fitting', label: t.navFitting },
    { id: 'catalog', href: '/catalog', label: t.navCatalog },
    { id: 'network', href: '/network', label: t.navNetwork },
    { id: 'stores', href: '/stores', label: t.navStores },
    { id: 'journal', href: '/journal', label: t.navJournal },
  ];

  const handleLangChange = (lng: Language) => {
    setLanguage(lng);
    setLangMenuOpen(false);
  };

  return (
    <>
      <header id="siteHeader">
        <div className="hdr-left">
          <a className="hdr-brand" href="/" aria-label="VANTEGE WEAR Shell home">
            <svg width="34" height="17" viewBox="0 0 40 20" fill="none" aria-hidden="true">
              <path
                d="M4 13.5C9.5 13.5 14 10.6 18.4 6.2C20.1 4.5 22.8 4 25.2 4.8L36 8.3C30.8 8.8 27.6 10.6 24.4 13.4C20.5 16.8 14.8 17.3 9.2 15.6C7.1 15 5.4 14.2 4 13.5Z"
                fill="#fff"
              />
              <path
                d="M13.5 12.6C17.2 11.4 20.6 9.3 23.8 6.8"
                stroke="#0d0e10"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <span className="hdr-wordmark">VANTEGE WEAR</span>
          </a>
          <span className="hdr-tag">{t.brandTag}</span>
        </div>

        <nav className="hdr-nav" aria-label="Sections">
          {NAV.map((n) => (
            <a
              key={n.id}
              className={`hdr-link${activeSection === n.id ? ' on' : ''}`}
              href={n.href}
            >
              <span>{n.label}</span>
            </a>
          ))}
        </nav>

        <div className="hdr-right">
          {/* Language Switcher */}
          <div className="lang-selector-wrap" ref={langRef}>
            <button
              type="button"
              className="lang-toggle-btn"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-label="Change language"
            >
              <span className="lang-flag">
                {language === 'uz' ? '🇺🇿 UZ' : language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
              </span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                <path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {langMenuOpen && (
              <div className="lang-dropdown-menu">
                <button
                  type="button"
                  className={`lang-option ${language === 'uz' ? 'active' : ''}`}
                  onClick={() => handleLangChange('uz')}
                >
                  <span className="flag">🇺🇿</span>
                  <span>O‘zbekcha (UZ)</span>
                </button>
                <button
                  type="button"
                  className={`lang-option ${language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLangChange('en')}
                >
                  <span className="flag">🇬🇧</span>
                  <span>English (EN)</span>
                </button>
                <button
                  type="button"
                  className={`lang-option ${language === 'ru' ? 'active' : ''}`}
                  onClick={() => handleLangChange('ru')}
                >
                  <span className="flag">🇷🇺</span>
                  <span>Русский (RU)</span>
                </button>
              </div>
            )}
          </div>

          {/* Admin shortcut if logged in as admin */}
          {isAdmin && (
            <a
              href="/admin"
              className={`hdr-admin-btn ${activeSection === 'admin' ? 'on' : ''}`}
              title="Admin Panel"
            >
              <span className="admin-glow-dot" />
              <span>ADMIN</span>
            </a>
          )}

          {/* User Auth Profile */}
          {user ? (
            <button
              type="button"
              className="user-profile-btn"
              onClick={openOrdersModal}
              title={`${user.name} (${user.email})`}
            >
              <span className="user-avatar-circle">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="user-profile-name">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              type="button"
              className="hdr-auth-btn"
              onClick={() => openAuthModal('login')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{t.signIn}</span>
            </button>
          )}

          {/* Fitting CTA Button */}
          <a className="hdr-cta" href="/fitting">
            <span>{t.dressModel}</span>
            <svg
              width="14"
              height="10"
              viewBox="0 0 20 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="6" x2="18" y2="6" />
              <polyline points="13.5,1.5 18,6 13.5,10.5" />
            </svg>
          </a>

          {/* Bag button */}
          <button
            ref={bagBtnRef}
            className="nav-btn"
            id="bagBtn"
            type="button"
            onClick={onOpenBag}
            aria-label="Open shopping bag"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.2 6.5h9.6l.8 8.7H3.4l.8-8.7z" />
              <path d="M6.4 6.5V5.2a2.6 2.6 0 0 1 5.2 0v1.3" />
            </svg>
            <span
              key={bumpKey}
              id="bagBadge"
              className={`${shownBagCount > 0 ? 'on' : ''}${bumpKey > 0 && shownBagCount > 0 ? ' bump' : ''}`}
              aria-live="polite"
            >
              {shownBagCount}
            </span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            type="button"
            className="hdr-mobile-burger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-top">
              <span className="mobile-menu-title">VANTEGE WEAR ARCHIVE</span>
              <button
                type="button"
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="mobile-nav-links">
              {NAV.map((n) => (
                <a
                  key={n.id}
                  href={n.href}
                  className={`mobile-nav-link ${activeSection === n.id ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{n.label}</span>
                </a>
              ))}
              {isAdmin && (
                <a
                  href="/admin"
                  className="mobile-nav-link admin-highlight"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>⚡ {t.navAdmin}</span>
                </a>
              )}
            </div>

            <div className="mobile-drawer-footer">
              <div className="mobile-lang-row">
                <span className="mobile-lang-label">Til / Language:</span>
                <div className="mobile-lang-chips">
                  <button
                    type="button"
                    className={`lang-chip ${language === 'uz' ? 'on' : ''}`}
                    onClick={() => handleLangChange('uz')}
                  >
                    O‘zbek
                  </button>
                  <button
                    type="button"
                    className={`lang-chip ${language === 'en' ? 'on' : ''}`}
                    onClick={() => handleLangChange('en')}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className={`lang-chip ${language === 'ru' ? 'on' : ''}`}
                    onClick={() => handleLangChange('ru')}
                  >
                    Русский
                  </button>
                </div>
              </div>

              {user ? (
                <div className="mobile-user-row">
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button
                    type="button"
                    className="mobile-auth-action"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openOrdersModal();
                    }}
                  >
                    {t.myOrders}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="mobile-auth-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                >
                  {t.signIn} / {t.signUp}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
