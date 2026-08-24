import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface KitchenPortalProps {
  setCurrentPage: (page: string) => void;
}

export const KitchenPortal: React.FC<KitchenPortalProps> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useCart();
  const { isRTL } = useLanguage();

  const kitchenOrders = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'pending'
  );

  return (
    <div className="kitchen-portal min-vh-100 pb-5" style={{ background: '#120f0d', color: '#fff' }}>
      {/* Top KDS Header */}
      <div className="py-3 px-4 d-flex justify-content-between align-items-center border-bottom border-dark" style={{ background: '#1c1714' }}>
        <div className="d-flex align-items-center gap-3">
          <span className="fs-2">👨‍🍳</span>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="fs-5 fw-extrabold text-warning mb-0">
                {isRTL ? 'شاشة المطبخ والشواء (KDS)' : 'Écran Cuisine & Grill (KDS)'}
              </h1>
              <span className="badge bg-danger px-2 py-1">Chef Karim</span>
            </div>
            <small className="text-secondary">
              {isRTL ? 'الطلبات النشطة التي تنتظر التحضير :' : 'Commandes actives en attente de cuisson :'} <strong>{kitchenOrders.length}</strong>
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-light btn-sm rounded-pill px-3"
            onClick={() => setCurrentPage('home')}
          >
            <i className="bi bi-shop me-1"></i> {isRTL ? 'المتجر' : 'Boutique'}
          </button>
        </div>
      </div>

      {/* Main KDS Tickets Grid */}
      <div className="container-fluid py-4 px-4">
        {kitchenOrders.length > 0 ? (
          <div className="row g-4">
            {kitchenOrders.map((o) => {
              const isCooking = o.status === 'preparing';
              return (
                <div key={o.id} className="col-md-6 col-lg-4">
                  <div
                    className="card rounded-4 shadow-lg h-100 overflow-hidden text-white"
                    style={{
                      background: '#1c1714',
                      border: isCooking ? '2px solid #ea580c' : '1px solid #3d342d'
                    }}
                  >
                    {/* Ticket Header */}
                    <div
                      className="p-3 d-flex justify-content-between align-items-center"
                      style={{ background: isCooking ? 'linear-gradient(135deg, #ea580c, #c2410c)' : '#28211c' }}
                    >
                      <div>
                        <b className="fs-5 text-white">#{o.order_number}</b>
                        <small className="d-block text-light" style={{ fontSize: '11px' }}>
                          Client: {o.customer_name}
                        </small>
                      </div>
                      <span className="badge bg-dark fs-6 px-3 py-2">
                        ⏱️ {o.estimated_minutes} MIN
                      </span>
                    </div>

                    {/* Ticket Items List */}
                    <div className="p-3 flex-grow-1" style={{ minHeight: '160px' }}>
                      <div className="mb-2 text-warning fw-bold small text-uppercase">
                        {isRTL ? 'تفاصيل الوجبات المطلوبة :' : 'Articles à préparer :'}
                      </div>
                      {o.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="d-flex justify-content-between align-items-start py-2 border-bottom border-dark"
                        >
                          <div>
                            <span className="badge bg-warning text-dark fs-6 me-2 px-2 py-1">
                              {item.quantity}x
                            </span>
                            <strong className="fs-6">{item.item_name}</strong>
                            {item.instructions && (
                              <small className="d-block text-warning fst-italic mt-1" style={{ fontSize: '12px' }}>
                                ⚠️ Note : {item.instructions}
                              </small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ticket Action Button */}
                    <div className="p-3 bg-dark border-top border-dark">
                      {isCooking ? (
                        <button
                          className="btn btn-success w-100 py-3 fs-6 fw-extrabold shadow"
                          onClick={() => updateOrderStatus(o.id, 'ready')}
                        >
                          <i className="bi bi-check-circle-fill me-2"></i>
                          {isRTL ? 'جاهز للتسليم إلى رجل التوصيل ✅' : 'Prêt pour la Livraison ✅'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary-custom w-100 py-3 fs-6 fw-extrabold shadow"
                          onClick={() => updateOrderStatus(o.id, 'preparing')}
                        >
                          <i className="bi bi-fire me-2"></i>
                          {isRTL ? 'بدء الشواء والطهي 🔥' : 'Lancer la Cuisson (Grill) 🔥'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 my-5">
            <span className="fs-1 text-muted">👨‍🍳💤</span>
            <h2 className="fw-bold mt-3 text-warning">
              {isRTL ? 'لا توجد طلبات معلقة حالياً في المطبخ' : 'Aucune commande en attente pour le moment'}
            </h2>
            <p className="text-secondary">Toutes les commandes ont été préparées avec succès !</p>
          </div>
        )}
      </div>
    </div>
  );
};
