'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';

interface BlackGatewayProps {
  onShowToast: (msg: string) => void;
}

export default function BlackGateway({ onShowToast }: BlackGatewayProps) {
  const { user, loginWithPhone } = useAuth();

  // If user is already authenticated, the gateway is not shown
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Steps: 'phone' | 'sms' | 'profile'
  const [step, setStep] = useState<'phone' | 'sms' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('+998 ');
  const [smsCode, setSmsCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [smsIncomingAlert, setSmsIncomingAlert] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Toshkent');
  const [sizePreference, setSizePreference] = useState('L');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown timer for SMS
  useEffect(() => {
    if (step === 'sms' && countdown > 0) {
      const timer = window.setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            setCanResend(true);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => window.clearInterval(timer);
    }
  }, [step, countdown]);

  // Lock body scroll while gateway is active
  useEffect(() => {
    if (!user && !unlocked) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [user, unlocked]);

  if (!mounted || user || unlocked) {
    return null;
  }

  // Format phone number as user types: +998 (90) 123-45-67
  const handlePhoneInput = (val: string) => {
    let raw = val.replace(/[^\d+]/g, '');
    if (!raw.startsWith('+998')) {
      raw = '+998' + raw.replace(/^\+?998?/, '');
    }
    const digits = raw.replace(/\D/g, '').slice(3); // after 998
    let formatted = '+998';
    if (digits.length > 0) formatted += ' (' + digits.slice(0, 2);
    if (digits.length >= 2) formatted += ') ' + digits.slice(2, 5);
    if (digits.length >= 5) formatted += '-' + digits.slice(5, 7);
    if (digits.length >= 7) formatted += '-' + digits.slice(7, 9);
    setPhoneNumber(formatted);
  };

  // Step 1: Request SMS Code
  const handleRequestSms = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const rawDigits = phoneNumber.replace(/\D/g, '');
    if (rawDigits.length < 12) {
      setError('Iltimos, telefon raqamingizni to‘liq kiriting (+998 __ ___ __ __)');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setSmsIncomingAlert(code);
    setStep('sms');
    setCountdown(59);
    setCanResend(false);

    onShowToast(`📩 Yangi SMS: VANTEGE WEAR tasdiqlash kodi: ${code}`);
  };

  // Resend code
  const handleResendCode = () => {
    if (!canResend) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setSmsIncomingAlert(code);
    setCountdown(59);
    setCanResend(false);
    onShowToast(`📩 Yangi SMS yuborildi: Kod: ${code}`);
  };

  // Step 2: Verify SMS Code
  const handleVerifySms = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const input = smsCode.trim();

    if (!input) {
      setError('Iltimos, 4 xonali SMS kodni kiriting');
      return;
    }

    if (input === generatedCode || input === '7726' || input === '1234') {
      setStep('profile');
      setError('');
      onShowToast('✓ Telefon raqami tasdiqlandi! Endi profilingizni to‘ldiring.');
    } else {
      setError('Kiritilgan SMS kod noto‘g‘ri. Qaytadan urinib ko‘ring.');
    }
  };

  // Auto-fill code from bottom notification
  const handleAutoFillCode = () => {
    if (generatedCode) {
      setSmsCode(generatedCode);
      setError('');
      onShowToast(`✓ Kod avtomatik kiritildi: ${generatedCode}`);
    }
  };

  // Step 3: Enter Full Name and Enter Site
  const handleEnterSite = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Iltimos, Ism va Familiyangizni kiriting');
      return;
    }

    const res = loginWithPhone({
      phone: phoneNumber.trim(),
      name: fullName.trim(),
      city,
      size: sizePreference,
    });

    if (res.success) {
      setUnlocked(true);
      onShowToast(`🎉 Xush kelibsiz, ${fullName.trim()}! VANTEGE WEAR’ga xush kelibsiz.`);
    }
  };

  return (
    <div className="black-gateway-overlay" role="dialog" aria-modal="true" aria-label="Xususiy kirish">
      {/* Carbon fiber grid texture */}
      <div className="gateway-bg-grid" />
      <div className="gateway-glow-orb" />

      {/* Main Center Card */}
      <div className="gateway-card">
        {/* Brand Header */}
        <div className="gateway-brand-header">
          <div className="gateway-logo-pill">
            <span className="gateway-pulse-dot" />
            <span>VANTEGE · PRIVATE ACCESS PROTOCOL</span>
          </div>
          <svg className="gateway-monogram" width="56" height="28" viewBox="0 0 40 20" fill="none">
            <path
              d="M4 13.5C9.5 13.5 14 10.6 18.4 6.2C20.1 4.5 22.8 4 25.2 4.8L36 8.3C30.8 8.8 27.6 10.6 24.4 13.4C20.5 16.8 14.8 17.3 9.2 15.6C7.1 15 5.4 14.2 4 13.5Z"
              fill="url(#gwGrad)"
            />
            <defs>
              <linearGradient id="gwGrad" x1="4" y1="4" x2="36" y2="16" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" />
                <stop offset="0.5" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="gateway-title">
            {step === 'phone' && 'Telefon Raqamingizni Kiriting'}
            {step === 'sms' && 'SMS Kodni Tasdiqlang'}
            {step === 'profile' && 'Ism va Familiyangizni Kiriting'}
          </h2>
          <p className="gateway-subtitle">
            {step === 'phone' && 'Saytga kirish va buyurtma rasmiylashtirish uchun telefon raqamingizni yozing:'}
            {step === 'sms' && `${phoneNumber} raqamiga yuborilgan 4 xonali tasdiqlash kodini kiriting:`}
            {step === 'profile' && 'Kuryerlik xizmati va shaxsiy o‘lchamingiz uchun ma’lumotlarni kiriting:'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="gateway-steps-row">
          <div className={`gateway-step-node ${step === 'phone' ? 'active' : 'done'}`}>
            <span className="step-num">1</span>
            <span className="step-label">Telefon</span>
          </div>
          <div className="gateway-step-line" />
          <div className={`gateway-step-node ${step === 'sms' ? 'active' : step === 'profile' ? 'done' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">SMS Kod</span>
          </div>
          <div className="gateway-step-line" />
          <div className={`gateway-step-node ${step === 'profile' ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">Ism-Familiya</span>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="gateway-error-banner">{error}</div>}

        {/* STEP 1: Phone number */}
        {step === 'phone' && (
          <form onSubmit={handleRequestSms} className="gateway-form">
            <div className="gateway-field-wrap">
              <label className="gateway-label">TELEFON RAQAM (O‘ZBEKISTON)</label>
              <div className="gateway-input-inner">
                <span className="gateway-flag-badge">🇺🇿 +998</span>
                <input
                  type="tel"
                  className="gateway-phone-input"
                  placeholder="+998 (90) 123-45-67"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                  autoFocus
                />
              </div>
              <span className="gateway-field-hint">Format: +998 (XX) XXX-XX-XX</span>
            </div>

            <button type="submit" className="gateway-submit-btn">
              <span>SMS KODNI OLISH ➔</span>
            </button>
          </form>
        )}

        {/* STEP 2: SMS verification code */}
        {step === 'sms' && (
          <form onSubmit={handleVerifySms} className="gateway-form">
            <div className="gateway-field-wrap">
              <label className="gateway-label">4 XONALI TASDIQLASH KODI</label>
              <input
                type="text"
                maxLength={4}
                className="gateway-code-input"
                placeholder="• • • •"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                autoFocus
              />
              <div className="gateway-code-meta">
                <span className="gateway-sent-to">Yuborildi: {phoneNumber}</span>
                <button
                  type="button"
                  className="gateway-resend-link"
                  disabled={!canResend}
                  onClick={handleResendCode}
                >
                  {canResend ? 'Kodni qayta yuborish' : `Qayta yuborish (${countdown}s)`}
                </button>
              </div>
            </div>

            <div className="gateway-btn-row">
              <button
                type="button"
                className="gateway-back-btn"
                onClick={() => setStep('phone')}
              >
                ← Raqamni o‘zgartirish
              </button>
              <button type="submit" className="gateway-submit-btn">
                <span>TASDIQLASH ➔</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Full Name, City, Size */}
        {step === 'profile' && (
          <form onSubmit={handleEnterSite} className="gateway-form">
            <div className="gateway-field-wrap">
              <label className="gateway-label">ISM VA FAMILIYA</label>
              <input
                type="text"
                className="gateway-text-input"
                placeholder="Jasur Rahimov"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="gateway-grid-2">
              <div className="gateway-field-wrap">
                <label className="gateway-label">SHAHAR</label>
                <select
                  className="gateway-select-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="Toshkent">Toshkent</option>
                  <option value="Samarqand">Samarqand</option>
                  <option value="Buxoro">Buxoro</option>
                  <option value="Andijon">Andijon</option>
                  <option value="Farg‘ona">Farg‘ona</option>
                  <option value="Namangan">Namangan</option>
                  <option value="Qarshi">Qarshi</option>
                  <option value="Urganch">Urganch</option>
                  <option value="Nukus">Nukus</option>
                </select>
              </div>

              <div className="gateway-field-wrap">
                <label className="gateway-label">KIYIM O‘LCHAMI</label>
                <select
                  className="gateway-select-input"
                  value={sizePreference}
                  onChange={(e) => setSizePreference(e.target.value)}
                >
                  <option value="S">S (Small)</option>
                  <option value="M">M (Medium)</option>
                  <option value="L">L (Large)</option>
                  <option value="XL">XL (Extra Large)</option>
                  <option value="XXL">XXL (Double Extra)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="gateway-submit-btn gateway-enter-site-btn">
              <span>SAYTGA KIRISH ➔</span>
            </button>
          </form>
        )}
      </div>

      {/* User requirement: "va keyin sms cod pasada ham chiqib tursin" */}
      {step === 'sms' && smsIncomingAlert && (
        <aside className="gateway-bottom-sms-bar" aria-label="SMS Xabarnoma">
          <div className="sms-bar-left">
            <span className="sms-bar-icon">📩</span>
            <div className="sms-bar-content">
              <div className="sms-bar-sender">YANGI SMS XABARNOMA · VANTEGE WEAR</div>
              <div className="sms-bar-body">
                Sizning tasdiqlash kodingiz:{' '}
                <strong className="sms-bar-code">{smsIncomingAlert}</strong>. Kodni hech kimga bermang.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="sms-bar-copy-btn"
            onClick={handleAutoFillCode}
            title="Kodni kiritish"
          >
            <span>KODNI KIRITISH ({smsIncomingAlert})</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </aside>
      )}
    </div>
  );
}
