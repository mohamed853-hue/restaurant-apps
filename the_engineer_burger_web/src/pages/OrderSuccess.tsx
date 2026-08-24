import React from 'react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';

interface OrderSuccessProps {
  order: Order | null;
  setCurrentPage: (page: string) => void;
  setSelectedOrder: (order: Order) => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
  order,
  setCurrentPage,
  setSelectedOrder
}) => {
  const { currency } = useCart();

  if (!order) {
    return (
      <div className="container py-5 text-center my-5">
        <h2>Aucune commande active</h2>
        <button className="btn btn-primary mt-3" onClick={() => setCurrentPage('home')}>
          Retour à l'Accueil
        </button>
      </div>
    );
  }

  return (
    <div className="success-section py-5 text-center">
      <div className="container">
        <div className="card max-w-600 mx-auto p-4 p-md-5 rounded-4 border-0 shadow-lg bg-white" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="success-check mb-4">
            <span></span>
            <span></span>
            <i className="bi bi-check-lg"></i>
          </div>

          <span className="badge bg-success px-3 py-2 text-uppercase mb-2">Commande Enregistrée !</span>
          <h1 className="display-6 fw-extrabold mb-2">Merci pour votre confiance !</h1>
          <p className="text-muted mb-4">
            Nos chefs préparent déjà vos smash burgers. Vous recevrez une notification dès que le livreur sera en route.
          </p>

          <div className="success-order d-flex justify-content-between p-3 bg-light rounded-4 mb-4 text-center">
            <div className="flex-fill border-end">
              <small className="text-muted d-block">N° de Commande</small>
              <b className="fs-6 text-primary">#{order.order_number}</b>
            </div>
            <div className="flex-fill border-end">
              <small className="text-muted d-block">Temps Estimé</small>
              <b className="fs-6">{order.estimated_minutes} minutes</b>
            </div>
            <div className="flex-fill">
              <small className="text-muted d-block">Total Payé/Dû</small>
              <b className="fs-6 text-success">{order.total} {currency}</b>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <button
              className="btn btn-primary-custom px-4 py-3 fw-bold"
              onClick={() => {
                setSelectedOrder(order);
                setCurrentPage('track');
              }}
            >
              <i className="bi bi-geo-alt-fill me-2"></i> Suivre la Commande en Direct
            </button>
            <button
              className="btn btn-outline-dark rounded-pill px-4 py-3 fw-bold"
              onClick={() => setCurrentPage('home')}
            >
              Retour à l'Accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
