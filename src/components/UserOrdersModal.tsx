'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';

export default function UserOrdersModal() {
  const { isOrdersModalOpen, closeOrdersModal, user, orders, logout } = useAuth();
  const { t, language } = useLanguage();

  if (!isOrdersModalOpen || !user) return null;

  return (
    <div className="auth-modal-backdrop" onClick={closeOrdersModal}>
      <div
        className="auth-modal-card orders-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="auth-modal-close"
          onClick={closeOrdersModal}
          type="button"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Profile Card Summary */}
        <div className="user-profile-summary">
          <div className="user-avatar-large">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="user-summary-text">
            <div className="user-role-badge">
              <span className="dot" />
              {user.role === 'admin' ? t.roleAdmin : user.tier || t.roleMember}
            </div>
            <h3>{user.name}</h3>
            <p className="user-email">{user.email}</p>
            <div className="user-meta-tags">
              <span>📍 {user.city}</span>
              <span>📏 {user.sizePreference || 'M'}</span>
              <span>🗓️ {user.joinedAt}</span>
            </div>
          </div>
        </div>

        {/* Orders list */}
        <div className="orders-section-head">
          <h4>{t.myOrders} ({orders.length})</h4>
          <span className="orders-badge-live">LIVE TELEMETRY</span>
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="orders-empty">
              <p>{language === 'uz' ? 'Hozircha buyurtmalar yo‘q.' : 'No orders yet.'}</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="order-item-card">
                <div className="order-item-top">
                  <div>
                    <span className="order-id">{ord.id}</span>
                    <span className="order-date">{ord.date}</span>
                  </div>
                  <span className={`order-status-pill status-${ord.status}`}>
                    {ord.status === 'delivered' ? '✓ YETKAZILDI' : ord.status === 'shipped' ? '🚚 YO‘LDA' : '⚡ TAYYORLANMOQDA'}
                  </span>
                </div>

                <div className="order-pieces-mini">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="order-piece-row">
                      <span>{it.name} ({it.size}) × {it.quantity}</span>
                      <span className="order-piece-price">${it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="order-item-foot">
                  <div className="order-track">
                    <span className="track-label">Kuryer trek:</span>
                    <code>{ord.trackingNumber}</code>
                  </div>
                  <div className="order-total-sum">
                    <span>{t.total}:</span>
                    <strong>${ord.total}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="orders-modal-actions">
          {user.role === 'admin' && (
            <a href="/admin" className="admin-cta-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>{t.adminDashboard}</span>
            </a>
          )}
          <button
            type="button"
            className="signout-cta-btn"
            onClick={() => {
              logout();
              closeOrdersModal();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
