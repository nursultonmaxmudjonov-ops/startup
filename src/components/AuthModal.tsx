'use client';

import React, { useState } from 'react';
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
    loginWithGoogle,
    loginWithTelegram,
    register,
    updateSupabaseCredentials,
  } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Tashkent');
  const [size, setSize] = useState('M');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingTelegram, setLoadingTelegram] = useState(false);

  // Supabase kalitlarini kiritish paneli
  const [showSupabaseSettings, setShowSupabaseSettings] = useState(false);
  const [inputSbUrl, setInputSbUrl] = useState('');
  const [inputSbAnonKey, setInputSbAnonKey] = useState('');
  const [sbSaveMsg, setSbSaveMsg] = useState('');

  // Sync mode when modal opens
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setError('');
      setLoadingGoogle(false);
      setLoadingTelegram(false);
      setShowSupabaseSettings(false);
      setSbSaveMsg('');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (res.success) {
      onShowToast(t.toastLoggedIn);
    } else {
      setError(res.error || 'Kirishda xatolik yuz berdi');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = register({ name, email, pass: password, city, size });
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
        onShowToast(
          language === 'uz'
            ? 'Google (Supabase) orqali kirdingiz!'
            : language === 'ru'
            ? 'Вход через Google (Supabase) выполнен!'
            : 'Signed in with Google (Supabase)!'
        );
      } else {
        setError(res.error || 'Google orqali kirishda xatolik');
        if (!isSupabaseConnected) {
          setShowSupabaseSettings(true);
        }
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
        onShowToast(
          language === 'uz'
            ? 'Telegram (Supabase) orqali kirdingiz!'
            : language === 'ru'
            ? 'Вход через Telegram (Supabase) выполнен!'
            : 'Signed in with Telegram (Supabase)!'
        );
      } else {
        setError(res.error || 'Telegram orqali kirishda xatolik');
      }
    } finally {
      setLoadingTelegram(false);
    }
  };

  // Demo Admin bilan 1-bosishda kirish (qoldirildi va saqlandi)
  const fillDemoAdmin = () => {
    setEmail('admin@vantegewear.com');
    setPassword('admin123');
    const res = login('admin@vantegewear.com', 'admin123');
    if (res.success) onShowToast('Admin sifatida kirildi! (Aziz Karimov · Founding Architect)');
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSbUrl.trim() || !inputSbAnonKey.trim()) {
      setSbSaveMsg('Iltimos, Supabase URL va Anon Keyni to‘ldiring');
      return;
    }
    const ok = updateSupabaseCredentials(inputSbUrl, inputSbAnonKey);
    if (ok) {
      setSbSaveMsg('✓ Supabase sozlamalari muvaffaqiyatli saqlandi!');
      setTimeout(() => setShowSupabaseSettings(false), 1200);
    } else {
      setSbSaveMsg('Xatolik: Supabase URL formati noto‘g‘ri (https:// bilan boshlanishi kerak)');
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          type="button"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
            <div className="auth-badge-pill" style={{ marginBottom: 0 }}>
              <span className="auth-badge-dot" />
              VANTEGE ID · SECURE PASSPORT
            </div>
            
            {/* Supabase Status Indicator */}
            <button
              type="button"
              onClick={() => setShowSupabaseSettings(!showSupabaseSettings)}
              style={{
                background: isSupabaseConnected ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
                border: isSupabaseConnected ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(234,179,8,0.35)',
                color: isSupabaseConnected ? '#4ade80' : '#facc15',
                fontSize: '10px',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '99px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Supabase ulanish holatini ko'rish yoki sozlash"
            >
              <span>{isSupabaseConnected ? '🟢 Supabase faol' : '🟡 Supabase sozlash'}</span>
            </button>
          </div>

          <h2>{mode === 'login' ? t.welcomeBack : t.createAccount}</h2>
          <p className="auth-sub">
            {mode === 'login'
              ? (language === 'uz'
                  ? 'Google yoki Telegram orqali Supabase bilan xavfsiz tizimga kiring.'
                  : language === 'ru'
                  ? 'Безопасный вход через Google или Telegram при поддержке Supabase.'
                  : 'Fast and secure login powered by Supabase Google & Telegram auth.')
              : (language === 'uz'
                  ? 'Yangi shaxsiy VANTEGE ID profilini rasmiylashtirish.'
                  : language === 'ru'
                  ? 'Создание нового персонального профиля VANTEGE ID.'
                  : 'Create a new personal VANTEGE ID passport.')}
          </p>
        </div>

        {/* Supabase Sozlamalari (ixtiyoriy ochiladi) */}
        {showSupabaseSettings && (
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#facc15', marginBottom: '8px', textTransform: 'uppercase' }}>
              ⚙️ Supabase Loyihasi Sozlamalari
            </div>
            <p style={{ fontSize: '11px', color: '#8a8f98', margin: '0 0 10px', lineHeight: 1.4 }}>
              Supabase Dashboard -&gt; Project Settings -&gt; API dan URL va Anon Key ni kiriting. Bu brauzeringizda saqlanadi:
            </p>
            <form onSubmit={handleSaveSupabaseConfig} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={inputSbUrl}
                onChange={(e) => setInputSbUrl(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={inputSbAnonKey}
                onChange={(e) => setInputSbAnonKey(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#22c55e',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '11px',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  cursor: 'pointer',
                }}
              >
                Saqlash va Ulanish
              </button>
              {sbSaveMsg && <span style={{ fontSize: '11px', color: '#4ade80' }}>{sbSaveMsg}</span>}
              {supabaseUrl && <span style={{ fontSize: '10px', color: '#8a8f98' }}>Joriy URL: {supabaseUrl}</span>}
            </form>
          </div>
        )}

        {/* 1-Click Fast Demo Admin Button (Saqlab olib qolindi) */}
        <div className="auth-demo-strip">
          <span className="auth-demo-title">
            {language === 'uz' ? '⚡ Demo Admin kirish (Aziz Karimov):' : language === 'ru' ? '⚡ Быстрый вход для админа:' : '⚡ Fast Admin Demo Login:'}
          </span>
          <div className="auth-demo-btns single">
            <button
              type="button"
              className="auth-demo-btn admin full-width"
              onClick={fillDemoAdmin}
              title="admin@vantegewear.com / admin123"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>{t.demoAdminLogin || '⚡ Demo Admin bilan kirish'}</span>
            </button>
          </div>
        </div>

        {/* Social Quick Login Grid (Supabase Google + Telegram) */}
        <div className="auth-social-grid">
          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            title={isSupabaseConnected ? "Google (Supabase Auth) orqali kirish" : "Google orqali kirish"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loadingGoogle ? 'Ulanmoqda...' : 'Google'}</span>
          </button>

          <button
            type="button"
            className="auth-telegram-btn"
            onClick={handleTelegramLogin}
            disabled={loadingTelegram}
            title={isSupabaseConnected ? "Telegram (Supabase Auth) orqali kirish" : "Telegram orqali kirish"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span>{loadingTelegram ? 'Ulanmoqda...' : 'Telegram'}</span>
          </button>
        </div>

        <div className="auth-or-divider">
          <span>{language === 'uz' ? 'yoki elektron pochta' : language === 'ru' ? 'или через email' : 'or with email'}</span>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            {t.signUp}
          </button>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label>{t.emailLabel}</label>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  required
                  placeholder="admin@vantegewear.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label>{t.passwordLabel}</label>
                <span className="auth-hint">demo: admin123</span>
              </div>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              <span>{t.signIn}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <div className="auth-switch-row">
              <span>{t.dontHaveAccount || "Akkountingiz yo‘qmi?"}</span>{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                {t.signUp}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label>{t.nameLabel}</label>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  required
                  placeholder="Jasur Rahimov"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>{t.emailLabel}</label>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  required
                  placeholder="jasur@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-grid-2">
              <div className="auth-field">
                <label>{t.cityLabel}</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="auth-select"
                >
                  <option value="Tashkent">Tashkent (UZ)</option>
                  <option value="Samarkand">Samarkand (UZ)</option>
                  <option value="Bukhara">Bukhara (UZ)</option>
                  <option value="Andijan">Andijan (UZ)</option>
                  <option value="Namangan">Namangan (UZ)</option>
                  <option value="Fergana">Fergana (UZ)</option>
                  <option value="Almaty">Almaty (KZ)</option>
                  <option value="Bishkek">Bishkek (KG)</option>
                  <option value="Dubai">Dubai (UAE)</option>
                  <option value="Global">Other (International)</option>
                </select>
              </div>

              <div className="auth-field">
                <label>{t.sizePreference}</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="auth-select"
                >
                  <option value="S">S (Small)</option>
                  <option value="M">M (Medium)</option>
                  <option value="L">L (Large)</option>
                  <option value="XL">XL (Extra)</option>
                </select>
              </div>
            </div>

            <div className="auth-field">
              <label>{t.passwordLabel}</label>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Kamida 4 belgi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              <span>{t.createAccount}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <div className="auth-switch-row">
              <span>{t.alreadyHaveAccount || "Profilingiz bormi?"}</span>{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                {t.signIn}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer-note">
          <p>
            🔒 Supabase Auth & Graphene-Vault Encryption · VANTEGE WEAR Cloud Passport
          </p>
        </div>
      </div>
    </div>
  );
}
