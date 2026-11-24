'use client';

import React, { useState } from 'react';
import ShellLayout from '@/src/components/ShellLayout';
import { useAuth, type UserOrder } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { LOOKS } from '@/src/data/looks';

interface ProductItem {
  id: string;
  name: string;
  category: 'Outerwear' | 'Trousers' | 'Footwear' | 'Accessories';
  price: number;
  stock: number;
  lookName: string;
  material: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export default function AdminPage() {
  const { user, isAdmin, login, orders, updateOrderStatus } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'users' | 'analytics' | 'settings'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Sample editable product catalog
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const list: ProductItem[] = [];
    LOOKS.forEach((l, li) => {
      l.pieces.forEach((p, pi) => {
        list.push({
          id: `PRD-${li}-${pi}`,
          name: p.name,
          category: pi === 0 ? 'Outerwear' : 'Trousers',
          price: p.price,
          stock: Math.floor(15 + Math.random() * 45),
          lookName: l.name,
          material: p.material || '3L Graphene Ripstop',
          status: 'in_stock',
        });
      });
    });
    return list;
  });

  // Modal for adding product
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'Outerwear' | 'Trousers' | 'Accessories'>('Outerwear');
  const [newProdPrice, setNewProdPrice] = useState(450);
  const [newProdStock, setNewProdStock] = useState(30);

  // Quick edit stock modal
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editStockVal, setEditStockVal] = useState<number>(0);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);

  // Settings
  const [tickerAnnouncement, setTickerAnnouncement] = useState('VANTEGE WEAR DROP 02 · WORLDWIDE DISPATCH ACTIVE · TASHKENT FLAGSHIP OPEN DAILY');
  const [gestureControlEnabled, setGestureControlEnabled] = useState(true);
  const [vipAccessCode, setVipAccessCode] = useState('MIDVANTEGE-2026');

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(''), 2500);
  };

  const handleAdminQuickLogin = () => {
    login('admin@vantegewear.com', 'admin123');
  };

  const handleSaveProductEdit = () => {
    if (!editingProduct) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              stock: editStockVal,
              price: editPriceVal,
              status: editStockVal === 0 ? 'out_of_stock' : editStockVal < 10 ? 'low_stock' : 'in_stock',
            }
          : p
      )
    );
    showNotification(`Mahsulot yangilandi: ${editingProduct.name}`);
    setEditingProduct(null);
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;
    const item: ProductItem = {
      id: `PRD-NEW-${Date.now().toString().slice(-4)}`,
      name: newProdName,
      category: newProdCategory,
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      lookName: 'Custom Capsule',
      material: 'HexaWeave™ 3L Lamina',
      status: Number(newProdStock) < 10 ? 'low_stock' : 'in_stock',
    };
    setProducts([item, ...products]);
    setShowAddModal(false);
    setNewProdName('');
    showNotification(`Yangi mahsulot qo‘shildi: ${item.name}`);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lookName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ShellLayout activeSection="admin" ticker={false}>
      <div className="admin-root-container">
        {/* Admin Navigation Bar */}
        <div className="admin-header-strip">
          <div className="admin-brand-info">
            <div className="admin-badge-indicator">
              <span className="pulsing-green-dot" />
              <span>VANTEGE COMMAND · CLOUD NODE 01 (UZ)</span>
            </div>
            <h1>VANTEGE WEAR Startup Admin Suite</h1>
            <p className="admin-subtitle">
              {language === 'uz'
                ? 'Inventar, global buyurtmalar, telemetriya va startap boshqaruvi'
                : language === 'ru'
                ? 'Управление складскими остатками, заказами и аналитикой'
                : 'Inventory control, global telemetry, and startup operations'}
            </p>
          </div>

          <div className="admin-user-pill">
            <span className="admin-avatar">AK</span>
            <div className="admin-meta">
              <strong>{user?.name || 'Aziz Karimov'}</strong>
              <span>CHIEF ARCHITECT / ADMIN</span>
            </div>
            <a href="/" className="admin-exit-btn">
              ← {language === 'uz' ? 'Saytga qaytish' : 'Back to Site'}
            </a>
          </div>
        </div>

        {/* Security Gate if not logged in as Admin */}
        {!isAdmin && (
          <div className="admin-lock-guard">
            <div className="admin-lock-box">
              <div className="lock-icon">🔒</div>
              <h2>{language === 'uz' ? 'Administrator huquqi talab qilinadi' : 'Admin Privileges Required'}</h2>
              <p>
                {language === 'uz'
                  ? 'Ushbu bo‘lim faqat VANTEGE WEAR tizim administratorlari uchun. 1-bosish bilan demo admin hisobiga kiring:'
                  : 'This section is restricted to VANTEGE WEAR operators. Sign in with demo admin credentials:'}
              </p>
              <button
                type="button"
                className="admin-unlock-btn"
                onClick={handleAdminQuickLogin}
              >
                ⚡ {language === 'uz' ? 'Demo Admin sifatida bir zumda kirish' : 'One-Click Login as Admin'}
              </button>
            </div>
          </div>
        )}

        {isAdmin && (
          <>
            {/* KPI Metrics Dashboard */}
            <div className="admin-kpi-grid">
              <div className="kpi-card">
                <div className="kpi-card-head">
                  <span className="kpi-title">{language === 'uz' ? 'Jami Tushum (YTD)' : 'Total Revenue'}</span>
                  <span className="kpi-badge positive">+18.4%</span>
                </div>
                <div className="kpi-value">$1,842,500</div>
                <div className="kpi-sub">
                  <span>{language === 'uz' ? 'Oylik maqsad: $2.0M' : 'Target: $2.0M'}</span>
                  <div className="kpi-mini-bar">
                    <div className="kpi-fill" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card-head">
                  <span className="kpi-title">{language === 'uz' ? 'Buyurtmalar Soni' : 'Global Orders'}</span>
                  <span className="kpi-badge positive">98.4% On-time</span>
                </div>
                <div className="kpi-value">4,291</div>
                <div className="kpi-sub">
                  <span>14 ta davlatga yetkazib berildi</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card-head">
                  <span className="kpi-title">{language === 'uz' ? 'Mijozlar Bazasi' : 'VANTEGE ID Members'}</span>
                  <span className="kpi-badge positive">+420 this week</span>
                </div>
                <div className="kpi-value">18,450</div>
                <div className="kpi-sub">
                  <span>VIP Tier 1: 3,890 a’zo</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card-head">
                  <span className="kpi-title">{language === 'uz' ? 'Zaxiradagi Mahsulotlar' : 'Network Units'}</span>
                  <span className="kpi-badge neutral">6 Hubs</span>
                </div>
                <div className="kpi-value">12,840</div>
                <div className="kpi-sub">
                  <span>Toshkent, Olmaota, Samarqand, Dubay</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="admin-nav-tabs">
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                📦 {language === 'uz' ? 'Mahsulotlar va Zaxira' : 'Inventory & Products'} ({products.length})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                🚚 {language === 'uz' ? 'Buyurtmalar Oqimi' : 'Live Orders'} ({orders.length})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 {language === 'uz' ? 'Mijozlar & VIP' : 'Users & Members'}
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                📊 {language === 'uz' ? 'Startap Tahlili' : 'Startup Telemetry'}
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ {language === 'uz' ? 'Sozlamalar & CMS' : 'Settings & CMS'}
              </button>
            </div>

            {/* TAB 1: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="admin-panel-section">
                <div className="admin-section-toolbar">
                  <div className="admin-search-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder={language === 'uz' ? 'Mahsulot qidirish...' : 'Search products...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={() => setShowAddModal(true)}
                  >
                    + {language === 'uz' ? 'Yangi Mahsulot Qo‘shish' : 'Add New Garment'}
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{language === 'uz' ? 'Mahsulot nomi' : 'Garment'}</th>
                        <th>{language === 'uz' ? 'Kategoriya' : 'Category'}</th>
                        <th>{language === 'uz' ? 'Mato texnologiyasi' : 'Material'}</th>
                        <th>{language === 'uz' ? 'Narx' : 'Price'}</th>
                        <th>{language === 'uz' ? 'Qoldiq' : 'Stock'}</th>
                        <th>{language === 'uz' ? 'Holat' : 'Status'}</th>
                        <th>{language === 'uz' ? 'Amal' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td><code>{p.id}</code></td>
                          <td>
                            <strong>{p.name}</strong>
                            <span className="table-sub">{p.lookName}</span>
                          </td>
                          <td><span className="table-pill">{p.category}</span></td>
                          <td><span className="table-dim-txt">{p.material}</span></td>
                          <td><strong>${p.price}</strong></td>
                          <td>
                            <span className={p.stock < 10 ? 'stock-low' : 'stock-ok'}>
                              {p.stock} dona
                            </span>
                          </td>
                          <td>
                            <span className={`status-tag ${p.status}`}>
                              {p.status === 'in_stock' ? '✓ Mavjud' : p.status === 'low_stock' ? '⚠️ Kam qoldi' : '✕ Tugagan'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-table-action-btn"
                              onClick={() => {
                                setEditingProduct(p);
                                setEditStockVal(p.stock);
                                setEditPriceVal(p.price);
                              }}
                            >
                              Tahrirlash
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS */}
            {activeTab === 'orders' && (
              <div className="admin-panel-section">
                <div className="admin-section-header">
                  <h3>Real-Vaqt Mijoz Buyurtmalari</h3>
                  <span className="live-counter">JAMI {orders.length} TA BUYURTMA</span>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Buyurtma ID</th>
                        <th>Sana va Vaqt</th>
                        <th>Tarkibi</th>
                        <th>Manzil</th>
                        <th>Summa</th>
                        <th>Kuryer Treking</th>
                        <th>Holati</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td><strong>{ord.id}</strong></td>
                          <td><span className="table-dim-txt">{ord.date}</span></td>
                          <td>
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="order-row-item">
                                {it.name} ({it.size}) × {it.quantity}
                              </div>
                            ))}
                          </td>
                          <td><span className="table-sub">{ord.shippingAddress}</span></td>
                          <td><strong>${ord.total}</strong></td>
                          <td><code>{ord.trackingNumber}</code></td>
                          <td>
                            <select
                              value={ord.status}
                              onChange={(e) => {
                                updateOrderStatus(ord.id, e.target.value as UserOrder['status']);
                                showNotification(`Buyurtma ${ord.id} holati yangilandi`);
                              }}
                              className={`order-status-select ${ord.status}`}
                            >
                              <option value="processing">⚡ Tayyorlanmoqda</option>
                              <option value="shipped">🚚 Yo‘lda</option>
                              <option value="delivered">✓ Yetkazildi</option>
                              <option value="cancelled">✕ Bekor qilindi</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: USERS */}
            {activeTab === 'users' && (
              <div className="admin-panel-section">
                <div className="admin-section-header">
                  <h3>VANTEGE CLUB VIP A’zolari & Mijozlar</h3>
                  <span className="live-counter">18,450 RO‘YXATDAN O‘TGAN</span>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Mijoz</th>
                        <th>Email</th>
                        <th>Shahar</th>
                        <th>Klub Darajasi</th>
                        <th>Ro‘yxatdan o‘tgan</th>
                        <th>Jami Xarid</th>
                        <th>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Aziz Karimov</strong></td>
                        <td>admin@vantegewear.com</td>
                        <td>Tashkent</td>
                        <td><span className="vip-badge founder">FOUNDING ARCHITECT</span></td>
                        <td>2024-01-15</td>
                        <td>$14,200</td>
                        <td><span className="role-chip admin">ADMIN</span></td>
                      </tr>
                      <tr>
                        <td><strong>Sitora Alimova</strong></td>
                        <td>alex@vantegewear.com</td>
                        <td>Tashkent</td>
                        <td><span className="vip-badge gold">VIP TIER 1</span></td>
                        <td>2025-08-20</td>
                        <td>$3,840</td>
                        <td><span className="role-chip member">MEMBER</span></td>
                      </tr>
                      <tr>
                        <td><strong>Damir Sultanov</strong></td>
                        <td>damir.s@almaty.kz</td>
                        <td>Almaty</td>
                        <td><span className="vip-badge gold">VIP TIER 1</span></td>
                        <td>2025-10-11</td>
                        <td>$2,190</td>
                        <td><span className="role-chip member">MEMBER</span></td>
                      </tr>
                      <tr>
                        <td><strong>Elena Kim</strong></td>
                        <td>elena.k@samarkand.uz</td>
                        <td>Samarkand</td>
                        <td><span className="vip-badge silver">VIP TIER 2</span></td>
                        <td>2026-02-04</td>
                        <td>$1,420</td>
                        <td><span className="role-chip member">MEMBER</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="admin-panel-section">
                <div className="admin-section-header">
                  <h3>Startap Telemetriyasi va Bozor Tahlili</h3>
                </div>

                <div className="admin-analytics-grid">
                  <div className="analytics-card">
                    <h4>Shaharlar Bo‘yicha Savdo Ulushi</h4>
                    <div className="region-bars">
                      <div className="region-row">
                        <span>Tashkent Hub (UZ)</span>
                        <div className="region-bar-track">
                          <div className="region-bar-fill" style={{ width: '45%' }} />
                        </div>
                        <span>45% ($840k)</span>
                      </div>
                      <div className="region-row">
                        <span>Almaty Studio (KZ)</span>
                        <div className="region-bar-track">
                          <div className="region-bar-fill" style={{ width: '23%' }} />
                        </div>
                        <span>23% ($420k)</span>
                      </div>
                      <div className="region-row">
                        <span>Samarkand Concept (UZ)</span>
                        <div className="region-bar-track">
                          <div className="region-bar-fill" style={{ width: '14%' }} />
                        </div>
                        <span>14% ($260k)</span>
                      </div>
                      <div className="region-row">
                        <span>Bishkek Shell Lab (KG)</span>
                        <div className="region-bar-track">
                          <div className="region-bar-fill" style={{ width: '10%' }} />
                        </div>
                        <span>10% ($180k)</span>
                      </div>
                      <div className="region-row">
                        <span>Dubai & Xalqaro (UAE/EU)</span>
                        <div className="region-bar-track">
                          <div className="region-bar-fill" style={{ width: '8%' }} />
                        </div>
                        <span>8% ($142k)</span>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h4>Asosiy Startap Ko‘rsatkichlari</h4>
                    <div className="metrics-list-admin">
                      <div className="metric-row-admin">
                        <span>Qaytarish ko‘rsatkichi (Return Rate)</span>
                        <strong className="positive-text">1.1% (Soha o‘rtachasi 28%)</strong>
                      </div>
                      <div className="metric-row-admin">
                        <span>Virtual Fitting konversiyasi</span>
                        <strong className="positive-text">4.82%</strong>
                      </div>
                      <div className="metric-row-admin">
                        <span>O‘rtacha chek (AOV)</span>
                        <strong>$429.00</strong>
                      </div>
                      <div className="metric-row-admin">
                        <span>Mijoz qoniqishi (CSAT)</span>
                        <strong className="positive-text">98.9%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="admin-panel-section">
                <div className="admin-section-header">
                  <h3>Tizim Sozlamalari & Real-Vaqt CMS</h3>
                </div>

                <div className="admin-settings-card">
                  <div className="settings-field">
                    <label>Sayt Ticker E’lon Qatori (Real vaqtda o‘zgaradi):</label>
                    <input
                      type="text"
                      value={tickerAnnouncement}
                      onChange={(e) => setTickerAnnouncement(e.target.value)}
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>3D Qo‘l Harakati Boshqaruvi (Hand Camera Control)</strong>
                      <p className="dim-sub">Veb-kamera orqali 3D kiyim modelini aylantirish funksiyasi</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={gestureControlEnabled}
                      onChange={(e) => setGestureControlEnabled(e.target.checked)}
                      className="settings-checkbox"
                    />
                  </div>

                  <div className="settings-field">
                    <label>VIP Private Drop Kirish Promo-kodi:</label>
                    <input
                      type="text"
                      value={vipAccessCode}
                      onChange={(e) => setVipAccessCode(e.target.value)}
                      className="settings-input"
                    />
                  </div>

                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={() => showNotification('Sozlamalar muvaffaqiyatli saqlandi!')}
                  >
                    Sozlamalarni saqlash
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="auth-modal-backdrop" onClick={() => setEditingProduct(null)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Mahsulotni tahrirlash</h3>
              <p className="auth-sub">{editingProduct.name}</p>

              <div className="auth-field">
                <label>Narx ($):</label>
                <input
                  type="number"
                  value={editPriceVal}
                  onChange={(e) => setEditPriceVal(Number(e.target.value))}
                  className="auth-input"
                />
              </div>

              <div className="auth-field">
                <label>Qoldiq soni (dona):</label>
                <input
                  type="number"
                  value={editStockVal}
                  onChange={(e) => setEditStockVal(Number(e.target.value))}
                  className="auth-input"
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setEditingProduct(null)}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  className="admin-primary-btn"
                  onClick={handleSaveProductEdit}
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="auth-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Yangi Kiyim Qo‘shish</h3>
              <form onSubmit={handleAddNewProduct} className="auth-form">
                <div className="auth-field">
                  <label>Kiyim Nomi:</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Obsidian Graphene Parka"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label>Kategoriya:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="auth-select"
                  >
                    <option value="Outerwear">Outerwear (Kurtka/Parka)</option>
                    <option value="Trousers">Trousers (Shim)</option>
                    <option value="Accessories">Accessories (Aksessuar)</option>
                  </select>
                </div>

                <div className="auth-grid-2">
                  <div className="auth-field">
                    <label>Narx ($):</label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="auth-field">
                    <label>Zaxira soni:</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setShowAddModal(false)}
                  >
                    Bekor qilish
                  </button>
                  <button type="submit" className="admin-primary-btn">
                    Katalogga kiritish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* In-page Admin Toast */}
        {toastMsg && (
          <div className="admin-toast-banner">
            <span>⚡ {toastMsg}</span>
          </div>
        )}
      </div>
    </ShellLayout>
  );
}
