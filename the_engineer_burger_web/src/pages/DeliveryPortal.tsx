import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Order } from '../types';

interface DeliveryPortalProps {
  setCurrentPage?: (page: string) => void;
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = () => {
  const { user } = useAuth();
  const {
    orders,
    currency,
    updateOrderStatus,
    cancelOrderByDriver,
    driverPreferredCustomers,
    toggleDriverPreferredCustomer
  } = useCart();
  const { language, setLanguage, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'cash' | 'customers'>('active');
  const [riderStatus, setRiderStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const [searchHistory, setSearchHistory] = useState('');
  const [selectedOrderForNote, setSelectedOrderForNote] = useState<Order | null>(null);
  const [driverNoteInput, setDriverNoteInput] = useState('');
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Client injoignable après 3 appels');
  const [newFavPhone, setNewFavPhone] = useState('');
  const [newFavName, setNewFavName] = useState('');

  // Filtering orders: ONLY SHOW ORDERS THAT HAVE BEEN EXPLICITLY ASSIGNED TO THIS DRIVER BY ADMIN
  const currentDriverId = user?.id || '00000000-0000-0000-0000-000000000004';
  const activeOrders = orders.filter(
    (o) =>
      (o.status === 'ready' || o.status === 'out_for_delivery') &&
      (o.delivery_user_id === currentDriverId || o.assigned_driver_name?.toLowerCase().includes('sofiane'))
  );

  const deliveredOrders = orders.filter(
    (o) =>
      o.status === 'delivered' &&
      (o.delivery_user_id === currentDriverId || o.assigned_driver_name?.toLowerCase().includes('sofiane') || !o.delivery_user_id)
  );

  // Calculate Cash held by driver that hasn't been settled with admin yet
  const unSettledCashOrders = deliveredOrders.filter(
    (o) => (o.payment_method === 'cod' || o.payment_method === 'cash') && !o.admin_cash_settled
  );
  const totalCashInHand = unSettledCashOrders.reduce((sum, o) => sum + o.total, 0);

  // Total delivered today
  const totalDeliveredTodayCount = deliveredOrders.length;
  const totalOnlinePaid = deliveredOrders
    .filter((o) => o.payment_method === 'baridimob' || o.payment_method === 'card')
    .reduce((sum, o) => sum + o.total, 0);

  // Filtered history
  const filteredHistory = deliveredOrders.filter((o) => {
    if (!searchHistory.trim()) return true;
    const query = searchHistory.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(query) ||
      o.customer_name.toLowerCase().includes(query) ||
      o.customer_phone.includes(query) ||
      o.delivery_address.toLowerCase().includes(query)
    );
  });

  const handleConfirmDelivery = (order: Order) => {
    updateOrderStatus(order.id, 'delivered', undefined, driverNoteInput || 'Livré en main propre');
    setSelectedOrderForNote(null);
    setDriverNoteInput('');
  };

  const handleCancelOrder = () => {
    if (cancelModalOrder) {
      cancelOrderByDriver(cancelModalOrder.id, cancelReason);
      setCancelModalOrder(null);
    }
  };

  const openWhatsApp = (phone: string, customerName: string, orderNumber: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '213' + cleanPhone.substring(1) : cleanPhone;
    const message = encodeURIComponent(
      `Salam ${customerName} ! C'est Sofiane, votre livreur The Engineer Burger 🍔. Je suis en route avec votre commande #${orderNumber}. Je serai là dans quelques minutes !`
    );
    window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="delivery-portal min-vh-100 pb-5" style={{ background: '#faf6f0', color: '#1c1917' }}>
      {/* 1. TOP RIDER APPLICATION HEADER (WARM GOLDEN / CRISP WHITE THEME) */}
      <header className="sticky-top bg-white border-bottom shadow-sm" style={{ borderColor: '#fef3c7', zIndex: 1020 }}>
        <div className="container-fluid px-3 px-lg-4 py-2">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            {/* Rider Identity */}
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                }}
              >
                🛵
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h1 className="fs-5 fw-extrabold mb-0 text-dark">Sofiane Livreur Express</h1>
                  <span className="badge bg-warning text-dark fw-bold rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>
                    TMAX Ouargla
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-muted mt-1">
                  <span className="text-warning fw-bold">⭐ 4.9 (128 courses)</span>
                  <span>·</span>
                  {/* Status Dropdown */}
                  <select
                    className="form-select form-select-sm py-0 px-2 bg-light text-dark border-warning rounded-pill fw-bold"
                    style={{ width: 'auto', fontSize: '11px', height: '26px' }}
                    value={riderStatus}
                    onChange={(e: any) => setRiderStatus(e.target.value)}
                  >
                    <option value="online">🟢 En Service (En Ligne)</option>
                    <option value="busy">🟡 En Pause</option>
                    <option value="offline">🔴 Hors Ligne</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick KPIs Summary Bar */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="px-3 py-1 rounded-3 bg-white border border-warning text-center shadow-sm">
                <small className="text-muted d-block fw-bold" style={{ fontSize: '10px' }}>COURSES EN COURS</small>
                <b className="text-primary fs-6">{activeOrders.length}</b>
              </div>

              <div className="px-3 py-1 rounded-3 bg-white border border-success text-center shadow-sm">
                <small className="text-muted d-block fw-bold" style={{ fontSize: '10px' }}>LIVRÉES AUJ.</small>
                <b className="text-success fs-6">{totalDeliveredTodayCount}</b>
              </div>

              <div className="px-3 py-1 rounded-3 bg-warning bg-opacity-20 border border-warning text-center shadow-sm">
                <small className="text-dark d-block fw-bold" style={{ fontSize: '10px' }}>CASH EN MAIN (À REMETTRE)</small>
                <b className="text-dark fs-6">{totalCashInHand} {currency}</b>
              </div>

              {/* Language Switcher */}
              <div className="btn-group btn-group-sm">
                <button
                  className={`btn btn-sm ${language === 'fr' ? 'btn-dark fw-bold' : 'btn-outline-dark'}`}
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
                className="btn btn-sm btn-outline-warning text-dark rounded-pill px-3 fw-bold"
                onClick={() => window.location.reload()}
                title="Actualiser la liste des commandes"
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Actualiser
              </button>
            </div>
          </div>

          {/* 2. SUB NAVIGATION TABS */}
          <div className="d-flex gap-2 mt-3 pt-2 border-top overflow-auto" style={{ borderColor: '#fef3c7' }}>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 ${
                activeTab === 'active'
                  ? 'btn-warning text-dark shadow fw-extrabold'
                  : 'btn-outline-secondary bg-white text-dark'
              }`}
              onClick={() => setActiveTab('active')}
            >
              <i className="bi bi-scooter"></i>
              <span>Courses en Cours</span>
              {activeOrders.length > 0 && (
                <span className="badge bg-danger text-white ms-1">{activeOrders.length}</span>
              )}
            </button>

            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 ${
                activeTab === 'history'
                  ? 'btn-warning text-dark shadow fw-extrabold'
                  : 'btn-outline-secondary bg-white text-dark'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <i className="bi bi-clock-history"></i>
              <span>Historique ({deliveredOrders.length})</span>
            </button>

            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 ${
                activeTab === 'cash'
                  ? 'btn-warning text-dark shadow fw-extrabold'
                  : 'btn-outline-secondary bg-white text-dark'
              }`}
              onClick={() => setActiveTab('cash')}
            >
              <i className="bi bi-cash-coin"></i>
              <span>Ma Caisse & Remise ({totalCashInHand} {currency})</span>
            </button>

            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 ${
                activeTab === 'customers'
                  ? 'btn-warning text-dark shadow fw-extrabold'
                  : 'btn-outline-secondary bg-white text-dark'
              }`}
              onClick={() => setActiveTab('customers')}
            >
              <i className="bi bi-star-fill text-warning"></i>
              <span>Clients VIP & Avis</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN PORTAL BODY */}
      <main className="container-fluid px-3 px-lg-4 py-4">
        {/* ========================================================================= */}
        {/* TAB 1: ACTIVE COURSES */}
        {/* ========================================================================= */}
        {activeTab === 'active' && (
          <div className="tab-active">
            {/* Header info */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="fs-5 fw-extrabold text-dark mb-0">
                  📦 Courses Assignées à Livrer ({activeOrders.length})
                </h2>
                <small className="text-muted">
                  Les commandes prêtes en cuisine et attribuées par l'administration du restaurant
                </small>
              </div>
            </div>

            {activeOrders.length > 0 ? (
              <div className="row g-4">
                {activeOrders.map((order) => {
                  const isCash = order.payment_method === 'cod' || order.payment_method === 'cash';
                  const isPrefClient = driverPreferredCustomers.includes(order.customer_phone);

                  return (
                    <div key={order.id} className="col-lg-6">
                      <div className="card p-4 rounded-4 shadow-sm bg-white border border-warning h-100 d-flex flex-column justify-content-between">
                        <div>
                          {/* Order Card Top Bar */}
                          <div className="d-flex justify-content-between align-items-start pb-3 border-bottom mb-3">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="badge bg-dark fs-6 px-3 py-2">
                                  #{order.order_number}
                                </span>
                                <span
                                  className={`badge ${
                                    order.status === 'out_for_delivery'
                                      ? 'bg-warning text-dark'
                                      : 'bg-primary text-white'
                                  } rounded-pill px-3 py-1`}
                                >
                                  {order.status === 'out_for_delivery'
                                    ? '🛵 EN ROUTE'
                                    : '📦 PRÊT AU RESTAURANT'}
                                </span>
                              </div>
                              <small className="text-muted">
                                Commandé il y a{' '}
                                <b>
                                  {Math.max(
                                    1,
                                    Math.round(
                                      (Date.now() - new Date(order.created_at).getTime()) / 60000
                                    )
                                  )}{' '}
                                  min
                                </b>
                              </small>
                            </div>

                            <div className="text-end">
                              <span
                                className={`badge ${
                                  isCash ? 'bg-warning text-dark' : 'bg-success text-white'
                                } px-3 py-2 fs-6`}
                              >
                                {isCash ? '💵 CASH À ENCAISSER' : '📱 PAIEMENT EN LIGNE VALIDÉ'}
                              </span>
                              <b className="d-block fs-4 text-dark mt-1">
                                {order.total} {currency}
                              </b>
                            </div>
                          </div>

                          {/* Customer & Destination */}
                          <div className="p-3 bg-light rounded-3 mb-3 border">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <div className="d-flex align-items-center gap-2">
                                  <b className="fs-6 text-dark">{order.customer_name}</b>
                                  {isPrefClient && (
                                    <span className="badge bg-warning text-dark rounded-pill" style={{ fontSize: '10px' }}>
                                      ⭐ VIP Habitué
                                    </span>
                                  )}
                                </div>
                                <span className="text-muted small">📞 {order.customer_phone}</span>
                              </div>

                              <button
                                className={`btn btn-sm rounded-pill px-2 py-1 ${
                                  isPrefClient ? 'btn-warning text-dark' : 'btn-outline-secondary'
                                }`}
                                style={{ fontSize: '11px' }}
                                onClick={() => toggleDriverPreferredCustomer(order.customer_phone)}
                                title="Marquer ce client comme client préféré"
                              >
                                <i className="bi bi-star-fill me-1"></i>
                                {isPrefClient ? 'Client VIP' : '+ Ajouter VIP'}
                              </button>
                            </div>

                            <div className="d-flex align-items-start gap-2 pt-2 border-top">
                              <span className="text-danger fs-5">📍</span>
                              <div>
                                <strong className="d-block text-dark small">{order.delivery_address}</strong>
                                <small className="text-muted">Ouargla · Distance estimée : 2.8 km</small>
                              </div>
                            </div>
                          </div>

                          {/* Action Contact & GPS Buttons */}
                          <div className="d-flex gap-2 mb-3">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                order.delivery_address + ', Ouargla, Algeria'
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-dark btn-sm flex-fill rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-1"
                            >
                              <i className="bi bi-map-fill text-danger"></i>
                              <span>Google Maps</span>
                            </a>

                            <a
                              href={`https://waze.com/ul?q=${encodeURIComponent(
                                order.delivery_address + ', Ouargla'
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-info text-dark btn-sm flex-fill rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-1"
                            >
                              <i className="bi bi-compass-fill text-info"></i>
                              <span>Waze GPS</span>
                            </a>

