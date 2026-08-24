import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface CustomerDashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedOrder: (order: Order) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  setCurrentPage,
  setSelectedOrder
}) => {
  const { user, addresses, addAddress, deleteAddress } = useAuth();
  const { orders, currency } = useCart();

  const [newLabel, setNewLabel] = useState('Maison');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCity, setNewCity] = useState('Alger');
  const [showAddAddress, setShowAddAddress] = useState(false);

  const userOrders = orders.filter((o) => !o.user_id || o.user_id === user?.id);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine.trim()) return;
    await addAddress({
      label: newLabel,
      address_line: newAddressLine,
      city: newCity,
      pincode: '16000',
      is_default: addresses.length === 0
    });
    setNewAddressLine('');
    setShowAddAddress(false);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning text-dark">En attente</span>;
      case 'confirmed':
        return <span className="badge bg-info text-dark">Confirmée</span>;
      case 'preparing':
        return <span className="badge bg-primary">En préparation 👨‍🍳</span>;
      case 'out_for_delivery':
        return <span className="badge bg-primary">En livraison 🛵</span>;
      case 'delivered':
        return <span className="badge bg-success">Livrée ✅</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Annulée ❌</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="customer-dashboard-page py-5 bg-light">
      <div className="container">
        {/* Header Profile Card */}
        <div className="card border-0 p-4 rounded-4 shadow-sm bg-white mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="customer-avatar rounded-4 shadow-sm text-white"
                style={{
                  width: '65px',
                  height: '65px',
                  fontSize: '26px',
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="fs-4 fw-extrabold mb-1">{user?.name}</h1>
                <div className="text-muted small">
                  <i className="bi bi-envelope me-1"></i> {user?.email} ·{' '}
                  <i className="bi bi-telephone ms-2 me-1"></i> {user?.phone || '0550123456'}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-dark btn-sm rounded-pill px-3"
                onClick={() => setCurrentPage('favorites')}
              >
                <i className="bi bi-heart-fill text-danger me-1"></i> Mes Favoris
              </button>
              <button
                className="btn btn-primary btn-sm rounded-pill px-3"
                onClick={() => setCurrentPage('menu')}
              >
                <i className="bi bi-plus-lg me-1"></i> Commander
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Orders History Column */}
          <div className="col-lg-8">
            <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
              <h2 className="fs-5 fw-bold mb-3">Historique des Commandes ({userOrders.length})</h2>

              {userOrders.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {userOrders.map((ord) => (
                    <div key={ord.id} className="card p-3 rounded-3 border">
                      <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                        <div>
                          <b className="text-primary">#{ord.order_number}</b>
                          <small className="text-muted ms-2">
                            {new Date(ord.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                        {getStatusBadge(ord.status)}
                      </div>

                      <div className="py-1">
                        {ord.items?.map((item, i) => (
                          <span key={i} className="small text-muted me-3">
                            {item.quantity}x {item.item_name}
                          </span>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                        <span className="fw-bold fs-6">{ord.total} {currency}</span>
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          onClick={() => {
                            setSelectedOrder(ord);
                            setCurrentPage('track');
                          }}
                        >
                          <i className="bi bi-geo-alt me-1"></i> Suivre / Détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <p>Vous n'avez pas encore passé de commande.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setCurrentPage('menu')}>
                    Découvrir le Menu
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Saved Addresses Column */}
          <div className="col-lg-4">
            <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fs-5 fw-bold mb-0">Adresses Enregistrées</h3>
                <button
                  className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-bold"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                >
                  {showAddAddress ? 'Fermer' : '+ Ajouter'}
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleSaveAddress} className="card p-3 rounded-3 bg-light border mb-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold">Nom (Maison, Travail...)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-bold">Adresse</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Rue, N° bât, étage..."
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Ville / Commune</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-dark btn-sm w-100 rounded-pill">
                    Enregistrer l'adresse
                  </button>
                </form>
              )}

              <div className="d-flex flex-column gap-2">
                {addresses.map((a) => (
                  <div key={a.id} className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-start">
                    <div>
                      <b className="d-block small">📍 {a.label}</b>
                      <small className="text-muted d-block">{a.address_line}, {a.city}</small>
                    </div>
                    <button
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => deleteAddress(a.id)}
                      title="Supprimer"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
