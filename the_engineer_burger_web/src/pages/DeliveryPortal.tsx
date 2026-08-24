import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface DeliveryPortalProps {
  setCurrentPage: (page: string) => void;
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const { orders, currency, updateOrderStatus } = useCart();
  const { isRTL } = useLanguage();

  const deliveryOrders = orders.filter(
    (o) => o.status === 'ready' || o.status === 'out_for_delivery'
  );
  const deliveredToday = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="delivery-portal min-vh-100 pb-5" style={{ background: '#0f172a', color: '#fff' }}>
      {/* Top Rider Header */}
      <div className="py-3 px-4 d-flex justify-content-between align-items-center border-bottom border-secondary" style={{ background: '#1e293b' }}>
        <div className="d-flex align-items-center gap-3">
          <span className="fs-2">🛵</span>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="fs-5 fw-extrabold text-info mb-0">
                {isRTL ? 'تطبيق رجل التوصيل (Sofiane)' : 'Espace Livreur (Sofiane Express)'}
              </h1>
              <span className="badge bg-success px-2 py-1">En Ligne (Ouargla)</span>
            </div>
            <small className="text-secondary">
              {isRTL ? 'الطلبات الجاهزة للتوصيل :' : 'Courses à livrer :'} <strong>{deliveryOrders.length}</strong> · {isRTL ? 'المكتملة اليوم :' : 'Livrées aujourd\'hui :'} <strong>{deliveredToday.length}</strong>
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

      <div className="container py-4">
        {deliveryOrders.length > 0 ? (
          <div className="row g-4">
            {deliveryOrders.map((o) => {
              const isOnTheWay = o.status === 'out_for_delivery';
              return (
                <div key={o.id} className="col-md-6 col-lg-4">
                  <div
                    className="card rounded-4 shadow-lg h-100 overflow-hidden text-white"
                    style={{
                      background: '#1e293b',
                      border: isOnTheWay ? '2px solid #38bdf8' : '1px solid #334155'
                    }}
                  >
                    {/* Card Header */}
                    <div
                      className="p-3 d-flex justify-content-between align-items-center"
                      style={{ background: isOnTheWay ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#334155' }}
                    >
                      <div>
                        <b className="fs-5 text-white">#{o.order_number}</b>
                        <span className="badge bg-dark ms-2 text-warning">{o.payment_method.toUpperCase()}</span>
                      </div>
                      <b className="fs-5 text-white">{o.total} {currency}</b>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="p-3 flex-grow-1">
                      <div className="mb-3">
                        <small className="text-secondary d-block">{isRTL ? 'اسم الزبون :' : 'Client :'}</small>
                        <strong className="fs-6 text-white">{o.customer_name}</strong>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary d-block">{isRTL ? 'عنوان التوصيل :' : 'Adresse de livraison :'}</small>
                        <div className="p-2 rounded bg-dark border border-secondary small text-warning fw-bold">
                          📍 {o.delivery_address}
                        </div>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary d-block">{isRTL ? 'رقم الهاتف :' : 'Téléphone :'}</small>
                        <div className="d-flex gap-2 mt-1">
                          <a
                            href={`tel:${o.customer_phone}`}
                            className="btn btn-sm btn-success flex-fill fw-bold rounded-pill"
                          >
                            <i className="bi bi-telephone-fill me-1"></i> {o.customer_phone}
                          </a>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(o.delivery_address)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-info flex-fill rounded-pill"
                          >
                            <i className="bi bi-geo-alt-fill me-1"></i> GPS Itinéraire
                          </a>
                        </div>
                      </div>

                      {/* Items mini list */}
                      <div className="border-top border-secondary pt-2 small text-secondary">
                        {o.items?.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between">
                            <span>{item.quantity}x {item.item_name}</span>
                            <span>{item.item_price * item.quantity} {currency}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-3 bg-dark border-top border-secondary">
                      {isOnTheWay ? (
                        <button
                          className="btn btn-success w-100 py-3 fs-6 fw-extrabold shadow"
                          onClick={() => updateOrderStatus(o.id, 'delivered')}
                        >
                          <i className="bi bi-cash-stack me-2"></i>
                          {isRTL ? 'تم التسليم واستلام المبلغ ✅' : 'Commande Livrée (Encaissé) ✅'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary w-100 py-3 fs-6 fw-extrabold shadow"
                          onClick={() => updateOrderStatus(o.id, 'out_for_delivery')}
                        >
                          <i className="bi bi-scooter me-2"></i>
                          {isRTL ? 'بدء التوصيل والتوجه للزبون 🛵' : 'Démarrer la Course 🛵'}
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
            <span className="fs-1 text-muted">🛵🏁</span>
            <h2 className="fw-bold mt-3 text-info">
              {isRTL ? 'لا توجد طلبات تنتظر التوصيل حالياً' : 'Aucune course en attente pour le moment'}
            </h2>
            <p className="text-secondary">Dès que la cuisine marque un burger prêt, il apparaîtra ici instantanément.</p>
          </div>
        )}
      </div>
    </div>
  );
};
