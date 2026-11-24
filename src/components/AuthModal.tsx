'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';

interface AuthModalProps {
  onShowToast: (msg: string) => void;
}

export default function AuthModal({ onShowToast }: AuthModalProps) {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    isSupabaseConnected,
    supabaseUrl,
    login,
    loginWithPhone,
    loginWithGoogle,
    loginWithTelegram,
    register,
    updateSupabaseCredentials,
  } = useAuth();
  const { t, language } = useLanguage();
  const uz = language === 'uz';

  const [mode, setMode] = useState<'phone' | 'login' | 'register'>('phone');

  // Phone registration steps: 'phone' | 'code' | 'profile'
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('+998 ');
  const [smsCode, setSmsCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [simulatedIncomingSms, setSimulatedIncomingSms] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Profile data in phone registration
  const [fullName, setFullName] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tashkent');
  const [selectedSize, setSelectedSize] = useState('M');

  // Email / Password mode states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingTelegram, setLoadingTelegram] = useState(false);

  // Supabase settings panel
  const [showSupabaseSettings, setShowSupabaseSettings] = useState(false);
  const [inputSbUrl, setInputSbUrl] = useState('');
  const [inputSbAnonKey, setInputSbAnonKey] = useState('');
  const [sbSaveMsg, setSbSaveMsg] = useState('');

  // Sync mode when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode || 'phone');
      setPhoneStep('phone');
      setError('');
      setSmsCode('');
      setSimulatedIncomingSms(null);
      setLoadingGoogle(false);
      setLoadingTelegram(false);
      setShowSupabaseSettings(false);
      setSbSaveMsg('');
    }
  }, [isAuthModalOpen, authModalMode]);

  // SMS Resend countdown timer
  useEffect(() => {
    if (phoneStep === 'code' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            setCanResend(true);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phoneStep, countdown]);

  if (!isAuthModalOpen) return null;

  // Format phone number nicely as user types: +998 (90) 123-45-67
  const handlePhoneChange = (val: string) => {
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

  // Step 1: Send SMS code
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const rawDigits = phoneNumber.replace(/\D/g, '');
    if (rawDigits.length < 12) {
      setError(uz ? 'Iltimos, to‘liq telefon raqamingizni kiriting (+998 ...)' : 'Please enter a valid phone number');
      return;
    }

    // Generate random 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setPhoneStep('code');
    setCountdown(59);
    setCanResend(false);

    // Realistic SMS notification simulation
    const alertMsg = `📩 Yangi SMS: VANTEGE WEAR tasdiqlash kodi: ${code}`;
    setSimulatedIncomingSms(code);
    onShowToast(alertMsg);
  };

  // Step 2: Verify SMS code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const input = smsCode.trim();

    if (!input) {
      setError(uz ? 'Iltimos, 4 xonali SMS kodni kiriting' : 'Please enter the 4-digit code');
      return;
    }

    // Accept generated code or standard passcodes 7726 / 1234
    if (input === generatedCode || input === '7726' || input === '1234') {
      setPhoneStep('profile');
      setError('');
      onShowToast(uz ? '✓ Telefon raqami tasdiqlandi! Endi ismingizni kiriting.' : '✓ Phone verified! Now enter your name.');
    } else {
      setError(uz ? 'SMS kod noto‘g‘ri kiritildi. Qaytadan urinib ko‘ring.' : 'Invalid SMS code. Please try again.');
    }
  };

  // Step 3: Complete profile and register
  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(uz ? 'Iltimos, to‘liq ism va familiyangizni kiriting' : 'Please enter your full name');
      return;
    }

    const res = loginWithPhone({
      phone: phoneNumber.trim(),
      name: fullName.trim(),
      city: selectedCity,
      size: selectedSize,
    });

    if (res.success) {
      onShowToast(`🎉 Xush kelibsiz, ${res.user.name}! Ro‘yxatdan muvaffaqiyatli o‘tdingiz.`);
    }
  };

  // Standard Email Login / Register handlers
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (res.success) {
      onShowToast(t.toastLoggedIn);
    } else {
      setError(res.error || 'Kirishda xatolik yuz berdi');
    }
  };

  const handleEmailRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = register({ name: fullName, email, pass: password, city: selectedCity, size: selectedSize });
    if (res.success) {
      onShowToast(t.toastRegistered);
    } else {
      setError(res.error || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoadingGoogle(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onShowToast('Google orqali kirdingiz!');
      } else {
        setError(res.error || 'Google orqali kirishda xatolik');
        if (!isSupabaseConnected) setShowSupabaseSettings(true);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleTelegramLogin = async () => {
    setError('');
    setLoadingTelegram(true);
    try {
      const res = await loginWithTelegram();
      if (res.success) {
        onShowToast('Telegram orqali kirdingiz!');
      } else {
        setError(res.error || 'Telegram orqali kirishda xatolik');
      }
    } finally {
      setLoadingTelegram(false);
    }
  };

  const fillDemoAdmin = () => {
    const res = login('admin@vantegewear.com', 'admin123');
    if (res.success) onShowToast('⚡ Demo Admin (Aziz Karimov) sifatida kirdingiz');
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSbUrl.trim() || !inputSbAnonKey.trim()) {
      setSbSaveMsg('Iltimos, URL va Anon Key ni to‘liq kiriting');
      return;
    }
    const ok = updateSupabaseCredentials(inputSbUrl.trim(), inputSbAnonKey.trim());
    if (ok) {
      setSbSaveMsg('✓ Supabase sozlamalari saqlandi va ulandi!');
      setTimeout(() => setShowSupabaseSettings(false), 1200);
    } else {
      setSbSaveMsg('Xatolik: Supabase URL formati noto‘g‘ri');
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Kirish va Ro‘yxatdan o‘tish"
        style={{ maxWidth: '440px' }}
      >
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          type="button"
          aria-label="Yopish"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header" style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#60a5fa', borderRadius: '999px', padding: '3px 12px', fontSize: '11px', fontWeight: 700, marginBottom: '10px' }}>
            <span>⚡ VANTEGE ID PASSPORT</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
            {mode === 'phone'
              ? (phoneStep === 'phone' ? 'Telefon Raqam orqali Kirish' : phoneStep === 'code' ? 'SMS Kodni Tasdiqlash' : 'Profilingizni Yarating')
              : mode === 'login'
              ? 'Tizimga Kirish'
              : 'Yangi Profil Yaratish'}
          </h2>
          <p className="auth-sub" style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
            {mode === 'phone'
              ? (phoneStep === 'phone'
                  ? 'Buyurtma rasmiylashtirish va tizimdan foydalanish uchun telefon raqamingizni kiriting:'
                  : phoneStep === 'code'
                  ? `Telefoningizga 4 xonali tasdiqlash kodi yuborildi.`
                  : 'Kuryerlik xizmati va shaxsiy o‘lchamingiz uchun ma’lumotlarni kiriting:')
              : 'VANTEGE WEAR ekotizimiga xush kelibsiz.'}
          </p>
        </div>

        {error && (
          <div className="auth-error-banner" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* ==============================================================
            PHONE STEPPER MODE (PRIMARY USER FLOW)
            ============================================================== */}
        {mode === 'phone' && (
          <div className="phone-onboard-wrap">
            {/* Step Indicators */}
            <div className="phone-step-indicator">
              <div className={`phone-dot ${phoneStep === 'phone' ? 'active' : 'done'}`} />
              <div className={`phone-dot ${phoneStep === 'code' ? 'active' : phoneStep === 'profile' ? 'done' : ''}`} />
              <div className={`phone-dot ${phoneStep === 'profile' ? 'active' : ''}`} />
            </div>

            {/* Step 1: Input Phone Number */}
            {phoneStep === 'phone' && (
              <form onSubmit={handleSendCode} className="auth-form">
                <div className="auth-field">
                  <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Telefon raqamingiz:</label>
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="+998 (90) 123-45-67"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    style={{ fontSize: '16px', letterSpacing: '0.05em', fontWeight: 600 }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    O‘zbekiston, Qozog‘iston yoki xalqaro formatda kiritishingiz mumkin.
                  </span>
                </div>

                <button type="submit" className="primary-cta" style={{ width: '100%', marginTop: '8px' }}>
                  <span>SMS KOD OLISH ➔</span>
                </button>
              </form>
            )}

            {/* Step 2: Input Verification Code */}
            {phoneStep === 'code' && (
              <form onSubmit={handleVerifyCode} className="auth-form">
                {simulatedIncomingSms && (
                  <div className="sms-simulated-alert" onClick={() => setSmsCode(simulatedIncomingSms)} style={{ cursor: 'pointer' }}>
                    <div className="sms-sim-text">
                      <span>📩 Yangi SMS keldi:</span>
                      <strong className="sms-sim-code">{simulatedIncomingSms}</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#4ade80', textDecoration: 'underline' }}>
                      Avto-kiritish ↵
                    </span>
                  </div>
                )}

                <div className="auth-field" style={{ textAlign: 'center' }}>
                  <label style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    <strong>{phoneNumber}</strong> raqamiga yuborilgan 4 xonali kod:
                  </label>
                  <div className="sms-code-inputs-row">
                    <input
                      type="text"
                      maxLength={4}
                      autoFocus
                      required
                      placeholder="••••"
                      className="sms-pin-input"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                  </div>

                  <div className="sms-resend-row">
                    <span>
                      {canResend ? 'Kod kelmadimi?' : `Qayta yuborish: ${countdown}s`}
                    </span>
                    <button
                      type="button"
                      className="sms-resend-btn"
                      disabled={!canResend}
                      onClick={() => {
                        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                        setGeneratedCode(newCode);
                        setSimulatedIncomingSms(newCode);
                        setCountdown(59);
                        setCanResend(false);
                        onShowToast(`📩 Yangi SMS: Tasdiqlash kodi: ${newCode}`);
                      }}
                    >
                      Kodni qayta yuborish
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="secondary-btn-border"
                    onClick={() => setPhoneStep('phone')}
                    style={{ flex: 1 }}
                  >
                    Raqamni o‘zgartirish
                  </button>
                  <button type="submit" className="primary-cta" style={{ flex: 2 }}>
                    <span>KODNI TASDIQLASH ➔</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Input Name, Surname and Details */}
            {phoneStep === 'profile' && (
              <form onSubmit={handleCompleteProfile} className="auth-form">
                <div className="auth-field">
                  <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Ism va Familiyangiz:</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Masalan: Jasur Alimov"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="auth-grid-2">
                  <div className="auth-field">
                    <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Shahar:</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="auth-select"
                    >
                      <option value="Tashkent">Toshkent</option>
                      <option value="Samarkand">Samarqand</option>
                      <option value="Bukhara">Buxoro</option>
                      <option value="Almaty">Olmaota</option>
                      <option value="Astana">Ostona</option>
                      <option value="Bishkek">Bishkek</option>
                      <option value="Dubai">Dubay</option>
                    </select>
                  </div>

                  <div className="auth-field">
                    <label style={{ fontSize: '12px', color: '#cbd5e1' }}>O‘lchamingiz:</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="auth-select"
                    >
                      <option value="S">S (Small)</option>
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="primary-cta" style={{ width: '100%', marginTop: '10px' }}>
                  <span>RO‘YXATDAN O‘TISHNI YAKUNLASH ✓</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ==============================================================
            EMAIL & PASSWORD MODE (ALTERNATIVE)
            ============================================================== */}
        {mode !== 'phone' && (
          <div>
            <div className="auth-tabs" style={{ marginBottom: '16px' }}>
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                Kirish
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => setMode('register')}
              >
                Ro‘yxatdan o‘tish
              </button>
            </div>

            <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailRegister} className="auth-form">
              {mode === 'register' && (
                <div className="auth-field">
                  <label>Ismingiz:</label>
                  <input
                    type="text"
                    required
                    placeholder="Jasur Alimov"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="auth-field">
                <label>Elektron pochta:</label>
                <input
                  type="email"
                  required
                  placeholder="nomingiz@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Parol:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                  >
                    {showPassword ? 'Yashirish' : 'Ko‘rish'}
                  </button>
                </div>
              </div>

              <button type="submit" className="primary-cta" style={{ width: '100%', marginTop: '8px' }}>
                <span>{mode === 'login' ? 'TIZIMGA KIRISH' : 'RO‘YXATDAN O‘TISH'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Social / Fast OAuth Buttons (Google + Telegram) */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="auth-social-grid" style={{ marginBottom: '12px' }}>
            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleLogin}
              disabled={loadingGoogle}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loadingGoogle ? 'Ulanmoqda...' : 'Google'}</span>
            </button>

            <button
              type="button"
              className="auth-telegram-btn"
              onClick={handleTelegramLogin}
              disabled={loadingTelegram}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              <span>{loadingTelegram ? 'Ulanmoqda...' : 'Telegram'}</span>
            </button>
          </div>

          {/* Alternate mode switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
            <button
              type="button"
              onClick={() => setMode(mode === 'phone' ? 'login' : 'phone')}
              style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              {mode === 'phone' ? 'Email va parol orqali kirish' : '📱 Telefon raqam orqali kirish'}
            </button>

            <button
              type="button"
              onClick={fillDemoAdmin}
              style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer', padding: 0 }}
            >
              ⚡ Demo Admin
            </button>
          </div>
        </div>

        {/* Supabase Settings Panel (Hidden by default) */}
        {showSupabaseSettings && (
          <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#facc15', marginBottom: '6px' }}>⚙️ SUPABASE SOZLAMALARI</div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px' }}>Supabase URL va Anon Key ni kiriting:</p>
            <form onSubmit={handleSaveSupabaseConfig} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={inputSbUrl}
                onChange={(e) => setInputSbUrl(e.target.value)}
                style={{ fontSize: '11px', padding: '8px' }}
              />
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={inputSbAnonKey}
                onChange={(e) => setInputSbAnonKey(e.target.value)}
                style={{ fontSize: '11px', padding: '8px' }}
              />
              <button type="submit" className="primary-cta" style={{ padding: '6px 12px', fontSize: '11px' }}>
                Saqlash va Ulanish
              </button>
              {sbSaveMsg && <span style={{ fontSize: '11px', color: '#4ade80' }}>{sbSaveMsg}</span>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
