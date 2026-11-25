'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';

interface AccountSettingsModalProps {
  onShowToast: (msg: string) => void;
}

type SettingsTab = 'profile' | 'security' | 'preferences';

export default function AccountSettingsModal({ onShowToast }: AccountSettingsModalProps) {
  const {
    user,
    isSettingsModalOpen,
    closeSettingsModal,
    updateProfile,
    changePassword,
    logout,
  } = useAuth() as ReturnType<typeof useAuth> & {
    isSettingsModalOpen?: boolean;
    closeSettingsModal?: () => void;
  };
  const { language } = useLanguage();

  const [tab, setTab] = useState<SettingsTab>('profile');

  // Profile form
  const [name, setName] = useState('');
  const [city, setCity] = useState('Tashkent');
  const [size, setSize] = useState('M');
  const [phone, setPhone] = useState('');

  // Security form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Theme preference
  const [accent, setAccent] = useState('blue');
  const [notif, setNotif] = useState(true);

  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok');
  const [saving, setSaving] = useState(false);

  const uz = language === 'uz';

  useEffect(() => {
    if (isSettingsModalOpen && user) {
      setName(user.name);
      setCity(user.city || 'Tashkent');
      setSize(user.sizePreference || 'M');
      setPhone(user.phone || '');
      setCurrentPass('');
      setNewPass('');
      setMsg('');
      setTab('profile');
      try {
        setAccent(localStorage.getItem('vantegewear_accent') || 'blue');
        setNotif(localStorage.getItem('vantegewear_notif') !== 'off');
      } catch { }
    }
  }, [isSettingsModalOpen, user]);

  if (!isSettingsModalOpen || !user) return null;

  const close = closeSettingsModal || (() => { });

  const flash = (m: string, type: 'ok' | 'err' = 'ok') => {
    setMsg(m);
    setMsgType(type);
    window.setTimeout(() => setMsg(''), 2500);
  };

  // (90) 123-45-67 formatlash
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    let out = '';
    if (digits.length > 0) out = '(' + digits.slice(0, 2);
    if (digits.length >= 2) out += ') ' + digits.slice(2, 5);
    if (digits.length >= 5) out += '-' + digits.slice(5, 7);
    if (digits.length >= 7) out += '-' + digits.slice(7, 9);
    return out;
  };

  const isPhoneValid = phone.replace(/\D/g, '').length === 9;

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      flash(uz ? 'Iltimos, ism va familiyangizni kiriting' : 'Please enter your full name', 'err');
      return;
    }
    if (phone && !isPhoneValid) {
      flash(uz ? 'Telefon raqam to‘liq emas (9 raqam kiriting)' : 'Phone number is incomplete (9 digits)', 'err');
      return;
    }
    setSaving(true);
    // UI yangilanishini ko‘rsatish uchun kichik kechikish
    await new Promise((r) => setTimeout(r, 350));
    const res = updateProfile({ name: name.trim(), city, sizePreference: size, phone: phone ? '+998 ' + phone : '' });
    setSaving(false);
    if (res.success) {
      flash(uz ? '✓ Profil saqlandi' : '✓ Profile saved');
      onShowToast(uz ? '✓ Profil ma’lumotlari yangilandi' : '✓ Profile updated');
    } else {
      flash(res.error || 'Xatolik', 'err');
    }
  };

  const savePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPass.length < 6) {
      flash(uz ? 'Yangi parol kamida 6 belgidan iborat bo‘lishi kerak' : 'New password must be at least 6 characters', 'err');
      return;
    }
    if (newPass === currentPass) {
      flash(uz ? 'Yangi parol hozirgi paroldan farq qilishi kerak' : 'New password must differ from current', 'err');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    const res = changePassword(currentPass, newPass);
    setSaving(false);
    if (res.success) {
      flash(uz ? '✓ Parol o‘zgartirildi' : '✓ Password changed');
      onShowToast(uz ? '✓ Parolingiz yangilandi' : '✓ Password updated');
      setCurrentPass('');
      setNewPass('');
      setShowNewPass(false);
    } else {
      flash(res.error || 'Xatolik', 'err');
    }
  };

  const savePrefs = () => {
    try {
      localStorage.setItem('vantegewear_accent', accent);
      localStorage.setItem('vantegewear_notif', notif ? 'on' : 'off');
    } catch { }
    flash(uz ? '✓ Sozlamalar saqlandi' : '✓ Preferences saved');
    onShowToast(uz ? '✓ Interfeys sozlamalari saqlandi' : '✓ Preferences saved');
  };

  const CITIES = [
    { v: 'Tashkent', l: uz ? 'Toshkent' : 'Tashkent' },
    { v: 'Samarkand', l: uz ? 'Samarqand' : 'Samarkand' },
    { v: 'Bukhara', l: uz ? 'Buxoro' : 'Bukhara' },
    { v: 'Almaty', l: uz ? 'Olmaota' : 'Almaty' },
    { v: 'Astana', l: uz ? 'Ostona' : 'Astana' },
    { v: 'Bishkek', l: 'Bishkek' },
    { v: 'Dubai', l: uz ? 'Dubay' : 'Dubai' },
  ];
  const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="auth-modal-backdrop" onClick={close}>
      <div
        className="auth-modal-card account-settings-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: '480px' }}
      >
        <button
          className="auth-modal-close"
          onClick={close}
          type="button"
          aria-label="Yopish"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="acc-set-head">
          <div className="acc-set-avatar">{user.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <h3>{uz ? 'Akaunt sozlamalari' : 'Account settings'}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="acc-set-tabs">
          {([
            ['profile', '👤', uz ? 'Profil' : 'Profile'],
            ['security', '🔒', uz ? 'Xavfsizlik' : 'Security'],
            ['preferences', '🎨', uz ? 'Rejimlar' : 'Preferences'],
          ] as [SettingsTab, string, string][]).map(([key, icon, label]) => (
            <button
              key={key}
              type="button"
              className={`acc-set-tab ${tab === key ? 'active' : ''}`}
              onClick={() => { setTab(key); setMsg(''); }}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`acc-set-msg ${msgType === 'ok' ? 'ok' : 'err'}`}>{msg}</div>
        )}

        {/* ===== PROFILE TAB ===== */}
        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="acc-set-form">
            <div className="auth-field">
              <label>Ism va Familiya</label>
              <div className="name-input-wrap">
                <span className="name-input-icon">👤</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jasur Alimov"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Telefon</label>
              <div className="phone-prefix-wrap">
                <span className="phone-prefix">+998</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="90 123 45 67"
                  style={{ fontSize: '14px', letterSpacing: '0.05em', fontWeight: 600, border: 'none', background: 'transparent', color: '#f1f5f9', outline: 'none', flex: 1, minWidth: 0, padding: 0, caretColor: '#60a5fa' }}
                />
              </div>
            </div>

            <div className="auth-grid-2">
              <div className="auth-field">
                <label>Shahar</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="auth-select">
                  {CITIES.map((c) => (
                    <option key={c.v} value={c.v}>{c.l}</option>
                  ))}
                </select>
              </div>
              <div className="auth-field">
                <label>O‘lcham</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="auth-select">
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="primary-cta acc-set-save" disabled={saving}>
              <span>{saving
                ? (uz ? 'SAQLANMOQDA...' : 'SAVING...')
                : (uz ? 'PROFILNI SAQLASH ✓' : 'SAVE PROFILE ✓')}
              </span>
            </button>
          </form>
        )}

        {/* ===== SECURITY TAB ===== */}
        {tab === 'security' && (
          <form onSubmit={savePassword} className="acc-set-form">
            <div className="auth-field">
              <label>{uz ? 'Hozirgi parol' : 'Current password'}</label>
              <div className="name-input-wrap">
                <span className="name-input-icon">🔑</span>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>{uz ? 'Yangi parol' : 'New password'}</label>
              <div className="name-input-wrap">
                <span className="name-input-icon">🛡️</span>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Kamida 6 belgi"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="acc-pass-toggle"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? 'Yashirish' : 'Ko‘rish'}
                </button>
              </div>
            </div>

            <button type="submit" className="primary-cta acc-set-save" disabled={saving}>
              <span>{saving
                ? (uz ? 'O‘ZGARTIRILMOQDA...' : 'CHANGING...')
                : (uz ? 'PAROLNI O‘ZGARTIRISH ✓' : 'CHANGE PASSWORD ✓')}
              </span>
            </button>

            <div className="acc-set-danger-zone">
              <button
                type="button"
                className="signout-cta-btn"
                disabled={saving}
                onClick={async () => { await logout(); close(); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>{uz ? 'Hisobdan chiqish' : 'Sign out'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ===== PREFERENCES TAB ===== */}
        {tab === 'preferences' && (
          <div className="acc-set-form">
            <div className="auth-field">
              <label>{uz ? 'Interfeys rejimi (aksent rang)' : 'Interface mode (accent color)'}</label>
              <div className="acc-set-themes">
                {([
                  ['blue', '#60a5fa', 'Ko‘k'],
                  ['emerald', '#34d399', 'Yashil'],
                  ['violet', '#a78bfa', 'Binafsha'],
                  ['amber', '#fbbf24', 'Oltin'],
                  ['rose', '#fb7185', 'Qizil'],
                ] as [string, string, string][]).map(([key, color, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`acc-theme-chip ${accent === key ? 'active' : ''}`}
                    onClick={() => setAccent(key)}
                  >
                    <span className="acc-theme-dot" style={{ background: color }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="acc-set-toggle-row">
              <div>
                <div className="acc-set-toggle-title">{uz ? 'Bildirishnomalar' : 'Notifications'}</div>
                <div className="acc-set-toggle-sub">{uz ? 'Yangi kolleksiya va chegirmalar haqida xabar' : 'New collection and discount alerts'}</div>
              </div>
              <button
                type="button"
                className={`acc-toggle ${notif ? 'on' : ''}`}
                onClick={() => setNotif(!notif)}
                aria-pressed={notif}
              >
                <span className="acc-toggle-knob" />
              </button>
            </div>

            <button type="button" className="primary-cta acc-set-save" onClick={savePrefs}>
              <span>{uz ? 'SOZLAMALARNI SAQLASH ✓' : 'SAVE PREFERENCES ✓'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
