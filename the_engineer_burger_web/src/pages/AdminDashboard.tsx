import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { MenuItem, Order, Coupon, User } from '../types';
import { DEMO_USERS, INITIAL_CATEGORIES } from '../lib/supabase';

interface AdminDashboardProps {
  setCurrentPage?: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { user, allUsers, registerStaff, logout } = useAuth();
  const {
    orders,
    menuItems,
    categories,
    coupons,
    currency,
    settings,
    updateOrderStatus,
    assignDriverToOrder,
    settleDriverCash,
    updateSettings,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    addCategory,
    addCoupon,
    deleteCoupon,
    toggleCouponStatus
  } = useCart();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'cash_settlement' | 'kitchen' | 'delivery' | 'menu' | 'coupons' | 'staff' | 'settings'
  >('overview');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Users & Staff management states
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<User | null>(null);
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<any>('delivery');
  const [newStaffPassword, setNewStaffPassword] = useState('123456');

  // Menu Modal State (Add / Edit)
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  // Form fields for dish
  const [dishNameFr, setDishNameFr] = useState('');
  const [dishNameAr, setDishNameAr] = useState('');
  const [dishDescFr, setDishDescFr] = useState('');
  const [dishDescAr, setDishDescAr] = useState('');
  const [dishPrice, setDishPrice] = useState(950);
  const [dishComparePrice, setDishComparePrice] = useState<number | undefined>(1150);
  const [dishCat, setDishCat] = useState(INITIAL_CATEGORIES[0].id);
  const [dishImg, setDishImg] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80');
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coupon Modal State
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'fixed' | 'percent'>('percent');
  const [couponValue, setCouponValue] = useState(15);
  const [couponMinOrder, setCouponMinOrder] = useState(1200);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState<number | undefined>(500);
  const [couponValidUntil, setCouponValidUntil] = useState('2030-12-31');
  const [couponUsageLimit, setCouponUsageLimit] = useState(100);

  // Settings form with Social Media links
  const [settingsForm, setSettingsForm] = useState(settings);

  // Orders filters & modal
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [assignModalOrder, setAssignModalOrder] = useState<Order | null>(null);

  // Selected driver settlement modal
  const [selectedDriverSettlement, setSelectedDriverSettlement] = useState<{
    driverName: string;
    orders: Order[];
    totalAmount: number;
  } | null>(null);

  const driversList = DEMO_USERS.filter((u) => u.role === 'delivery');

  // Handle local file selection from PC or Mobile phone
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setDishImg(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculations
  const allDeliveredOrders = orders.filter((o) => o.status === 'delivered');
  const unsettledCashOrders = allDeliveredOrders.filter(
    (o) => (o.payment_method === 'cod' || o.payment_method === 'cash') && !o.admin_cash_settled
  );
  const totalUnsettledCashInTransit = unsettledCashOrders.reduce((sum, o) => sum + o.total, 0);

  const realCollectedRevenue = orders.reduce((sum, o) => {
    if (o.status === 'cancelled') return sum;
    if (o.payment_method === 'baridimob' || o.payment_method === 'card') return sum + o.total;
    if (o.admin_cash_settled) return sum + o.total;
    return sum;
  }, 0);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const cookingOrdersCount = orders.filter((o) => o.status === 'preparing').length;
  const activeDeliveryCount = orders.filter((o) => o.status === 'ready' || o.status === 'out_for_delivery').length;

  // Group unsettled cash by Driver
  const driverCashBreakdown = driversList.map((driver) => {
    const driverOrders = unsettledCashOrders.filter(
      (o) => o.delivery_user_id === driver.id || o.assigned_driver_name?.includes(driver.name) || (!o.delivery_user_id && driver.name.includes('Sofiane'))
    );
    const totalAmount = driverOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      driver,
      orders: driverOrders,
      totalAmount
    };
  });

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
    const headers = 'Order Number,Customer,Phone,Address,Total,Payment Method,Payment Status,Status,Date\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.order_number}","${o.customer_name}","${o.customer_phone}","${o.delivery_address}",${o.total},"${o.payment_method}","${o.admin_cash_settled ? 'Settled' : 'Pending'}","${o.status}","${o.created_at}"`
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

