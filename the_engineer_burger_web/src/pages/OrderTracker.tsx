import React from 'react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';

interface OrderTrackerProps {
  order: Order | null;
  setCurrentPage: (page: string) => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, setCurrentPage }) => {
  const { currency, orders } = useCart();
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
    { key: 'pending', label: 'Reçue', icon: 'bi-receipt' },
    { key: 'confirmed', label: 'Confirmée', icon: 'bi-check2-circle' },
    { key: 'preparing', label: 'Cuisine (Grill)', icon: 'bi-fire' },
    { key: 'out_for_delivery', label: 'En Livraison', icon: 'bi-scooter' },
    { key: 'delivered', label: 'Livrée', icon: 'bi-house-check-fill' }
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
    <div className="tracking-page py-5 bg-light">
      <div className="container">
        {/* Header with Back button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button
              className="btn btn-sm btn-link text-muted p-0 text-decoration-none mb-2"
              onClick={() => setCurrentPage('orders')}
            >
              <i className="bi bi-arrow-left me-1"></i> Mes Commandes
            </button>
            <h1 className="fs-3 fw-extrabold mb-1">
              Suivi de Commande #{currentOrder.order_number}
            </h1>
            <p className="text-muted small mb-0">Livraison vers : {currentOrder.delivery_address}</p>
          </div>

          <div className="text-end">
            <span className="text-muted small d-block">Arrivée Estimée</span>
            <b className="fs-4 text-primary">{currentOrder.estimated_minutes} min</b>
          </div>
        </div>

        {/* Live Step Progress Bar */}
        <div className="card border-0 p-4 rounded-4 shadow-sm bg-white mb-4">
          <div className="d-flex justify-content-between position-relative">
            {steps.map((step, idx) => {
              const isDone = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={step.key} className="text-center flex-fill position-relative">
                  <div
                    className={`rounded-circle mx-auto d-grid place-items-center mb-2 shadow-sm ${isDone ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                    style={{ width: '45px', height: '45px', fontSize: '18px', zIndex: 2, display: 'grid', placeItems: 'center' }}
                  >
                    <i className={`bi ${step.icon}`}></i>
                  </div>
                  <b className={`d-block small ${isCurrent ? 'text-primary fw-bold' : isDone ? 'text-dark' : 'text-muted'}`}>
                    {step.label}
                  </b>
                </div>
              );
            })}
          </div>
        </div>

        <div className="row g-4">
          {/* Map & Rider Simulation */}
          <div className="col-lg-7">
            <div className="card border-0 p-3 rounded-4 shadow-sm bg-white">
              <h3 className="fs-6 fw-bold mb-3">Trajet en Direct (Simulation GPS)</h3>

              <div
                className="fake-map position-relative rounded-4 overflow-hidden"
                style={{
                  height: '340px',
                  background: '#e5e0d8',
                  backgroundImage: 'radial-gradient(#d3cbbe 15%, transparent 16%)',
                  backgroundSize: '20px 20px'
                }}
              >
                {/* Restaurant Pin */}
                <div
                  className="position-absolute p-2 bg-dark text-white rounded-3 shadow d-flex align-items-center gap-1"
                  style={{ top: '25%', left: '15%' }}
                >
                  <span>🍔</span>
                  <small className="fw-bold">The Engineer Burger (Hydra)</small>
                </div>

                {/* Road Line */}
                <div
                  className="position-absolute"
                  style={{
                    top: '40%',
                    left: '25%',
                    width: '50%',
                    height: '4px',
                    borderTop: '4px dashed #ea580c'
                  }}
                ></div>

                {/* Delivery Rider */}
                <div
                  className="position-absolute p-2 bg-primary text-white rounded-circle shadow"
                  style={{
                    top: '35%',
                    left: '52%',
                    width: '44px',
                    height: '44px',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <i className="bi bi-scooter fs-5"></i>
                </div>

                {/* Home Destination Pin */}
                <div
                  className="position-absolute p-2 bg-success text-white rounded-3 shadow d-flex align-items-center gap-1"
                  style={{ bottom: '25%', right: '15%' }}
                >
                  <span>📍</span>
                  <small className="fw-bold">Votre Domicile</small>
                </div>
              </div>

              {/* Rider Details */}
              <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mt-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="customer-avatar rounded-circle">🛵</div>
                  <div>
                    <b className="d-block small">Sofiane (Livreur Dédié)</b>
                    <small className="text-muted">Moto Yamaha 125 · Alger Express</small>
                  </div>
                </div>
                <a href="tel:0550123456" className="btn btn-outline-dark btn-sm rounded-pill px-3">
                  <i className="bi bi-telephone-fill me-1"></i> Appeler
                </a>
              </div>
            </div>
          </div>

          {/* Order Details Breakdown */}
          <div className="col-lg-5">
            <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
              <h3 className="fs-6 fw-bold mb-3">Détail des Articles</h3>

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
                  <span>Sous-total</span>
                  <b className="text-dark">{currentOrder.subtotal} {currency}</b>
                </div>
                {currentOrder.discount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-success">
                    <span>Réduction</span>
                    <b>-{currentOrder.discount} {currency}</b>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-1">
                  <span>Livraison</span>
                  <b className="text-dark">{currentOrder.delivery_fee} {currency}</b>
                </div>
                <div className="d-flex justify-content-between fs-6 fw-bold text-dark pt-2 border-top mt-2">
                  <span>Total</span>
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
