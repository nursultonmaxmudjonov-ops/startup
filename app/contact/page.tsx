'use client';

import React, { useState } from 'react';
import ShellLayout from '@/src/components/ShellLayout';
import ShellBagConsumer from '@/src/components/ShellBagConsumer';
import { useLanguage } from '@/src/context/LanguageContext';

export default function ContactPage() {
  const { language } = useLanguage();
  const uz = language === 'uz';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('concierge');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent, showToast: (msg: string) => void) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Iltimos, barcha maydonlarni to‘ldiring');
      return;
    }
    setSubmitted(true);
    showToast('Xabaringiz qabul qilindi! Concierge 2 soat ichida javob beradi.');
  };

  return (
    <ShellLayout activeSection="faq">
      <ShellBagConsumer>
        {({ showToast }) => (
          <div className="contact-page-container">
            <div className="contact-header">
              <span className="cat-kicker-tag">VANTEGE WEAR HEADQUARTERS & CONCIERGE</span>
              <h1>
                {uz ? 'Biz bilan ' : 'Get in '}
                <span>{uz ? 'Bog‘lanish' : 'Touch'}</span>
              </h1>
              <p className="contact-subtitle">
                {uz
                  ? 'Mijoz konsyerji, flagman studiyalarga tashrif, B2B korporativ hamkorlik va venchur investorlar uchun rasmiy aloqa markazi.'
                  : 'Customer concierge, flagship appointments, wholesale distribution, and investor relations.'}
              </p>
            </div>

            <div className="contact-layout-grid">
              {/* Left Column: Direct Info */}
              <div className="contact-info-col">
                <div className="contact-card-box">
                  <h3>{uz ? 'To‘g‘ridan-to‘g‘ri Aloqa' : 'Direct Channels'}</h3>

                  <div className="contact-channel-item">
                    <span className="channel-icon">📞</span>
                    <div>
                      <strong>{uz ? 'Telefon & Concierge:' : 'Phone & Concierge:'}</strong>
                      <p>+998 (71) 200-26-26</p>
                      <span className="dim-txt">Dushanba — Yakshanba, 09:00 — 23:00</span>
                    </div>
                  </div>

                  <div className="contact-channel-item">
                    <span className="channel-icon">✉️</span>
                    <div>
                      <strong>{uz ? 'Mijozlar xizmati:' : 'Client Support:'}</strong>
                      <p>concierge@vantegewear.com</p>
                    </div>
                  </div>

                  <div className="contact-channel-item">
                    <span className="channel-icon">💼</span>
                    <div>
                      <strong>{uz ? 'Investorlar & B2B:' : 'Investors & Wholesale:'}</strong>
                      <p>investors@vantegewear.com</p>
                    </div>
                  </div>

                  <div className="contact-channel-item">
                    <span className="channel-icon">📍</span>
                    <div>
                      <strong>{uz ? 'Flagman Laboratoriya:' : 'Flagship Studio:'}</strong>
                      <p>Amir Temur ko‘chasi 108, Tashkent City Mall, Level 2</p>
                    </div>
                  </div>
                </div>

                <div className="contact-emergency-badge">
                  <span className="dot" />
                  <span>24/7 Night Dispatch Hotline Active</span>
                </div>
              </div>

              {/* Right Column: Interactive Form */}
              <div className="contact-form-col">
                {submitted ? (
                  <div className="contact-success-card">
                    <div className="success-icon">✓</div>
                    <h3>{uz ? 'Xabaringiz Qabul Qilindi!' : 'Transmission Received!'}</h3>
                    <p>
                      {uz
                        ? 'Rahmat! VANTEGE WEAR konsyerj jamoasi 2 soat ichida ko‘rsatilgan elektron pochta yoki telefon orqali siz bilan bog‘lanadi.'
                        : 'Our concierge or founding team will review your inquiry and respond within 2 hours.'}
                    </p>
                    <button
                      type="button"
                      className="primary-cta"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                      }}
                    >
                      {uz ? 'Yana xabar yuborish' : 'Send Another Message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleSubmit(e, showToast)} className="contact-form-card">
                    <h3>{uz ? 'Xabar Qoldirish' : 'Send an Inquiry'}</h3>

                    <div className="auth-field">
                      <label>{uz ? 'Murojaat turi:' : 'Inquiry Topic:'}</label>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="auth-select"
                      >
                        <option value="concierge">Mijoz konsyerji (O‘lcham & Xarid)</option>
                        <option value="investors">Venchur Investitsiya & Pitch Deck</option>
                        <option value="wholesale">B2B Ulgurji Savdo & Do‘konlar</option>
                        <option value="press">Matbuot & Media Materiallari</option>
                        <option value="careers">Karyera & Muhandislik Laboratoriyasi</option>
                      </select>
                    </div>

                    <div className="auth-field">
                      <label>{uz ? 'Ismingiz:' : 'Your Name:'}</label>
                      <input
                        type="text"
                        required
                        placeholder="Aziz Karimov"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="auth-field">
                      <label>{uz ? 'Elektron pochta:' : 'Email Address:'}</label>
                      <input
                        type="email"
                        required
                        placeholder="aziz@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="auth-field">
                      <label>{uz ? 'Xabaringiz:' : 'Message:'}</label>
                      <textarea
                        required
                        rows={5}
                        placeholder={uz ? 'Savolingiz yoki taklifingizni batafsil bayon qiling...' : 'Describe your inquiry...'}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="contact-textarea"
                      />
                    </div>

                    <button type="submit" className="primary-cta">
                      <span>{uz ? 'XABARNI YUBORISH' : 'TRANSMIT MESSAGE'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </ShellBagConsumer>
    </ShellLayout>
  );
}
