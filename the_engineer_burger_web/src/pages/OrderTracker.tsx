import React from 'react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface OrderTrackerProps {
  order: Order | null;
  setCurrentPage: (page: string) => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, setCurrentPage }) => {
  const { currency, orders } = useCart();
  const { isRTL } = useLanguage();
  const currentOrder = orders.find((o) => o.id === order?.id) || order || orders[0];

  if (!currentOrder) {
    return (
      <div className="container py-5 text-center my-5">
        <h3>Aucune commande sélectionnée</h3>
        <button className="btn btn-primary mt-3" onClick={() => setCurrentPage('orders')}>
          Voir mes commandes
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: isRTL ? 'استلمت' : 'Reçue', icon: 'bi-receipt' },
    { key: 'confirmed', label: isRTL ? 'مؤكدة' : 'Confirmée', icon: 'bi-check2-circle' },
    { key: 'preparing', label: isRTL ? 'في المطبخ' : 'Cuisine (Grill)', icon: 'bi-fire' },
    { key: 'out_for_delivery', label: isRTL ? 'قيد التوصيل' : 'En Livraison', icon: 'bi-scooter' },
    { key: 'delivered', label: isRTL ? 'تم التوصيل' : 'Livrée', icon: 'bi-house-check-fill' }
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentIndex = getStepIndex(currentOrder.status);

  return (
    <div className="tracking-page py-4 py-md-5 bg-light min-vh-100">
      <div className="container">
        {/* Header with Back button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button
              className="btn btn-sm btn-link text-muted p-0 text-decoration-none mb-2"
              onClick={() => setCurrentPage('orders')}
            >
              <i className="bi bi-arrow-left me-1"></i> {isRTL ? 'الرجوع لطلباتي' : 'Mes Commandes'}
            </button>
            <h1 className="fs-4 fw-extrabold mb-1">
              {isRTL ? `تتبع الطلب #${currentOrder.order_number}` : `Suivi de Commande #${currentOrder.order_number}`}
            </h1>
            <p className="text-muted small mb-0">
              <i className="bi bi-geo-alt-fill text-primary me-1"></i>
              {currentOrder.delivery_address}
            </p>
          </div>

          <div className="text-end">
            <span className="text-muted small d-block">{isRTL ? 'الوقت المتبقي' : 'Arrivée Estimée'}</span>
            <b className="fs-4 text-primary">{currentOrder.estimated_minutes} min</b>
          </div>
        </div>

        {/* Live Step Progress Bar */}
        <div className="card border-0 p-3 p-md-4 rounded-4 shadow-sm bg-white mb-4">
          <div className="d-flex justify-content-between position-relative">
            {steps.map((step, idx) => {
              const isDone = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={step.key} className="text-center flex-fill position-relative">
                  <div
                    className={`rounded-circle mx-auto d-grid place-items-center mb-2 shadow-sm ${
                      isDone ? 'bg-primary text-white' : 'bg-light text-muted'
                    }`}
                    style={{
                      width: '42px',
                      height: '42px',
                      fontSize: '17px',
                      zIndex: 2,
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    <i className={`bi ${step.icon}`}></i>
                  </div>
                  <b
                    className={`d-block ${
                      isCurrent ? 'text-primary fw-bold' : isDone ? 'text-dark' : 'text-muted'
                    }`}
                    style={{ fontSize: '11px' }}
                  >
                    {step.label}
                  </b>
                </div>
              );
            })}
          </div>
        </div>

        <div className="row g-4">
          {/* ENHANCED LIVE GPS DELIVERY MAP */}
          <div className="col-lg-7">
            <div className="card border-0 p-3 p-md-4 rounded-4 shadow-sm bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fs-6 fw-bold mb-0">
                  <i className="bi bi-geo-fill text-primary me-1"></i>
                  {isRTL ? 'خريطة التتبع المباشر (ورقلة)' : 'Trajet en Direct GPS (Ouargla)'}
                </h3>
                <span className="badge bg-success small px-2 py-1">
                  <i className="bi bi-broadcast me-1"></i> Signal GPS Actif
                </span>
              </div>

              {/* High-Contrast Interactive Visual GPS Map */}
              <div
                className="position-relative rounded-4 overflow-hidden shadow-inner"
                style={{
                  height: '340px',
                  background: '#1e293b',
                  border: '2px solid #334155'
                }}
              >
                {/* Map Grid Pattern */}
                <div
                  className="position-absolute w-100 h-100"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '35px 35px'
                  }}
                ></div>

                {/* Simulated Streets (Ouargla City Layout) */}
                <svg className="position-absolute w-100 h-100" style={{ zIndex: 1 }}>
                  {/* Road 1: Boulevard 1er Novembre */}
                  <line x1="15%" y1="30%" x2="85%" y2="70%" stroke="#475569" strokeWidth="18" strokeLinecap="round" />
                  <line x1="15%" y1="30%" x2="85%" y2="70%" stroke="#ea580c" strokeWidth="4" strokeDasharray="8 6" />

                  {/* Secondary Avenue */}
                  <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#334155" strokeWidth="10" />
                  <line x1="70%" y1="10%" x2="70%" y2="90%" stroke="#334155" strokeWidth="10" />
                </svg>

                {/* 1. Restaurant Pin (The Engineer Burger - Centre-Ville Ouargla) */}
                <div
                  className="position-absolute p-2 bg-dark text-white rounded-3 shadow d-flex align-items-center gap-2 border border-warning"
                  style={{ top: '20%', left: '10%', zIndex: 3 }}
                >
                  <span className="fs-5">🍔</span>
                  <div>
                    <strong className="d-block small text-warning">The Engineer Burger</strong>
                    <small className="text-light" style={{ fontSize: '9px' }}>Bd 1er Novembre, Ouargla</small>
                  </div>
                </div>

                {/* 2. Moving Delivery Rider on Path */}
                <div
                  className="position-absolute shadow-lg"
                  style={{
                    top: '46%',
                    left: '48%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 4
                  }}
                >
                  <div
                    className="p-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center animate-pulse"
                    style={{ width: '48px', height: '48px', boxShadow: '0 0 20px rgba(244,81,30,0.8)' }}
                  >
                    <i className="bi bi-scooter fs-4"></i>
                  </div>
                  <div
                    className="badge bg-warning text-dark mt-1 shadow-sm text-nowrap"
                    style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}
                  >
                    Sofiane (En route · 2.4 km)
                  </div>
                </div>

                {/* 3. Destination Pin (Customer Home - Ouargla) */}
                <div
                  className="position-absolute p-2 bg-success text-white rounded-3 shadow d-flex align-items-center gap-2 border border-light"
                  style={{ bottom: '18%', right: '10%', zIndex: 3 }}
                >
                  <span className="fs-5">📍</span>
                  <div>
                    <strong className="d-block small">Votre Adresse</strong>
                    <small className="text-light" style={{ fontSize: '9px' }}>Ouargla (Livraison)</small>
                  </div>
                </div>

                {/* Distance & Info Overlay Badge */}
                <div
                  className="position-absolute bottom-0 start-0 m-3 p-2 px-3 rounded-pill bg-dark bg-opacity-75 text-white small border border-secondary"
                  style={{ zIndex: 5, fontSize: '11px' }}
                >
                  <i className="bi bi-speedometer text-warning me-1"></i>
                  Distance restante : <strong>2.4 km</strong> · Vitesse moy : <strong>35 km/h</strong>
                </div>
              </div>

              {/* Rider Contact Card */}
              <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mt-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="customer-avatar rounded-circle">🛵</div>
                  <div>
                    <b className="d-block small">Sofiane (Livreur Dédié)</b>
                    <small className="text-muted">Moto Yamaha 125 · Ouargla Express Delivery</small>
                  </div>
                </div>
                <a href="tel:0550123456" className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold">
                  <i className="bi bi-telephone-fill me-1"></i> {isRTL ? 'اتصال' : 'Appeler'}
                </a>
              </div>
            </div>
          </div>

          {/* Order Details Breakdown */}
          <div className="col-lg-5">
            <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
              <h3 className="fs-6 fw-bold mb-3">{isRTL ? 'تفاصيل الوجبات' : 'Détail de la Commande'}</h3>

              <div className="mb-3">
                {currentOrder.items?.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-2 border-bottom small">
                    <div>
                      <span className="fw-bold">{item.quantity}x</span> {item.item_name}
                      {item.instructions && (
                        <small className="text-muted d-block fst-italic">Note: {item.instructions}</small>
                      )}
                    </div>
                    <b>{item.item_price * item.quantity} {currency}</b>
                  </div>
                ))}
              </div>

              <div className="border-top pt-2 small text-muted">
                <div className="d-flex justify-content-between mb-1">
                  <span>{isRTL ? 'المجموع الفرعي' : 'Sous-total'}</span>
                  <b className="text-dark">{currentOrder.subtotal} {currency}</b>
                </div>
                {currentOrder.discount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-success">
                    <span>{isRTL ? 'الخصم' : 'Réduction'}</span>
                    <b>-{currentOrder.discount} {currency}</b>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-1">
                  <span>{isRTL ? 'التوصيل' : 'Livraison'}</span>
                  <b className="text-dark">{currentOrder.delivery_fee} {currency}</b>
                </div>
                <div className="d-flex justify-content-between fs-6 fw-bold text-dark pt-2 border-top mt-2">
                  <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-primary">{currentOrder.total} {currency}</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-light rounded text-center small text-muted">
                Mode de paiement : <strong>{currentOrder.payment_method.toUpperCase()}</strong> ({currentOrder.payment_status})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
