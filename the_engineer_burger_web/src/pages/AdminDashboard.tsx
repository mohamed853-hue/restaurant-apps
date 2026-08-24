import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { MenuItem, UserRole } from '../types';
import { DEMO_USERS, INITIAL_CATEGORIES } from '../lib/supabase';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentPage }) => {
  const { user, logout } = useAuth();
  const {
    orders,
    menuItems,
    currency,
    settings,
    updateOrderStatus,
    updateSettings
  } = useCart();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'kitchen' | 'delivery' | 'menu' | 'coupons' | 'staff' | 'settings'
  >('overview');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Menu item form state with LOCAL FILE UPLOAD
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(950);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImg, setNewItemImg] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80');
  const [newItemCat, setNewItemCat] = useState(INITIAL_CATEGORIES[0].id);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings form with Social Media links
  const [settingsForm, setSettingsForm] = useState(settings);

  // Orders filters
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Handle local file selection from PC or Mobile phone
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setNewItemImg(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Stats Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const cookingOrdersCount = orders.filter((o) => o.status === 'preparing').length;

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch =
      !orderSearch ||
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_phone.includes(orderSearch);
    return matchesFilter && matchesSearch;
  });

  const exportCSV = () => {
    const headers = 'Order Number,Customer,Phone,Address,Total,Status,Date\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.order_number}","${o.customer_name}","${o.customer_phone}","${o.delivery_address}",${o.total},"${o.status}","${o.created_at}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes_engineer_burger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const newDish: MenuItem = {
      id: 'item-' + Date.now(),
      category_id: newItemCat,
      name: newItemName,
      slug: newItemName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newItemDesc,
      price: newItemPrice,
      image: newItemImg || previewImage || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      is_veg: false,
      is_featured: true,
      is_bestseller: false,
      spice_level: 1,
      preparation_time: 15,
      rating: 5.0,
      stock: 50,
      status: 1
    };

    menuItems.unshift(newDish);
    alert(`🎉 Le plat "${newItemName}" a été ajouté avec succès au menu !`);
    setShowAddMenuModal(false);
    setNewItemName('');
    setNewItemDesc('');
    setPreviewImage('');
  };

  return (
    <div className="admin-layout d-flex min-vh-100 bg-light">
      {/* 1. MODERN LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`admin-sidebar bg-dark text-white d-flex flex-column shadow-lg ${
          mobileSidebarOpen ? 'show-mobile' : ''
        }`}
        style={{
          width: '260px',
          minWidth: '260px',
          zIndex: 1060,
          background: '#120f0d'
        }}
      >
        {/* Brand Header in Sidebar */}
        <div className="p-4 border-bottom border-secondary d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #f4511e, #ea580c)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '18px'
              }}
            >
              🍔
            </span>
            <div>
              <b className="fs-6 d-block text-white" style={{ letterSpacing: '-0.5px' }}>
                {t('brandName')}
              </b>
              <small className="text-warning text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                Console Gérant
              </small>
            </div>
          </div>
          <button
            className="btn btn-sm btn-link text-white d-lg-none p-0"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <i className="bi bi-x fs-4"></i>
          </button>
        </div>

        {/* Sidebar Navigation Menu Items */}
        <nav className="p-3 flex-grow-1 d-flex flex-column gap-1 overflow-auto">
          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'overview' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('overview');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-speedometer2 fs-5"></i>
            <span className="small fw-bold">{t('tabOverview')}</span>
          </button>

          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'orders' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('orders');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-receipt fs-5"></i>
            <span className="small fw-bold">{t('tabOrders')}</span>
            <span className="badge bg-danger ms-auto small">{orders.length}</span>
          </button>

          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'kitchen' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('kitchen');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-fire fs-5 text-warning"></i>
            <span className="small fw-bold">{t('tabKitchen')}</span>
            {cookingOrdersCount > 0 && (
              <span className="badge bg-warning text-dark ms-auto">{cookingOrdersCount}</span>
            )}
          </button>

          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'delivery' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('delivery');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-scooter fs-5 text-info"></i>
            <span className="small fw-bold">{t('tabDelivery')}</span>
          </button>

          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'menu' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('menu');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-book-half fs-5"></i>
            <span className="small fw-bold">{t('tabMenu')}</span>
          </button>

          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'coupons' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('coupons');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-tag-fill fs-5"></i>
            <span className="small fw-bold">{t('tabCoupons')}</span>
          </button>

          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'staff' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('staff');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-people-fill fs-5"></i>
            <span className="small fw-bold">Équipe Staff</span>
          </button>

          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'settings' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('settings');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-gear-fill fs-5"></i>
            <span className="small fw-bold">{t('tabSettings')} & Réseaux</span>
          </button>
        </nav>

        {/* Bottom Sidebar User Profile & Back to Store */}
        <div className="p-3 border-top border-secondary">
          <button
            className="btn btn-warning w-100 py-2 rounded-pill fw-bold text-dark mb-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={() => setCurrentPage('home')}
          >
            <i className="bi bi-shop"></i>
            <span className="small">{t('switchToStore')}</span>
          </button>

          <div className="d-flex align-items-center justify-content-between pt-2">
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f4511e',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '13px'
                }}
              >
                {user?.name.charAt(0)}
              </span>
              <div>
                <b className="d-block small text-white">{user?.name.split(' ')[0]}</b>
                <small className="text-secondary" style={{ fontSize: '10px' }}>Admin Gérant</small>
              </div>
            </div>
            <button
              className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
              onClick={() => {
                logout();
                setCurrentPage('home');
              }}
              title="Déconnexion"
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden min-vh-100">
        {/* Top Header Bar */}
        <header className="bg-white border-bottom px-3 px-md-4 py-3 d-flex align-items-center justify-content-between shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-dark btn-sm d-lg-none rounded-pill px-3"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <i className="bi bi-list fs-5 me-1"></i> Menu
            </button>
            <div>
              <h1 className="fs-6 fs-md-5 fw-extrabold mb-0 text-dark">
                {activeTab === 'overview' && t('tabOverview')}
                {activeTab === 'orders' && t('tabOrders')}
                {activeTab === 'kitchen' && t('tabKitchen')}
                {activeTab === 'delivery' && t('tabDelivery')}
                {activeTab === 'menu' && t('tabMenu')}
                {activeTab === 'coupons' && t('tabCoupons')}
                {activeTab === 'staff' && "Gestion de l'Équipe"}
                {activeTab === 'settings' && `${t('tabSettings')} & Réseaux`}
              </h1>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className={`btn btn-xs rounded-pill ${language === 'fr' ? 'btn-dark text-white fw-bold' : 'btn-outline-secondary'}`}
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => setLanguage('fr')}
            >
              🇫🇷 FR
            </button>
            <button
              className={`btn btn-xs rounded-pill ${language === 'ar' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
              style={{ fontSize: '11px', padding: '3px 8px', fontFamily: 'Cairo, sans-serif' }}
              onClick={() => setLanguage('ar')}
            >
              🇩🇿 العربية
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-3 p-md-4 overflow-auto flex-grow-1 pb-5">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-overview">
              <div className="row g-2 g-md-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card p-3 rounded-4 border-0 shadow-sm bg-white">
                    <span className="text-muted small fw-bold">{t('revenueToday')}</span>
                    <h2 className="fs-5 fw-extrabold text-success mb-1 mt-2">{totalRevenue} {currency}</h2>
                    <small className="text-muted" style={{ fontSize: '10px' }}>Total ventes</small>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card p-3 rounded-4 border-0 shadow-sm bg-white">
                    <span className="text-muted small fw-bold">Commandes</span>
                    <h2 className="fs-5 fw-extrabold text-primary mb-1 mt-2">{totalOrdersCount}</h2>
                    <small className="text-muted" style={{ fontSize: '10px' }}>Clients servis</small>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card p-3 rounded-4 border-0 shadow-sm bg-white">
                    <span className="text-muted small fw-bold">{t('activeKitchen')}</span>
                    <h2 className="fs-5 fw-extrabold text-danger mb-1 mt-2">{cookingOrdersCount}</h2>
                    <small className="text-muted" style={{ fontSize: '10px' }}>Sur le grill</small>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card p-3 rounded-4 border-0 shadow-sm bg-white">
                    <span className="text-muted small fw-bold">En Attente</span>
                    <h2 className="fs-5 fw-extrabold text-warning mb-1 mt-2">{pendingOrdersCount}</h2>
                    <small className="text-muted" style={{ fontSize: '10px' }}>À confirmer</small>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="card border-0 p-3 p-md-4 rounded-4 shadow-sm bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fs-6 fw-bold mb-0">Commandes Récentes</h3>
                  <button className="btn btn-sm btn-outline-dark rounded-pill" onClick={() => setActiveTab('orders')}>
                    Voir tout ➔
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>N° Commande</th>
                        <th>Client</th>
                        <th>Total</th>
                        <th>Paiement</th>
                        <th>Statut</th>
                        <th>Changer Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 6).map((o) => (
                        <tr key={o.id}>
                          <td><b className="text-primary">#{o.order_number}</b></td>
                          <td>
                            <div className="fw-bold small">{o.customer_name}</div>
                            <small className="text-muted" style={{ fontSize: '11px' }}>{o.customer_phone}</small>
                          </td>
                          <td><strong className="small">{o.total} {currency}</strong></td>
                          <td><span className="badge bg-light text-dark">{o.payment_method.toUpperCase()}</span></td>
                          <td>
                            <span className={`badge ${o.status === 'delivered' ? 'bg-success' : o.status === 'preparing' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              style={{ width: '130px', fontSize: '11px' }}
                              value={o.status}
                              onChange={(e: any) => updateOrderStatus(o.id, e.target.value)}
                            >
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmée</option>
                              <option value="preparing">En cuisine</option>
                              <option value="ready">Prête</option>
                              <option value="out_for_delivery">En livraison</option>
                              <option value="delivered">Livrée</option>
                              <option value="cancelled">Annulée</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="tab-orders">
              <div className="card border-0 p-3 p-md-4 rounded-4 shadow-sm bg-white">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((st) => (
                      <button
                        key={st}
                        className={`btn btn-sm rounded-pill ${orderFilter === st ? 'btn-dark' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '11px' }}
                        onClick={() => setOrderFilter(st)}
                      >
                        {st === 'all' ? 'Toutes' : st.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Rechercher..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                    <button className="btn btn-sm btn-success text-nowrap" onClick={exportCSV}>
                      <i className="bi bi-filetype-csv me-1"></i> CSV
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>N°</th>
                        <th>Client & Adresse</th>
                        <th>Articles</th>
                        <th>Total</th>
                        <th>Paiement</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id}>
                          <td><strong className="text-primary small">#{o.order_number}</strong></td>
                          <td>
                            <div className="fw-bold small">{o.customer_name} ({o.customer_phone})</div>
                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>{o.delivery_address}</small>
                          </td>
                          <td className="small" style={{ fontSize: '12px' }}>
                            {o.items?.map((item, i) => (
                              <div key={i}>{item.quantity}x {item.item_name}</div>
                            ))}
                          </td>
                          <td><b className="text-success small">{o.total} {currency}</b></td>
                          <td><span className="badge bg-light text-dark">{o.payment_method.toUpperCase()}</span></td>
                          <td>
                            <select
                              className="form-select form-select-sm fw-bold"
                              style={{ fontSize: '11px' }}
                              value={o.status}
                              onChange={(e: any) => updateOrderStatus(o.id, e.target.value)}
                            >
                              <option value="pending">⏳ En attente</option>
                              <option value="confirmed">✅ Confirmée</option>
                              <option value="preparing">🔥 En cuisine</option>
                              <option value="ready">📦 Prête</option>
                              <option value="out_for_delivery">🛵 En livraison</option>
                              <option value="delivered">🎉 Livrée</option>
                              <option value="cancelled">❌ Annulée</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KITCHEN QUEUE */}
          {activeTab === 'kitchen' && (
            <div className="tab-kitchen">
              <div className="row g-3">
                {orders
                  .filter((o) => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'pending')
                  .map((o) => (
                    <div key={o.id} className="col-md-6 col-lg-4">
                      <div
                        className="card p-3 rounded-4 shadow-sm bg-white border-top border-4"
                        style={{ borderTopColor: o.status === 'preparing' ? '#f4511e' : '#22c55e' }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-dark">#{o.order_number}</span>
                          <span className="badge bg-warning text-dark">{o.estimated_minutes} MIN</span>
                        </div>

                        <h4 className="fs-6 fw-bold mb-2">Client : {o.customer_name}</h4>

                        <div className="p-2 bg-light rounded-3 mb-3 small" style={{ minHeight: '100px' }}>
                          {o.items?.map((item, idx) => (
                            <div key={idx} className="d-flex justify-content-between py-1 border-bottom border-light">
                              <b>{item.quantity}x {item.item_name}</b>
                              {item.instructions && <small className="text-danger fst-italic">({item.instructions})</small>}
                            </div>
                          ))}
                        </div>

                        {o.status === 'preparing' ? (
                          <button
                            className="btn btn-success w-100 py-2 fw-bold small"
                            onClick={() => updateOrderStatus(o.id, 'ready')}
                          >
                            <i className="bi bi-check2-circle me-1"></i> Marquer Prêt
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary w-100 py-2 fw-bold small"
                            onClick={() => updateOrderStatus(o.id, 'preparing')}
                          >
                            <i className="bi bi-fire me-1"></i> Lancer la Cuisson (Grill)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERY QUEUE */}
          {activeTab === 'delivery' && (
            <div className="tab-delivery">
              <div className="row g-3">
                {orders
                  .filter((o) => o.status === 'ready' || o.status === 'out_for_delivery')
                  .map((o) => (
                    <div key={o.id} className="col-md-6 col-lg-4">
                      <div className="card p-3 rounded-4 shadow-sm bg-white border-top border-4 border-primary">
                        <div className="d-flex justify-content-between mb-2">
                          <strong className="text-primary">#{o.order_number}</strong>
                          <span className="badge bg-info text-dark">À LIVRER</span>
                        </div>

                        <h4 className="fs-6 fw-bold mb-1">{o.customer_name}</h4>
                        <p className="text-muted small mb-1"><i className="bi bi-geo-alt me-1"></i> {o.delivery_address}</p>
                        <p className="text-muted small mb-3"><i className="bi bi-telephone me-1"></i> {o.customer_phone}</p>

                        <div className="d-flex gap-2 mb-3">
                          <a href={`tel:${o.customer_phone}`} className="btn btn-outline-dark btn-sm flex-fill">
                            <i className="bi bi-telephone me-1"></i> Appeler
                          </a>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(o.delivery_address)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-primary btn-sm flex-fill"
                          >
                            <i className="bi bi-map me-1"></i> GPS
                          </a>
                        </div>

                        {o.status === 'ready' ? (
                          <button
                            className="btn btn-primary w-100 py-2 fw-bold small"
                            onClick={() => updateOrderStatus(o.id, 'out_for_delivery')}
                          >
                            <i className="bi bi-scooter me-1"></i> Démarrer la Course
                          </button>
                        ) : (
                          <button
                            className="btn btn-success w-100 py-2 fw-bold small"
                            onClick={() => updateOrderStatus(o.id, 'delivered')}
                          >
                            <i className="bi bi-house-check me-1"></i> Marquer Livré
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: MENU MANAGEMENT WITH LOCAL PHOTO UPLOAD FROM PHONE / PC */}
          {activeTab === 'menu' && (
            <div className="tab-menu">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fs-6 fw-bold mb-0">Carte des Plats & Burgers ({menuItems.length})</h3>
                <button
                  className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                  onClick={() => setShowAddMenuModal(!showAddMenuModal)}
                >
                  <i className="bi bi-plus-circle me-1"></i> Ajouter un Plat
                </button>
              </div>

              {/* Modern Add Dish Modal with Direct Local Image File Upload */}
              {showAddMenuModal && (
                <div className="card p-4 rounded-4 shadow bg-white mb-4 border border-warning">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fs-6 fw-bold mb-0 text-dark">
                      📸 Ajouter un Nouveau Plat (Photo depuis Ordinateur ou Téléphone)
                    </h4>
                    <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setShowAddMenuModal(false)}>
                      <i className="bi bi-x fs-4"></i>
                    </button>
                  </div>

                  <form onSubmit={handleCreateMenuItem}>
                    <div className="row g-3">
                      <div className="col-md-5">
                        <label className="form-label small fw-bold">Nom du plat</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Ex: Triple Smash Bacon Burger"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">Prix ({currency})</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={newItemPrice}
                          onChange={(e: any) => setNewItemPrice(Number(e.target.value))}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Catégorie</label>
                        <select
                          className="form-select form-select-sm"
                          value={newItemCat}
                          onChange={(e) => setNewItemCat(e.target.value)}
                        >
                          {INITIAL_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* LOCAL IMAGE FILE PICKER & PREVIEW */}
                      <div className="col-12">
                        <label className="form-label small fw-bold">
                          Photo du plat (Sélectionnez depuis votre téléphone ou PC)
                        </label>
                        <div
                          className="p-3 border rounded-3 text-center bg-light cursor-pointer position-relative d-flex flex-column align-items-center justify-content-center"
                          style={{
                            borderStyle: 'dashed !important',
                            borderColor: '#ea580c !important',
                            minHeight: '140px',
                            cursor: 'pointer'
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleImageFileChange}
                          />

                          {previewImage ? (
                            <div className="text-center">
                              <img
                                src={previewImage}
                                alt="Aperçu photo"
                                className="rounded-3 shadow-sm mb-2"
                                style={{ maxHeight: '110px', maxWidth: '200px', objectFit: 'cover' }}
                              />
                              <div className="small text-success fw-bold">
                                <i className="bi bi-check-circle-fill me-1"></i> Photo sélectionnée ! Cliquer pour changer
                              </div>
                            </div>
                          ) : (
                            <div>
                              <i className="bi bi-cloud-arrow-up-fill fs-2 text-primary d-block mb-1"></i>
                              <b className="d-block small text-dark">
                                Cliquez ici pour choisir une photo depuis votre appareil
                              </b>
                              <small className="text-muted" style={{ fontSize: '11px' }}>
                                Formats supportés : JPG, PNG, WEBP (galerie téléphone ou fichiers PC)
                              </small>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold">Description & Ingrédients</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="Double steak pur bœuf, cheddar affiné, sauce spéciale..."
                          value={newItemDesc}
                          onChange={(e) => setNewItemDesc(e.target.value)}
                        />
                      </div>

                      <div className="col-12 text-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm me-2 rounded-pill"
                          onClick={() => setShowAddMenuModal(false)}
                        >
                          Annuler
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm">
                          <i className="bi bi-check-circle me-1"></i> Enregistrer le Plat au Menu
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              <div className="row g-2 g-md-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="col-6 col-md-4 col-lg-3">
                    <div className="card p-3 rounded-4 shadow-sm bg-white h-100 border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="rounded-3 mb-2"
                        style={{ height: '120px', objectFit: 'cover' }}
                      />
                      <b className="d-block small">{item.name}</b>
                      <small className="text-muted d-block mb-2" style={{ fontSize: '10px' }}>{item.description}</small>
                      <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                        <strong className="text-primary small">{item.price} {currency}</strong>
                        <span className="badge bg-success" style={{ fontSize: '9px' }}>En Stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS WITH SOCIAL MEDIA LINKS */}
          {activeTab === 'settings' && (
            <div className="tab-settings">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white" style={{ maxWidth: '850px' }}>
                <h3 className="fs-5 fw-bold mb-3">⚙️ Paramètres Restaurant & Réseaux Sociaux</h3>
                
                <form onSubmit={handleSaveSettings}>
                  <h4 className="fs-6 fw-bold text-primary mb-3">1. Informations Générales</h4>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Nom du Restaurant</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={settingsForm.restaurant_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, restaurant_name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Téléphone</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={settingsForm.restaurant_phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, restaurant_phone: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Adresse</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={settingsForm.restaurant_address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, restaurant_address: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Devise</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={settingsForm.currency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Frais de Livraison ({currency})</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={settingsForm.delivery_fee}
                        onChange={(e: any) => setSettingsForm({ ...settingsForm, delivery_fee: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Seuil Livraison Gratuite ({currency})</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={settingsForm.free_delivery_threshold}
                        onChange={(e: any) =>
                          setSettingsForm({ ...settingsForm, free_delivery_threshold: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <h4 className="fs-6 fw-bold text-primary mb-3">2. Liens des Réseaux Sociaux</h4>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        <i className="bi bi-facebook text-primary me-1"></i> Lien Facebook
                      </label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://facebook.com/theengineerburger"
                        value={settingsForm.facebook_url || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        <i className="bi bi-instagram text-danger me-1"></i> Lien Instagram
                      </label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://instagram.com/theengineerburger"
                        value={settingsForm.instagram_url || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        <i className="bi bi-tiktok text-dark me-1"></i> Lien TikTok
                      </label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://tiktok.com/@theengineerburger"
                        value={settingsForm.tiktok_url || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktok_url: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        <i className="bi bi-whatsapp text-success me-1"></i> Numéro WhatsApp Business
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="+213 550 12 34 56"
                        value={settingsForm.whatsapp_number || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="text-end">
                    <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm">
                      <i className="bi bi-check2-circle me-1"></i> Enregistrer Tous les Paramètres
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: STAFF */}
          {activeTab === 'staff' && (
            <div className="tab-staff">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
                <h3 className="fs-6 fw-bold mb-3">Comptes Staff & Rôles</h3>
                <div className="row g-3">
                  {DEMO_USERS.map((st) => (
                    <div key={st.id} className="col-md-4">
                      <div className="card p-3 rounded-3 border bg-light">
                        <div className="d-flex align-items-center gap-3">
                          <div className="customer-avatar rounded-circle">{st.name.charAt(0)}</div>
                          <div>
                            <b className="d-block small">{st.name}</b>
                            <span className="badge bg-dark text-uppercase" style={{ fontSize: '10px' }}>{st.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="tab-coupons">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
                <h3 className="fs-6 fw-bold mb-3">Codes Promo Actifs</h3>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="card p-3 rounded-3 border bg-light">
                      <b className="text-primary fs-5">WELCOME300</b>
                      <p className="text-muted small mb-1">300 DA offerts dès 1500 DA</p>
                      <span className="badge bg-success w-max">Actif</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card p-3 rounded-3 border bg-light">
                      <b className="text-primary fs-5">ENGINEER10</b>
                      <p className="text-muted small mb-1">10% de réduction dès 1000 DA</p>
                      <span className="badge bg-success w-max">Actif</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card p-3 rounded-3 border bg-light">
                      <b className="text-primary fs-5">SMASH500</b>
                      <p className="text-muted small mb-1">500 DA offerts dès 2500 DA</p>
                      <span className="badge bg-success w-max">Actif</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <style>{`
        .admin-sidebar .btn-sidebar {
          color: #a8a29e;
          border: 0;
          transition: all 0.2s ease;
        }
        .admin-sidebar .btn-sidebar:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .admin-sidebar .btn-sidebar.active-tab {
          background: linear-gradient(135deg, #f4511e, #ea580c) !important;
          color: #fff !important;
          box-shadow: 0 4px 15px rgba(244, 81, 30, 0.35);
        }
        @media (max-width: 991px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: -280px;
            transition: left 0.3s ease;
          }
          .admin-sidebar.show-mobile {
            left: 0;
          }
        }
      `}</style>
    </div>
  );
};