                            <a
                              href={`tel:${order.customer_phone}`}
                              className="btn btn-outline-primary btn-sm flex-fill rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-1"
                            >
                              <i className="bi bi-telephone-fill"></i>
                              <span>Appeler</span>
                            </a>

                            <button
                              className="btn btn-success btn-sm flex-fill rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-1"
                              onClick={() =>
                                openWhatsApp(order.customer_phone, order.customer_name, order.order_number)
                              }
                            >
                              <i className="bi bi-whatsapp"></i>
                              <span>WhatsApp</span>
                            </button>
                          </div>

                          {/* Items in the Bag */}
                          <div className="p-3 bg-light rounded-3 mb-3 border">
                            <small className="text-muted fw-bold d-block mb-2">
                              🍔 ARTICLES DANS LE SAC ISOTHERME :
                            </small>
                            {order.items?.map((it, idx) => (
                              <div key={idx} className="d-flex justify-content-between py-1 border-bottom border-white small">
                                <div>
                                  <b className="text-dark">{it.quantity}x</b> {it.item_name}
                                  {it.instructions && (
                                    <small className="text-danger d-block fst-italic">Note: {it.instructions}</small>
                                  )}
                                </div>
                                <span className="text-muted">{it.item_price * it.quantity} {currency}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Actions */}
                        <div className="pt-3 border-top d-flex gap-2 flex-wrap">
                          {order.status === 'ready' ? (
                            <button
                              className="btn btn-primary flex-fill py-3 fw-bold rounded-pill shadow d-flex align-items-center justify-content-center gap-2"
                              onClick={() =>
                                updateOrderStatus(
                                  order.id,
                                  'out_for_delivery',
                                  currentDriverId,
                                  'En route vers le client'
                                )
                              }
                            >
                              <i className="bi bi-box-arrow-up-right fs-5"></i>
                              <span>Prendre le Sac & Démarrer la Course</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-success flex-fill py-3 fw-bold rounded-pill shadow d-flex align-items-center justify-content-center gap-2"
                              onClick={() => setSelectedOrderForNote(order)}
                            >
                              <i className="bi bi-check2-circle fs-4"></i>
                              <span>
                                {isCash
                                  ? `Encaisser ${order.total} ${currency} & Valider la Livraison`
                                  : 'Valider la Livraison (Payé en Ligne)'}
                              </span>
                            </button>
                          )}

                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2"
                            onClick={() => setCancelModalOrder(order)}
                            title="Signaler un problème / Annuler"
                          >
                            <i className="bi bi-exclamation-triangle"></i> Problème
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card p-5 text-center bg-white rounded-4 border border-warning shadow-sm my-4">
                <span className="fs-1 d-block mb-3">🍔🛵</span>
                <h3 className="fs-5 fw-bold text-dark">Aucune course active assignée pour le moment</h3>
                <p className="text-muted small mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
                  Vous êtes en ligne et disponible. Dès que l'administrateur du restaurant vous assigne une commande prête, elle apparaîtra automatiquement ici !
                </p>
                <div>
                  <button className="btn btn-warning text-dark fw-bold rounded-pill px-4" onClick={() => window.location.reload()}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Actualiser la file
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="tab-history">
            <div className="card p-4 rounded-4 shadow-sm bg-white border mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <h2 className="fs-5 fw-bold text-dark mb-1">📜 Historique de Vos Livraisons ({deliveredOrders.length})</h2>
                  <small className="text-muted">Toutes vos courses livrées avec succès</small>
                </div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ maxWidth: '300px' }}
                  placeholder="Rechercher une course..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3">
              {filteredHistory.map((o) => {
                const isCash = o.payment_method === 'cod' || o.payment_method === 'cash';
                return (
                  <div key={o.id} className="col-md-6 col-lg-4">
                    <div className="card p-3 rounded-4 shadow-sm bg-white border h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <strong className="text-primary">#{o.order_number}</strong>
                        <span className="badge bg-success">✅ LIVRÉ</span>
                      </div>

                      <div className="mb-2">
                        <b className="d-block text-dark small">{o.customer_name}</b>
                        <small className="text-muted d-block">📞 {o.customer_phone || 'Non renseigné'}</small>
                        <small className="text-muted d-block">📍 {o.delivery_address}</small>
                      </div>

                      <div className="p-2 bg-light rounded-3 mb-2 small">
                        {o.items?.map((it, i) => (
                          <span key={i} className="d-inline-block text-muted me-2">
                            {it.quantity}x {it.item_name}
                          </span>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
                        <b className="text-dark">{o.total} {currency}</b>
                        {isCash ? (
                          o.admin_cash_settled ? (
                            <span className="badge bg-success small">✅ Remis à l'admin</span>
                          ) : (
                            <span className="badge bg-warning text-dark small">⏳ En attente remise</span>
                          )
                        ) : (
                          <span className="badge bg-info text-dark small">Payé en ligne</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CASH & SETTLEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'cash' && (
          <div className="tab-cash">
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card p-4 rounded-4 shadow-sm bg-warning bg-opacity-20 border border-warning h-100">
                  <span className="text-dark small fw-bold">TOTAL ESPÈCES EN MAIN (CASH ON DELIVERY)</span>
                  <h3 className="display-5 fw-extrabold text-dark mt-2 mb-1">{totalCashInHand} {currency}</h3>
                  <p className="text-muted small mb-0">
                    Montant total collecté auprès des clients à remettre à l'administration du restaurant en fin de tournée.
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card p-4 rounded-4 shadow-sm bg-success bg-opacity-10 border border-success h-100">
                  <span className="text-success small fw-bold">PAIEMENTS EN LIGNE (BARIDIMOB / CARTE)</span>
                  <h3 className="display-5 fw-extrabold text-success mt-2 mb-1">{totalOnlinePaid} {currency}</h3>
                  <p className="text-muted small mb-0">
                    Déjà encaissés sur le compte du restaurant (pas d'espèces à remettre pour ces courses).
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 rounded-4 shadow-sm bg-white border">
              <h3 className="fs-6 fw-bold text-dark mb-3">Détail des Courses en Attente de Remise ({unSettledCashOrders.length})</h3>
              {unSettledCashOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>N° COMMANDE</th>
                        <th>CLIENT</th>
                        <th>MONTANT ENCAISSÉ</th>
                        <th>MODE</th>
                        <th>STATUT REMISE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unSettledCashOrders.map((o) => (
                        <tr key={o.id}>
                          <td><strong className="text-primary">#{o.order_number}</strong></td>
                          <td>{o.customer_name} ({o.customer_phone})</td>
                          <td><b className="text-dark">{o.total} {currency}</b></td>
                          <td><span className="badge bg-warning text-dark">💵 ESPÈCES</span></td>
                          <td><span className="badge bg-danger">⏳ À remettre au gérant</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-success bg-light rounded-3">
                  <i className="bi bi-check-circle-fill fs-3 d-block mb-1"></i>
                  Toutes vos remises d'espèces sont à jour avec l'administration !
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: VIP CUSTOMERS & REVIEWS */}
        {/* ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="tab-customers">
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="card p-4 rounded-4 shadow-sm bg-white border">
                  <h3 className="fs-6 fw-bold text-dark mb-3">⭐ Vos Statistiques & Avis</h3>
                  <div className="text-center p-3 bg-light rounded-3 mb-3">
                    <span className="display-4 fw-extrabold text-warning">4.9</span>
                    <div className="text-warning small mb-1">⭐⭐⭐⭐⭐</div>
                    <small className="text-muted">Basé sur 128 évaluations clients</small>
                  </div>
                  <div className="d-flex flex-column gap-2 small">
                    <div className="d-flex justify-content-between p-2 bg-light rounded">
                      <span>⚡ Ponctualité :</span>
                      <b className="text-success">99.2%</b>
                    </div>
                    <div className="d-flex justify-content-between p-2 bg-light rounded">
                      <span>🍔 Burger Chaud & Intact :</span>
                      <b className="text-success">100%</b>
                    </div>
                    <div className="d-flex justify-content-between p-2 bg-light rounded">
                      <span>🤝 Amabilité :</span>
                      <b className="text-success">5.0 / 5.0</b>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="card p-4 rounded-4 shadow-sm bg-white border">
                  <h3 className="fs-6 fw-bold text-dark mb-3">❤️ Carnet de Vos Clients Préférés & VIP</h3>
                  <p className="text-muted small mb-3">
                    Enregistrez les numéros de vos clients habitués pour les reconnaître instantanément.
                  </p>

                  <div className="d-flex flex-column gap-2">
                    {driverPreferredCustomers.map((phone, idx) => (
                      <div key={idx} className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-4">⭐</span>
                          <div>
                            <b className="d-block text-dark small">Client VIP Ouargla</b>
                            <small className="text-muted">{phone}</small>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <a href={`tel:${phone}`} className="btn btn-sm btn-outline-primary rounded-pill">
                            <i className="bi bi-telephone"></i>
                          </a>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            onClick={() => toggleDriverPreferredCustomer(phone)}
                            title="Retirer"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELIVERY & NOTE */}
      {/* ========================================================================= */}
      {selectedOrderForNote && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  ✅ Confirmer la Livraison - #{selectedOrderForNote.order_number}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrderForNote(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded-3 mb-3 text-center">
                  <small className="text-muted d-block">MONTANT TOTAL ENCAISSÉ :</small>
                  <b className="fs-3 text-success">{selectedOrderForNote.total} {currency}</b>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Note de livraison (Facultatif) :</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Livré en main propre, client très satisfait..."
                    value={driverNoteInput}
                    onChange={(e) => setDriverNoteInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => setSelectedOrderForNote(null)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-success fw-bold px-4 rounded-pill"
                  onClick={() => handleConfirmDelivery(selectedOrderForNote)}
                >
                  Valider la Livraison ✅
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT PROBLEM / CANCEL ORDER */}
      {/* ========================================================================= */}
      {cancelModalOrder && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-danger">
                  ⚠️ Signaler un Problème - #{cancelModalOrder.order_number}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCancelModalOrder(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <label className="form-label small fw-bold">Motif du problème :</label>
                <select
                  className="form-select mb-3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Client injoignable après 3 appels">Client injoignable après 3 appels</option>
                  <option value="Adresse introuvable / Erronée">Adresse introuvable / Erronée</option>
                  <option value="Client a refusé la commande">Client a refusé la commande</option>
                  <option value="Panne de véhicule / Moto">Panne de véhicule / Moto</option>
                  <option value="Autre motif">Autre motif</option>
                </select>
              </div>
              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => setCancelModalOrder(null)}
                >
                  Retour
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold px-4 rounded-pill"
                  onClick={handleCancelOrder}
                >
                  Confirmer l'Alerte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