  // Category Modal State
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatNameInput, setNewCatNameInput] = useState('');

  // Open Edit Dish Modal
  const openEditModal = (dish: MenuItem) => {
    setEditingDish(dish);
    setDishNameFr(dish.name || '');
    setDishNameAr(dish.name_ar || '');
    setDishDescFr(dish.description || '');
    setDishDescAr(dish.description_ar || '');
    setDishPrice(dish.price || 500);
    setDishComparePrice(dish.compare_price || undefined);
    setDishCat(dish.category_id || categories[0]?.id);
    setDishImg(dish.image);
    setPreviewImage('');
    setShowAddMenuModal(true);
  };

  const openAddModal = () => {
    setEditingDish(null);
    setDishNameFr('');
    setDishNameAr('');
    setDishDescFr('');
    setDishDescAr('');
    setDishPrice(950);
    setDishComparePrice(undefined);
    setDishCat(categories[0]?.id || '10000000-0000-0000-0000-000000000001');
    setDishImg('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80');
    setPreviewImage('');
    setShowAddMenuModal(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameInput.trim()) return;
    const created = await addCategory(newCatNameInput.trim());
    setDishCat(created.id);
    setNewCatNameInput('');
    setShowNewCatModal(false);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameFr = dishNameFr.trim();
    const nameAr = dishNameAr.trim();

    // User only needs at least 1 name (French OR Arabic)
    if (!nameFr && !nameAr) {
      alert('Veuillez saisir au moins le nom du plat en Français ou en Arabe.');
      return;
    }

    const finalNameFr = nameFr || nameAr;
    const finalNameAr = nameAr || nameFr;
    const finalDescFr = dishDescFr.trim() || dishDescAr.trim() || 'Préparé à la commande avec des ingrédients frais.';
    const finalDescAr = dishDescAr.trim() || dishDescFr.trim() || 'محضر طازجاً عند الطلب بمكونات طازجة.';
    const finalImage = previewImage || dishImg || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=88';
    const finalCatId = dishCat || (categories[0]?.id || '10000000-0000-0000-0000-000000000001');

    if (editingDish) {
      // Update existing dish
      const updated: MenuItem = {
        ...editingDish,
        name: finalNameFr,
        name_ar: finalNameAr,
        description: finalDescFr,
        description_ar: finalDescAr,
        price: Number(dishPrice) || 500,
        compare_price: dishComparePrice ? Number(dishComparePrice) : undefined,
        category_id: finalCatId,
        image: finalImage
      };
      await updateMenuItem(updated);
    } else {
      // Create new dish
      const newDish: MenuItem = {
        id: '20000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0'),
        category_id: finalCatId,
        name: finalNameFr,
        name_ar: finalNameAr,
        slug: finalNameFr.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900),
        description: finalDescFr,
        description_ar: finalDescAr,
        price: Number(dishPrice) || 500,
        compare_price: dishComparePrice ? Number(dishComparePrice) : undefined,
        image: finalImage,
        is_veg: false,
        is_featured: true,
        is_bestseller: false,
        spice_level: 1,
        preparation_time: 15,
        rating: 5.0,
        stock: 50,
        status: 1
      };
      await addMenuItem(newDish);
    }

    setShowAddMenuModal(false);
  };

  // Generate Random Coupon Code
  const generateRandomCouponCode = () => {
    const prefixes = ['SMASH', 'BURGER', 'VIP', 'OFFER', 'CHEF', 'ENGINEER'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setCouponCode(`${randomPrefix}${randomNum}`);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const newCoupon: Coupon = {
      id: 'cpn-' + Date.now(),
      code: couponCode.trim().toUpperCase(),
      type: couponType,
      value: Number(couponValue),
      minimum_order: Number(couponMinOrder),
      max_discount: couponMaxDiscount ? Number(couponMaxDiscount) : undefined,
      valid_until: couponValidUntil,
      usage_limit: Number(couponUsageLimit),
      used_count: 0,
      status: 1
    };

    await addCoupon(newCoupon);
    setShowAddCouponModal(false);
    setCouponCode('');
  };

  const handleConfirmSettlement = async (orderIds: string[]) => {
    await settleDriverCash(orderIds);
    setSelectedDriverSettlement(null);
  };

  const handleQuickAssign = (orderId: string, driverId: string, driverName: string) => {
    assignDriverToOrder(orderId, driverId, driverName);
    updateOrderStatus(orderId, 'out_for_delivery', driverId);
    setAssignModalOrder(null);
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

          {/* CASH SETTLEMENT TAB */}
          <button
            className={`btn btn-sidebar text-start px-3 py-2 rounded-3 d-flex align-items-center gap-3 ${
              activeTab === 'cash_settlement' ? 'active-tab' : 'text-secondary'
            }`}
            onClick={() => {
              setActiveTab('cash_settlement');
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-cash-coin fs-5 text-warning"></i>
            <span className="small fw-bold">Caisse & Livreurs</span>
            {totalUnsettledCashInTransit > 0 && (
              <span className="badge bg-warning text-dark ms-auto" style={{ fontSize: '10px' }}>
                {totalUnsettledCashInTransit} DA
              </span>
            )}
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
            <i className="bi bi-fire fs-5 text-danger"></i>
            <span className="small fw-bold">{t('tabKitchen')}</span>
            {cookingOrdersCount > 0 && (
              <span className="badge bg-danger text-white ms-auto">{cookingOrdersCount}</span>
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
            {activeDeliveryCount > 0 && (
              <span className="badge bg-info text-dark ms-auto">{activeDeliveryCount}</span>
            )}
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
            <i className="bi bi-tag fs-5"></i>
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
            <i className="bi bi-people fs-5"></i>
            <span className="small fw-bold">{t('tabStaff')}</span>
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
            <i className="bi bi-gear fs-5"></i>
            <span className="small fw-bold">{t('tabSettings')}</span>
          </button>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-top border-secondary bg-black bg-opacity-20 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <div className="customer-avatar rounded-circle">{user?.name?.charAt(0) || 'A'}</div>
            <div>
              <small className="d-block fw-bold text-white">{user?.name || 'Administrateur'}</small>
              <small className="text-secondary" style={{ fontSize: '10px' }}>Super Admin</small>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={logout} title="Déconnexion">
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT AREA */}
      <div className="admin-main flex-grow-1 d-flex flex-column overflow-auto">
        {/* Top Sticky Bar */}
        <header className="bg-white border-bottom px-4 py-3 sticky-top d-flex justify-content-between align-items-center shadow-sm" style={{ zIndex: 1020 }}>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-dark btn-sm d-lg-none"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <h1 className="fs-5 fw-bold mb-0 text-dark">
              {activeTab === 'overview' && '📊 Tableau de Bord & Performance'}
              {activeTab === 'orders' && '📦 Gestion des Commandes en Direct'}
              {activeTab === 'cash_settlement' && '💰 Caisse & Rapprochement des Espèces Livreurs'}
              {activeTab === 'kitchen' && '🔥 Écran Cuisine & Grillades (KDS)'}
              {activeTab === 'delivery' && '🛵 Suivi des Livraisons & Courses'}
              {activeTab === 'menu' && '🍔 Gestionnaire du Menu Bilingue (FR / العربية)'}
              {activeTab === 'coupons' && '🏷️ Gestionnaire de Codes Promo'}
              {activeTab === 'staff' && '👥 Équipe & Comptes du Restaurant'}
              {activeTab === 'settings' && '⚙️ Paramètres du Restaurant (Sauvegardés en BDD)'}
            </h1>
          </div>

          {/* Right Language & Refresh controls */}
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group btn-group-sm">
              <button
                className={`btn btn-sm ${language === 'fr' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setLanguage('fr')}
              >
                🇫🇷 FR
              </button>
              <button
                className={`btn btn-sm ${language === 'ar' ? 'btn-warning text-dark fw-bold' : 'btn-outline-dark'}`}
                style={{ fontFamily: 'Cairo, sans-serif' }}
                onClick={() => setLanguage('ar')}
              >
                🇩🇿 العربية
              </button>
            </div>

            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Actualiser
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-3 p-md-4 flex-grow-1">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="tab-overview">
              {/* Financial KPI Highlights */}
              <div className="row g-3 mb-4">
                {/* 1. Real Collected Revenue */}
                <div className="col-sm-6 col-lg-3">
                  <div className="card p-3 rounded-4 border-0 shadow-sm bg-white border-start border-4 border-success">
                    <span className="text-muted small fw-bold">CA RÉEL ENCAISSÉ EN CAISSE</span>
                    <h2 className="fs-4 fw-extrabold text-success mb-1 mt-2">
                      {realCollectedRevenue} {currency}
                    </h2>
                    <small className="text-muted" style={{ fontSize: '11px' }}>
                      Paiements BaridiMob + Espèces remises
                    </small>
                  </div>
                </div>

                {/* 2. Cash In Transit with Drivers */}
                <div className="col-sm-6 col-lg-3">
                  <div
                    className="card p-3 rounded-4 border-0 shadow-sm bg-white border-start border-4 border-warning cursor-pointer"
                    onClick={() => setActiveTab('cash_settlement')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="text-warning small fw-bold">FONDS CHEZ LES LIVREURS (CASH)</span>
                    <h2 className="fs-4 fw-extrabold text-warning mb-1 mt-2">
                      {totalUnsettledCashInTransit} {currency}
                    </h2>
                    <small className="text-primary fw-bold" style={{ fontSize: '11px' }}>
                      {unsettledCashOrders.length} courses à solder ➔
                    </small>
                  </div>
                </div>

                {/* 3. Total Orders */}
                <div className="col-sm-6 col-lg-3">
                  <div className="card p-3 rounded-4 border-0 shadow-sm bg-white border-start border-4 border-primary">
                    <span className="text-muted small fw-bold">TOTAL COMMANDES</span>
                    <h2 className="fs-4 fw-extrabold text-primary mb-1 mt-2">{totalOrdersCount}</h2>
                    <small className="text-muted" style={{ fontSize: '11px' }}>
                      {pendingOrdersCount} en attente · {cookingOrdersCount} en cuisson
                    </small>
                  </div>
                </div>

                {/* 4. Active Deliveries */}
                <div className="col-sm-6 col-lg-3">
                  <div className="card p-3 rounded-4 border-0 shadow-sm bg-white border-start border-4 border-info">
                    <span className="text-muted small fw-bold">LIVRAISONS EN COURS</span>
                    <h2 className="fs-4 fw-extrabold text-info mb-1 mt-2">{activeDeliveryCount}</h2>
                    <small className="text-muted" style={{ fontSize: '11px' }}>Sur la route</small>
                  </div>
                </div>
              </div>

              {/* Quick Cash Settlement Banner if Cash is held by drivers */}
              {totalUnsettledCashInTransit > 0 && (
                <div className="alert alert-warning border-warning d-flex justify-content-between align-items-center rounded-4 p-3 mb-4 shadow-sm">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-2">💵</span>
                    <div>
                      <strong className="d-block text-dark">
                        {totalUnsettledCashInTransit} {currency} en espèces sont actuellement entre les mains des livreurs
                      </strong>
                      <small className="text-muted">
                        Dès que le livreur rentre au restaurant et dépose le liquide, validez sa remise dans l'onglet Caisse.
                      </small>
                    </div>
                  </div>
                  <button
                    className="btn btn-warning text-dark fw-bold rounded-pill px-4"
                    onClick={() => setActiveTab('cash_settlement')}
                  >
                    Valider Remises Caisse ➔
                  </button>
                </div>
              )}

              {/* Recent Orders Overview with REAL ACTION BUTTONS */}
              <div className="card border-0 p-3 p-md-4 rounded-4 shadow-sm bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fs-6 fw-bold mb-0">Commandes Récentes & Actions Rapides</h3>
                  <button className="btn btn-sm btn-outline-dark rounded-pill" onClick={() => setActiveTab('orders')}>
                    Voir tout ➔
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>N° COMMANDE</th>
                        <th>CLIENT</th>
                        <th>TOTAL</th>
                        <th>PAIEMENT & CASH</th>
                        <th>STATUT ACTUEL</th>
                        <th>ACTIONS EN 1 CLIC (BOUTONS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 6).map((o) => {
                        const isCash = o.payment_method === 'cod' || o.payment_method === 'cash';
                        return (
                          <tr key={o.id}>
                            <td><b className="text-primary">#{o.order_number}</b></td>
                            <td>
                              <div className="fw-bold small">{o.customer_name}</div>
                              <small className="text-muted" style={{ fontSize: '11px' }}>{o.customer_phone}</small>
                            </td>
                            <td><strong className="small">{o.total} {currency}</strong></td>
                            <td>
                              <span className={`badge ${isCash ? 'bg-warning text-dark' : 'bg-success text-white'} me-1`}>
                                {isCash ? '💵 CASH' : '📱 BARIDIMOB'}
                              </span>
                              {o.status === 'delivered' && (
                                isCash ? (
                                  o.admin_cash_settled ? (
                                    <span className="badge bg-success" style={{ fontSize: '10px' }}>✅ Encaissé</span>
                                  ) : (
                                    <span className="badge bg-danger" style={{ fontSize: '10px' }}>⏳ Chez livreur</span>
                                  )
                                ) : (
                                  <span className="badge bg-info text-dark" style={{ fontSize: '10px' }}>Payé en ligne</span>
                                )
                              )}
                            </td>
                            <td>
                              <span className={`badge ${
                                o.status === 'delivered' ? 'bg-success' :
                                o.status === 'out_for_delivery' ? 'bg-info text-dark' :
                                o.status === 'ready' ? 'bg-warning text-dark' :
                                o.status === 'preparing' ? 'bg-danger' :
                                o.status === 'confirmed' ? 'bg-primary' : 'bg-secondary'
                              }`}>
                                {o.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {/* REAL ACTION BUTTONS + FLEXIBLE STATUS SWITCHER */}
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <select
                                  className="form-select form-select-sm py-1 px-2 rounded-pill fw-bold border-warning bg-light"
                                  style={{ fontSize: '11px', width: 'auto', minWidth: '130px' }}
                                  value={o.status}
                                  onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                                  title="Changer manuellement l'état de la commande"
                                >
                                  <option value="pending">⏳ En attente</option>
                                  <option value="confirmed">✅ Confirmée</option>
                                  <option value="preparing">🔥 Au Grill</option>
                                  <option value="ready">📦 Prête</option>
                                  <option value="out_for_delivery">🛵 En livraison</option>
                                  <option value="delivered">🎉 Livrée</option>
                                  <option value="cancelled">❌ Annulée</option>
                                </select>

                                {o.status === 'pending' && (
                                  <button
                                    className="btn btn-sm btn-primary py-1 px-2 fw-bold rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => updateOrderStatus(o.id, 'confirmed')}
                                  >
                                    ✅ Confirmer
                                  </button>
                                )}

                                {o.status === 'confirmed' && (
                                  <button
                                    className="btn btn-sm btn-danger py-1 px-2 fw-bold rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => updateOrderStatus(o.id, 'preparing')}
                                  >
                                    🔥 Au Grill
                                  </button>
                                )}

                                {o.status === 'preparing' && (
                                  <button
                                    className="btn btn-sm btn-warning text-dark py-1 px-2 fw-bold rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => updateOrderStatus(o.id, 'ready')}
                                  >
                                    📦 Prêt
                                  </button>
                                )}

                                {o.status === 'ready' && (
                                  <button
                                    className="btn btn-sm btn-info text-dark py-1 px-2 fw-bold rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => setAssignModalOrder(o)}
                                  >
                                    🛵 Livreur
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ORDERS MANAGEMENT WITH REAL INTERACTIVE BUTTONS */}
          {/* ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="tab-orders">
              <div className="card border-0 p-3 p-md-4 rounded-4 shadow-sm bg-white">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
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
                      placeholder="Rechercher (N°, client, tél)..."
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
                        <th>N° COMMANDE</th>
                        <th>CLIENT & ADRESSE</th>
                        <th>ARTICLES</th>
                        <th>MONTANT</th>
                        <th>PAIEMENT & CASH</th>
                        <th>LIVREUR ASSIGNÉ</th>
                        <th>STATUT & BOUTONS D'ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => {
                        const isCash = o.payment_method === 'cod' || o.payment_method === 'cash';
                        return (
                          <tr key={o.id}>
                            <td>
                              <strong className="text-primary small">#{o.order_number}</strong>
                              <small className="d-block text-muted" style={{ fontSize: '10px' }}>
                                {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </td>
                            <td>
                              <div className="fw-bold small">{o.customer_name} ({o.customer_phone})</div>
                              <small className="text-muted d-block" style={{ fontSize: '11px' }}>{o.delivery_address}</small>
                            </td>
                            <td className="small" style={{ fontSize: '12px' }}>
                              {o.items?.map((item, i) => (
                                <div key={i}><b>{item.quantity}x</b> {item.item_name}</div>
                              ))}
                            </td>
                            <td><b className="text-success small">{o.total} {currency}</b></td>
                            <td>
                              <span className={`badge ${isCash ? 'bg-warning text-dark' : 'bg-success text-white'} d-block mb-1`}>
                                {isCash ? '💵 CASH' : '📱 BARIDIMOB'}
                              </span>
                              {o.status === 'delivered' && (
                                isCash ? (
                                  o.admin_cash_settled ? (
                                    <span className="badge bg-success" style={{ fontSize: '10px' }}>
                                      ✅ Remis en caisse
                                    </span>
                                  ) : (
                                    <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>
                                      ⏳ En attente versement
                                    </span>
                                  )
                                ) : (
                                  <span className="badge bg-secondary" style={{ fontSize: '10px' }}>Encaissé en ligne</span>
                                )
                              )}
                            </td>
                            <td>
                              {o.assigned_driver_name ? (
                                <span className="badge bg-dark text-info p-2 d-block">
                                  🛵 {o.assigned_driver_name}
                                </span>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-info rounded-pill py-1 px-2"
                                  style={{ fontSize: '11px' }}
                                  onClick={() => setAssignModalOrder(o)}
                                >
                                  + Assigner Livreur
                                </button>
                              )}
                            </td>
                            <td>
                              {/* REAL INTERACTIVE BUTTONS PER STATE + FLEXIBLE SELECTOR */}
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <select
                                  className="form-select form-select-sm py-1 px-2 rounded-pill fw-bold border-warning bg-light"
                                  style={{ fontSize: '11px', width: 'auto', minWidth: '130px' }}
                                  value={o.status}
                                  onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                                  title="Changer manuellement l'état de la commande"
                                >
                                  <option value="pending">⏳ En attente</option>
                                  <option value="confirmed">✅ Confirmée</option>
                                  <option value="preparing">🔥 Au Grill</option>
                                  <option value="ready">📦 Prête</option>
                                  <option value="out_for_delivery">🛵 En livraison</option>
                                  <option value="delivered">🎉 Livrée</option>
                                  <option value="cancelled">❌ Annulée</option>
                                </select>

                                {o.status === 'pending' && (
                                  <button
                                    className="btn btn-sm btn-primary py-1 px-2 fw-bold rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => updateOrderStatus(o.id, 'confirmed')}
                                  >
                                    ✅ Confirmer
                                  </button>
                                )}

                                {o.status === 'confirmed' && (
                                  <button
                                    className="btn btn-sm btn-danger py-1 px-2 fw-bold rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => updateOrderStatus(o.id, 'preparing')}
                                  >
                                    🔥 Au Grill
                                  </button>
                                )}

                                {o.status === 'preparing' && (
                                  <button
                                    className="btn btn-sm btn-warning text-dark py-1 px-2 fw-bold rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => updateOrderStatus(o.id, 'ready')}
                                  >
                                    📦 Prêt
                                  </button>
                                )}

                                {o.status === 'ready' && (
                                  <button
                                    className="btn btn-sm btn-info text-dark py-1 px-2 fw-bold rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => setAssignModalOrder(o)}
                                  >
                                    🛵 Assigner Livreur
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CASH SETTLEMENT / RAPPROCHEMENT CAISSE LIVREURS */}
          {/* ========================================================================= */}
          {activeTab === 'cash_settlement' && (
            <div className="tab-cash-settlement">
              <div className="card p-4 rounded-4 shadow-sm bg-white border-0 mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <h2 className="fs-5 fw-bold text-dark mb-1">
                      💰 Rapprochement des Espèces & Versement Livreurs
                    </h2>
                    <p className="text-muted small mb-0">
                      Gérez les sommes collectées en argent liquide (Cash on Delivery) par vos livreurs. Lorsqu'un livreur revient de sa tournée et vous remet l'argent physique, validez la remise pour créditer définitivement le Chiffre d'Affaires du restaurant.
                    </p>
                  </div>
                  <div className="text-md-end p-3 rounded-3 bg-warning bg-opacity-10 border border-warning">
                    <small className="text-warning fw-bold d-block" style={{ fontSize: '11px' }}>
                      TOTAL ESPÈCES EN ATTENTE DE VERSEMENT
                    </small>
                    <b className="fs-4 text-dark">{totalUnsettledCashInTransit} {currency}</b>
                  </div>
                </div>
              </div>

              {/* Driver Cash Breakdown Cards */}
              <div className="row g-4 mb-4">
                {driverCashBreakdown.map(({ driver, orders: dOrders, totalAmount }) => (
                  <div key={driver.id} className="col-lg-6">
                    <div className="card p-4 rounded-4 shadow-sm bg-white border h-100">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              color: '#fff',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '20px'
                            }}
                          >
                            🛵
                          </div>
                          <div>
                            <h3 className="fs-6 fw-bold mb-0 text-dark">{driver.name}</h3>
                            <small className="text-muted">📞 {driver.phone} · TMAX Ouargla</small>
                          </div>
                        </div>

                        <div className="text-end">
                          <span className="badge bg-warning text-dark fw-bold px-3 py-2 fs-6">
                            {totalAmount} {currency}
                          </span>
                          <small className="d-block text-muted" style={{ fontSize: '10px' }}>
                            {dOrders.length} courses en cash
                          </small>
                        </div>
                      </div>

                      {/* Orders List for this driver */}
                      {dOrders.length > 0 ? (
                        <div>
                          <div className="p-3 bg-light rounded-3 mb-3 small">
                            <b className="text-muted d-block mb-2" style={{ fontSize: '11px' }}>
                              COURSES LIVRÉES À ENCAISSER :
                            </b>
                            {dOrders.map((o) => (
                              <div key={o.id} className="d-flex justify-content-between py-1 border-bottom border-white">
                                <div>
                                  <strong className="text-primary">#{o.order_number}</strong> · {o.customer_name}
                                  {o.driver_notes && (
                                    <small className="text-muted d-block fst-italic">({o.driver_notes})</small>
                                  )}
                                </div>
                                <b>{o.total} {currency}</b>
                              </div>
                            ))}
                          </div>

                          <button
                            className="btn btn-success w-100 py-3 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                            onClick={() =>
                              setSelectedDriverSettlement({
                                driverName: driver.name,
                                orders: dOrders,
                                totalAmount
                              })
                            }
                          >
                            <i className="bi bi-check2-circle fs-5"></i>
                            <span>Valider la Remise de {totalAmount} {currency} & Encaisser au CA</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-success bg-light rounded-3">
                          <i className="bi bi-check-circle-fill fs-3 d-block mb-1"></i>
                          Aucun montant en attente. Le compte de ce livreur est à jour !
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: KITCHEN QUEUE */}
          {/* ========================================================================= */}
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
                            className="btn btn-success w-100 py-2 fw-bold small rounded-pill"
                            onClick={() => updateOrderStatus(o.id, 'ready')}
                          >
                            <i className="bi bi-check2-circle me-1"></i> Marquer Prêt
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary w-100 py-2 fw-bold small rounded-pill"
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

          {/* ========================================================================= */}
          {/* TAB 5: DELIVERY QUEUE */}
          {/* ========================================================================= */}
          {activeTab === 'delivery' && (
            <div className="tab-delivery">
              <div className="row g-3">
                {orders
                  .filter((o) => o.status === 'ready' || o.status === 'out_for_delivery')
                  .map((o) => (
                    <div key={o.id} className="col-md-6 col-lg-4">
                      <div className="card p-3 rounded-4 shadow-sm bg-white border-top border-4 border-info">
                        <div className="d-flex justify-content-between mb-2">
                          <strong className="text-primary">#{o.order_number}</strong>
                          <span className="badge bg-info text-dark">
                            {o.assigned_driver_name ? `🛵 ${o.assigned_driver_name}` : 'À ASSIGNER'}
                          </span>
                        </div>

                        <h4 className="fs-6 fw-bold mb-1">{o.customer_name}</h4>
                        <p className="text-muted small mb-1"><i className="bi bi-geo-alt me-1"></i> {o.delivery_address}</p>
                        <p className="text-muted small mb-3"><i className="bi bi-telephone me-1"></i> {o.customer_phone}</p>

                        <div className="d-flex gap-2 mb-3">
                          <a href={`tel:${o.customer_phone}`} className="btn btn-outline-dark btn-sm flex-fill rounded-pill">
                            <i className="bi bi-telephone me-1"></i> Appeler
                          </a>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(o.delivery_address)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-primary btn-sm flex-fill rounded-pill"
                          >
                            <i className="bi bi-map me-1"></i> GPS
                          </a>
                        </div>

                        {o.status === 'ready' ? (
                          <button
                            className="btn btn-info text-dark w-100 py-2 fw-bold small rounded-pill"
                            onClick={() => setAssignModalOrder(o)}
                          >
                            <i className="bi bi-scooter me-1"></i> Assigner au Livreur & Démarrer
                          </button>
                        ) : (
                          <button
                            className="btn btn-success w-100 py-2 fw-bold small rounded-pill"
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

          {/* ========================================================================= */}
          {/* TAB 6: MENU MANAGEMENT WITH BILINGUAL EDIT / DELETE */}
          {/* ========================================================================= */}
          {activeTab === 'menu' && (
            <div className="tab-menu">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h3 className="fs-6 fw-bold mb-0">Carte des Plats & Burgers ({menuItems.length})</h3>
                  <small className="text-muted">Modifiez les prix, photos, noms en Français & Arabe en direct</small>
                </div>
                <button
                  className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                  onClick={openAddModal}
                >
                  <i className="bi bi-plus-circle me-1"></i> + Ajouter un Plat Bilingue
                </button>
              </div>

              {/* Add / Edit Dish Modal */}
              {showAddMenuModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
                  <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow-lg">
                      <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold text-dark">
                          {editingDish ? `✏️ Modifier le Plat : ${editingDish.name}` : '🍔 Ajouter un Nouveau Plat Bilingue'}
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowAddMenuModal(false)}
                        ></button>
                      </div>

                      <form onSubmit={handleSaveDish}>
                        <div className="modal-body p-4">
                          <div className="row g-3">
                            {/* Nom Français */}
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Nom du plat (Français) 🇫🇷</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Ex: Smash Burger Spécial (Facultatif si Arabe rempli)"
                                value={dishNameFr}
                                onChange={(e) => setDishNameFr(e.target.value)}
                              />
                            </div>

                            {/* Nom Arabe */}
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">اسم الوجبة (العربية) 🇩🇿</label>
                              <input
                                type="text"
                                className="form-control text-end"
                                placeholder="مثال: سماش برجر خاص (اختياري إذا تم ملء الفرنسي)"
                                value={dishNameAr}
                                onChange={(e) => setDishNameAr(e.target.value)}
                              />
                            </div>

                            {/* Prix & Prix Barré */}
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Prix de Vente ({currency}) *</label>
                              <input
                                type="number"
                                className="form-control"
                                value={dishPrice}
                                onChange={(e: any) => setDishPrice(Number(e.target.value))}
                                required
                              />
                            </div>

                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Prix Comparé / Ancien Prix ({currency})</label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Optionnel (ex: 1200)"
                                value={dishComparePrice || ''}
                                onChange={(e: any) => setDishComparePrice(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </div>

                            <div className="col-md-4">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label small fw-bold mb-0">Catégorie</label>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-primary small text-decoration-none fw-bold"
                                  style={{ fontSize: '11px' }}
                                  onClick={() => setShowNewCatModal(true)}
                                >
                                  + Nouvelle
                                </button>
                              </div>
                              <select
                                className="form-select"
                                value={dishCat}
                                onChange={(e) => setDishCat(e.target.value)}
                              >
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Description Française */}
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Description (Français) 🇫🇷 <span className="text-muted fw-normal">(Optionnel)</span></label>
                              <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Double steak haché pur bœuf algérien, cheddar..."
                                value={dishDescFr}
                                onChange={(e) => setDishDescFr(e.target.value)}
                              ></textarea>
                            </div>

                            {/* Description Arabe */}
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">الوصف (العربية) 🇩🇿</label>
                              <textarea
                                className="form-control text-end"
                                rows={2}
                                placeholder="لحم بقري طازج مزدوج، جبن شيدر ذائب..."
                                value={dishDescAr}
                                onChange={(e) => setDishDescAr(e.target.value)}
                              ></textarea>
                            </div>

                            {/* Photo Upload & Preview */}
                            <div className="col-12">
                              <label className="form-label small fw-bold">
                                Photo du plat (Galerie Téléphone, PC ou URL)
                              </label>
                              <div
                                className="p-3 border rounded-3 text-center bg-light cursor-pointer position-relative d-flex flex-column align-items-center justify-content-center"
                                style={{
                                  borderStyle: 'dashed !important',
                                  borderColor: '#ea580c !important',
                                  minHeight: '120px',
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

                                {previewImage || dishImg ? (
                                  <div className="text-center">
                                    <img
                                      src={previewImage || dishImg}
                                      alt="Aperçu"
                                      style={{ maxHeight: '110px', borderRadius: '8px', objectFit: 'cover' }}
                                    />
                                    <small className="d-block text-success mt-1 fw-bold">
                                      ✅ Cliquez pour changer la photo
                                    </small>
                                  </div>
                                ) : (
                                  <div>
                                    <i className="bi bi-cloud-arrow-up fs-2 text-warning"></i>
                                    <b className="d-block small mt-1">Sélectionner une photo locale</b>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="modal-footer border-top">
                          <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill"
                            onClick={() => setShowAddMenuModal(false)}
                          >
                            Annuler
                          </button>
                          <button type="submit" className="btn btn-primary px-4 fw-bold rounded-pill">
                            {editingDish ? 'Enregistrer les Modifications' : 'Ajouter le Plat au Menu'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Category Modal */}
              {showNewCatModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1080 }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow-lg">
                      <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold text-dark">✨ Créer une Nouvelle Catégorie</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowNewCatModal(false)}
                        ></button>
                      </div>
                      <form onSubmit={handleCreateCategory}>
                        <div className="modal-body p-4">
                          <label className="form-label small fw-bold">Nom de la Catégorie (ex: Tacos, Salades, Boxes...)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nom de la nouvelle catégorie"
                            value={newCatNameInput}
                            onChange={(e) => setNewCatNameInput(e.target.value)}
                            autoFocus
                            required
                          />
                        </div>
                        <div className="modal-footer border-top">
                          <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill"
                            onClick={() => setShowNewCatModal(false)}
                          >
                            Annuler
                          </button>
                          <button type="submit" className="btn btn-primary px-4 fw-bold rounded-pill">
                            Créer la Catégorie
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Grid with Edit and Delete buttons */}
              <div className="row g-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="col-sm-6 col-lg-4 col-xl-3">
                    <div className="card p-3 rounded-4 shadow-sm bg-white h-100 d-flex flex-column justify-content-between border">
                      <div>
                        <div className="position-relative mb-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-100 rounded-3"
                            style={{ height: '140px', objectFit: 'cover' }}
                          />
                          <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-2">
                            {item.price} {currency}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h4 className="fs-6 fw-bold mb-0">{item.name}</h4>
                          <button
                            type="button"
                            className={`btn btn-sm rounded-pill py-0 px-2 fw-bold ${item.status === 1 ? 'btn-success text-white' : 'btn-danger text-white'}`}
                            style={{ fontSize: '11px', height: '24px' }}
                            onClick={() => toggleItemAvailability(item.id)}
                            title="Cliquer pour changer la disponibilité en direct"
                          >
                            {item.status === 1 ? '🟢 Disponible' : '🔴 Épuisé (Rupture)'}
                          </button>
                        </div>
                        {item.name_ar && (
                          <div className="text-warning fw-bold small mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                            {item.name_ar}
                          </div>
                        )}
                        <p className="text-muted small mb-2 line-clamp-2" style={{ fontSize: '11px' }}>
                          {item.description}
                        </p>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary flex-fill rounded-pill fw-bold"
                          onClick={() => openEditModal(item)}
                        >
                          <i className="bi bi-pencil-square me-1"></i> Modifier
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-2"
                          onClick={() => {
                            if (window.confirm(`Voulez-vous vraiment supprimer "${item.name}" ?`)) {
                              deleteMenuItem(item.id);
                            }
                          }}
                          title="Supprimer"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: COUPONS & PROMO CODES MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'coupons' && (
            <div className="tab-coupons">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h3 className="fs-6 fw-bold mb-0">Gestionnaire de Codes Promo & Réductions</h3>
                  <small className="text-muted">Créez des coupons en pourcentage (%) ou montant fixe (DA)</small>
                </div>
                <button
                  className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                  onClick={() => {
                    generateRandomCouponCode();
                    setShowAddCouponModal(true);
                  }}
                >
                  <i className="bi bi-tag-fill me-1"></i> + Créer un Code Promo
                </button>
              </div>

              {/* Coupons List Grid */}
              <div className="row g-3">
                {coupons.map((c) => {
                  const isActive = c.status === 1;
                  return (
                    <div key={c.id} className="col-md-4">
                      <div className={`card p-4 rounded-4 shadow-sm bg-white border ${isActive ? 'border-primary' : 'border-secondary opacity-75'}`}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <b className="text-primary fs-4">{c.code}</b>
                          <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {isActive ? 'Actif' : 'Désactivé'}
                          </span>
                        </div>

                        <p className="text-dark fw-bold mb-1">
                          {c.type === 'percent' ? `${c.value}% de réduction` : `${c.value} ${currency} offerts`}
                        </p>
                        <small className="text-muted d-block mb-1">
                          Commande min : <b>{c.minimum_order} {currency}</b>
                        </small>
                        <small className="text-muted d-block mb-3">
                          Expire le : <b>{c.valid_until}</b> · Utilisations : <b>{c.used_count || 0}/{c.usage_limit || 100}</b>
                        </small>

                        <div className="d-flex gap-2 pt-2 border-top">
                          <button
                            className={`btn btn-sm flex-fill rounded-pill ${isActive ? 'btn-outline-warning text-dark' : 'btn-outline-success'}`}
                            onClick={() => toggleCouponStatus(c.id)}
                          >
                            {isActive ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => deleteCoupon(c.id)}
                            title="Supprimer"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Coupon Modal */}
              {showAddCouponModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow-lg">
                      <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold text-dark">🏷️ Créer un Nouveau Code Promo</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowAddCouponModal(false)}
                        ></button>
                      </div>

                      <form onSubmit={handleSaveCoupon}>
                        <div className="modal-body p-4">
                          <div className="mb-3">
                            <label className="form-label small fw-bold">Nom du Code Promo</label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control text-uppercase fw-bold"
                                placeholder="Ex: SMASH20"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={generateRandomCouponCode}
                              >
                                🎲 Générer
                              </button>
                            </div>
                          </div>

                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <label className="form-label small fw-bold">Type de Réduction</label>
                              <select
                                className="form-select"
                                value={couponType}
                                onChange={(e: any) => setCouponType(e.target.value)}
                              >
                                <option value="percent">Pourcentage (%)</option>
                                <option value="fixed">Montant Fixe ({currency})</option>
                              </select>
                            </div>
                            <div className="col-6">
                              <label className="form-label small fw-bold">Valeur ({couponType === 'percent' ? '%' : currency})</label>
                              <input
                                type="number"
                                className="form-control"
                                value={couponValue}
                                onChange={(e: any) => setCouponValue(Number(e.target.value))}
                                required
                              />
                            </div>
                          </div>

                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <label className="form-label small fw-bold">Commande Minimale ({currency})</label>
                              <input
                                type="number"
                                className="form-control"
                                value={couponMinOrder}
                                onChange={(e: any) => setCouponMinOrder(Number(e.target.value))}
                                required
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label small fw-bold">Réduction Max ({currency})</label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Optionnel"
                                value={couponMaxDiscount || ''}
                                onChange={(e: any) => setCouponMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </div>
                          </div>

                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <label className="form-label small fw-bold">Date d'Expiration</label>
                              <input
                                type="date"
                                className="form-control"
                                value={couponValidUntil}
                                onChange={(e) => setCouponValidUntil(e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label small fw-bold">Limite d'Utilisation</label>
                              <input
                                type="number"
                                className="form-control"
                                value={couponUsageLimit}
                                onChange={(e: any) => setCouponUsageLimit(Number(e.target.value))}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="modal-footer border-top">
                          <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill"
                            onClick={() => setShowAddCouponModal(false)}
                          >
                            Annuler
                          </button>
                          <button type="submit" className="btn btn-primary px-4 fw-bold rounded-pill">
                            Activer le Code Promo
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: USERS & CLIENTS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'staff' && (
            <div className="tab-users">
              <div className="card border-0 p-3 p-md-4 rounded-4 shadow-sm bg-white">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div>
                    <h3 className="fs-6 fw-bold mb-0">👥 Utilisateurs & Clients Enregistrés ({allUsers.length})</h3>
                    <small className="text-muted">Consultez les coordonnées, adresses à Ouargla et l'historique complet d'achats</small>
                  </div>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill"
                      placeholder="🔍 Rechercher client, téléphone..."
                      style={{ maxWidth: '240px' }}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm rounded-pill px-3 fw-bold text-nowrap"
                      onClick={() => setShowCreateStaffModal(true)}
                    >
                      <i className="bi bi-person-plus-fill me-1"></i> + Créer Livreur / Staff
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>UTILISATEUR</th>
                        <th>TÉLÉPHONE (OUARGLA)</th>
                        <th>ADRESSE DE LIVRAISON</th>
                        <th>RÔLE</th>
                        <th>INSCRIPTION</th>
                        <th>COMMANDES & DÉPENSES</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers
                        .filter((u) => {
                          if (!userSearch.trim()) return true;
                          const q = userSearch.toLowerCase();
                          return (
                            u.name.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q) ||
                            (u.phone && u.phone.includes(q)) ||
                            (u.address && u.address.toLowerCase().includes(q))
                          );
                        })
                        .map((u) => {
                          const userOrders = orders.filter(
                            (o) => o.user_id === u.id || (u.phone && o.customer_phone === u.phone)
                          );
                          const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

                          return (
                            <tr key={u.id}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="customer-avatar rounded-circle bg-warning text-dark fw-bold d-grid place-items-center"
                                    style={{ width: '36px', height: '36px', fontSize: '14px' }}
                                  >
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong className="d-block text-dark small">{u.name}</strong>
                                    <small className="text-muted" style={{ fontSize: '11px' }}>{u.email}</small>
                                  </div>
                                </div>
                              </td>

                              <td>
                                {u.phone ? (
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="small fw-bold">{u.phone}</span>
                                    <a
                                      href={`tel:${u.phone}`}
                                      className="btn btn-sm btn-outline-success rounded-circle p-1"
                                      style={{ width: '26px', height: '26px', lineHeight: '1' }}
                                      title="Appeler"
                                    >
                                      <i className="bi bi-telephone-fill" style={{ fontSize: '10px' }}></i>
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-muted small">Non renseigné</span>
                                )}
                              </td>

                              <td>
                                <span className="small text-dark">
                                  <i className="bi bi-geo-alt text-danger me-1"></i>
                                  {u.address || 'Centre-Ville, Ouargla'}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`badge ${
                                    u.role === 'admin'
                                      ? 'bg-danger'
                                      : u.role === 'delivery'
                                      ? 'bg-warning text-dark fw-bold'
                                      : u.role === 'kitchen'
                                      ? 'bg-primary'
                                      : 'bg-info text-dark'
                                  }`}
                                >
                                  {u.role === 'delivery'
                                    ? '🛵 LIVREUR'
                                    : u.role === 'admin'
                                    ? '👑 ADMIN'
                                    : u.role === 'kitchen'
                                    ? '👨‍🍳 CUISINE'
                                    : '🍔 CLIENT'}
                                </span>
                              </td>

                              <td>
                                <small className="text-muted">
                                  {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : 'Août 2026'}
                                </small>
                              </td>

                              <td>
                                <strong className="d-block small text-dark">
                                  {userOrders.length} commande{userOrders.length > 1 ? 's' : ''}
                                </strong>
                                <small className="text-success fw-bold">{totalSpent} {currency}</small>
                              </td>

                              <td>
                                <button
                                  className="btn btn-sm btn-outline-dark rounded-pill px-2 py-1 fw-bold"
                                  style={{ fontSize: '11px' }}
                                  onClick={() => setSelectedUserForOrders(u)}
                                >
                                  <i className="bi bi-clock-history me-1"></i> Historique ({userOrders.length})
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal: Historique des Commandes d'un Client Spécifique */}
              {selectedUserForOrders && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
                  <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow-lg">
                      <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold text-dark">
                          📜 Historique des Commandes : {selectedUserForOrders.name}
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setSelectedUserForOrders(null)}
                        ></button>
                      </div>
                      <div className="modal-body p-4">
                        <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <div>
                            <strong className="d-block text-dark">{selectedUserForOrders.name}</strong>
                            <small className="text-muted">📞 {selectedUserForOrders.phone || 'N/A'} · 📍 {selectedUserForOrders.address || 'Ouargla'}</small>
                          </div>
                          <span className="badge bg-dark fs-6">
                            Total : {orders.filter((o) => o.user_id === selectedUserForOrders.id || (selectedUserForOrders.phone && o.customer_phone === selectedUserForOrders.phone)).length} commandes
                          </span>
                        </div>

                        {orders.filter((o) => o.user_id === selectedUserForOrders.id || (selectedUserForOrders.phone && o.customer_phone === selectedUserForOrders.phone)).length > 0 ? (
                          <div className="d-flex flex-column gap-3">
                            {orders
                              .filter((o) => o.user_id === selectedUserForOrders.id || (selectedUserForOrders.phone && o.customer_phone === selectedUserForOrders.phone))
                              .map((ord) => (
                                <div key={ord.id} className="p-3 border rounded-3 bg-white shadow-sm">
                                  <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                    <div>
                                      <b className="text-primary fs-6">#{ord.order_number}</b>
                                      <small className="text-muted ms-2">{new Date(ord.created_at).toLocaleString('fr-FR')}</small>
                                    </div>
                                    <span className={`badge ${ord.status === 'delivered' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                      {ord.status.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="small">
                                      {ord.items?.map((it, idx) => (
                                        <span key={idx} className="badge bg-light text-dark border me-1">
                                          {it.quantity}x {it.item_name}
                                        </span>
                                      ))}
                                    </div>
                                    <b className="fs-6 text-dark">{ord.total} {currency}</b>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted">
                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                            Aucune commande enregistrée pour ce client pour le moment.
                          </div>
                        )}
                      </div>
                      <div className="modal-footer border-top">
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill px-4"
                          onClick={() => setSelectedUserForOrders(null)}
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal: Créer un Compte Livreur ou Staff */}
              {showCreateStaffModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow-lg">
                      <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold text-dark">➕ Créer un Compte Livreur ou Staff</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowCreateStaffModal(false)}
                        ></button>
                      </div>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!newStaffName.trim() || !newStaffEmail.trim()) return;
                          await registerStaff(
                            newStaffName,
                            newStaffEmail,
                            newStaffPhone,
                            newStaffRole,
                            newStaffPassword,
                            'Ouargla'
                          );
                          setNewStaffName('');
                          setNewStaffEmail('');
                          setNewStaffPhone('');
                          setShowCreateStaffModal(false);
                        }}
                      >
                        <div className="modal-body p-4">
                          <div className="mb-3">
                            <label className="form-label small fw-bold">Rôle du Compte</label>
                            <select
                              className="form-select"
                              value={newStaffRole}
                              onChange={(e: any) => setNewStaffRole(e.target.value)}
                            >
                              <option value="delivery">🛵 Livreur Express (Accès Espace Livreur)</option>
                              <option value="kitchen">👨‍🍳 Chef Cuisine (Accès Écran KDS Grill)</option>
                              <option value="staff">💼 Staff / Caissier</option>
                              <option value="admin">👑 Administrateur (Accès Total)</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-bold">Nom & Prénom</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ex: Sofiane Livreur"
                              value={newStaffName}
                              onChange={(e) => setNewStaffName(e.target.value)}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-bold">Adresse Email de Connexion</label>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="livreur@engineerburger.dz"
                              value={newStaffEmail}
                              onChange={(e) => setNewStaffEmail(e.target.value)}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-bold">Numéro de Téléphone (Ouargla)</label>
                            <input
                              type="tel"
                              className="form-control"
                              placeholder="0550 00 00 00"
                              value={newStaffPhone}
                              onChange={(e) => setNewStaffPhone(e.target.value)}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-bold">Mot de Passe Provisoire</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newStaffPassword}
                              onChange={(e) => setNewStaffPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="modal-footer border-top">
                          <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill"
                            onClick={() => setShowCreateStaffModal(false)}
                          >
                            Annuler
                          </button>
                          <button type="submit" className="btn btn-primary px-4 fw-bold rounded-pill">
                            Créer le Compte
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: SETTINGS & DATABASE SYNC */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="tab-settings">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="fs-6 fw-bold mb-0">Paramètres Généraux du Restaurant</h3>
                    <small className="text-success fw-bold">
                      <i className="bi bi-database-check me-1"></i> Sauvegardé directement dans la Base de Données Supabase
                    </small>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Nom du Restaurant</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={settingsForm.restaurant_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, restaurant_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Numéro de Téléphone Contact</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={settingsForm.restaurant_phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, restaurant_phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Adresse Complète du Restaurant</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={settingsForm.restaurant_address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, restaurant_address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Frais de Livraison ({currency})</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={settingsForm.delivery_fee}
                        onChange={(e: any) => setSettingsForm({ ...settingsForm, delivery_fee: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Seuil Livraison Gratuite ({currency})</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={settingsForm.free_delivery_threshold}
                        onChange={(e: any) => setSettingsForm({ ...settingsForm, free_delivery_threshold: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Commande Minimale ({currency})</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={settingsForm.minimum_order}
                        onChange={(e: any) => setSettingsForm({ ...settingsForm, minimum_order: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email de Contact</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={settingsForm.restaurant_email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, restaurant_email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Horaires d'Ouverture</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={settingsForm.opening_hours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
                        required
                      />
                    </div>

                    <hr className="my-3" />
                    <h4 className="fs-6 fw-bold mb-2">Liens Réseaux Sociaux & WhatsApp</h4>

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
                      <i className="bi bi-check2-circle me-1"></i> Enregistrer Tous les Paramètres en BDD
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN DRIVER TO ORDER */}
      {/* ========================================================================= */}
      {assignModalOrder && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  🛵 Assigner un Livreur - Commande #{assignModalOrder.order_number}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAssignModalOrder(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded-3 mb-3">
                  <strong className="d-block">{assignModalOrder.customer_name}</strong>
                  <small className="text-muted d-block">📍 {assignModalOrder.delivery_address}</small>
                  <b className="text-success mt-1 d-block">{assignModalOrder.total} {currency}</b>
                </div>

                <label className="form-label small fw-bold">Sélectionnez le livreur disponible :</label>
                <div className="d-flex flex-column gap-2">
                  {driversList.map((dr) => (
                    <button
                      key={dr.id}
                      className="btn btn-outline-dark p-3 rounded-3 text-start d-flex justify-content-between align-items-center"
                      onClick={() => handleQuickAssign(assignModalOrder.id, dr.id, dr.name)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-4">🛵</span>
                        <div>
                          <b className="d-block">{dr.name}</b>
                          <small className="text-muted">📞 {dr.phone}</small>
                        </div>
                      </div>
                      <span className="badge bg-success">Assigner ➔</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM CASH SETTLEMENT FROM DRIVER */}
      {/* ========================================================================= */}
      {selectedDriverSettlement && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  💵 Valider la Remise d'Espèces - {selectedDriverSettlement.driverName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedDriverSettlement(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded-3 text-center mb-3">
                  <small className="text-muted d-block">MONTANT TOTAL REÇU EN CASH :</small>
                  <b className="fs-2 text-success">{selectedDriverSettlement.totalAmount} {currency}</b>
                </div>

                <p className="text-muted small mb-2">
                  En cliquant sur <b>Confirmer</b> :
                </p>
                <ul className="text-muted small mb-3">
                  <li>Les {selectedDriverSettlement.orders.length} courses seront marquées comme soldées.</li>
                  <li>Le montant sera crédité au Chiffre d'Affaires réel encaissé.</li>
                  <li>Le compte du livreur sera remis à zéro.</li>
                </ul>
              </div>
              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => setSelectedDriverSettlement(null)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-success fw-bold px-4 rounded-pill"
                  onClick={() =>
                    handleConfirmSettlement(selectedDriverSettlement.orders.map((o) => o.id))
                  }
                >
                  Confirmer la Réception des Fonds ✅
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
