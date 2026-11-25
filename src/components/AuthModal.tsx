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
    register,
    updateSupabaseCredentials,
  } = useAuth();
  const { t, language } = useLanguage();
  const uz = language === 'uz';

  const [mode, setMode] = useState<'phone' | 'login' | 'register'>('phone');

  // Phone registration steps: 'phone' | 'code' | 'profile'
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
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

  // Format phone number nicely as user types: (90) 123-45-67 (prefix +998 shown separately)
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
    let formatted = '';
    if (digits.length > 0) formatted = '(' + digits.slice(0, 2);
    if (digits.length >= 2) formatted += ') ' + digits.slice(2, 5);
    if (digits.length >= 5) formatted += '-' + digits.slice(5, 7);
    if (digits.length >= 7) formatted += '-' + digits.slice(7, 9);
    setPhoneNumber(formatted);
  };

  // Step 1: Send SMS code
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const rawDigits = '998' + phoneNumber.replace(/\D/g, '');
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
                  <div
                    className="phone-prefix-wrap"
                    onClick={() => {
                      // focus input and set caret at end
                      const el = document.getElementById('phone-input') as HTMLInputElement | null;
                      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
                    }}
                  >
                    <span className="phone-prefix">+998</span>
                    <input
                      id="phone-input"
                      type="tel"
                      required
                      autoFocus
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="(90) 123-45-67"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      style={{ fontSize: '16px', letterSpacing: '0.05em', fontWeight: 600, border: 'none', background: 'transparent', color: '#f1f5f9', outline: 'none', flex: 1, minWidth: 0, padding: 0, caretColor: '#60a5fa' }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    O‘zbekiston, Qozog‘iston yoki xalqaro formatda kiritishingiz mumkin.
                  </span>
                </div>

                <button type="submit" className="primary-cta" style={{ width: '100%', marginTop: '8px' }}>
                  <span>SMS KOD OLISH ➔</span>
                </button>
                <button
                  type="button"
                  className="auth-switch-alt"
                  onClick={() => setMode('login')}
                >
                  Email va parol orqali kirish
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
                    <strong>+998 {phoneNumber}</strong> raqamiga yuborilgan 4 xonali kod:
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
                  <div className="name-input-wrap">
                    <span className="name-input-icon">👤</span>
                    <input
                      type="text"
                      required
                      autoFocus
                      autoComplete="name"
                      placeholder="Masalan: Jasur Alimov"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
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

        {/* Mode switcher + Demo Admin */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
            <button
              type="button"
              onClick={() => setMode(mode === 'phone' ? 'login' : 'phone')}
              className="auth-switch-alt"
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
