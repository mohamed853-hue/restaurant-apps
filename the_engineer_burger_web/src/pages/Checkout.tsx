import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Order, OrderType, PaymentMethod } from '../types';
import confetti from 'canvas-confetti';

interface CheckoutProps {
  setCurrentPage: (page: string) => void;
  setLastOrder: (order: Order) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ setCurrentPage, setLastOrder }) => {
  const { user, addresses } = useAuth();
  const { cart, subtotal, discount, deliveryFee, total, currency, placeOrder } = useCart();

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || '');
  const [customAddress, setCustomAddress] = useState(
    addresses[0] ? `${addresses[0].address_line}, ${addresses[0].city}` : 'Boulevard 1er Novembre, Centre-Ville, Ouargla'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLoading(false);
          const coords = `Ouargla (GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
          setCustomAddress(coords);
        },
        (err) => {
          setGpsLoading(false);
          console.warn('Geolocation error', err);
          setCustomAddress('Centre-Ville, Ouargla');
        }
      );
    } else {
      setCustomAddress('Centre-Ville, Ouargla');
    }
  };

  const finalDeliveryFee = orderType === 'delivery' ? deliveryFee : 0;
  const finalTotal = orderType === 'delivery' ? total : total - deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Veuillez renseigner votre nom et numéro de téléphone.');
      return;
    }

    setIsSubmitting(true);
    const orderData: Partial<Order> = {
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: orderType === 'delivery' ? customAddress : 'Retrait Restaurant (Centre-Ville Ouargla)',
      order_type: orderType,
      payment_method: paymentMethod,
      notes
    };

    const newOrder = await placeOrder(orderData);
    setIsSubmitting(false);

    if (newOrder) {
      setLastOrder(newOrder);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Ignored if confetti fails
      }
      setCurrentPage('order-success');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <h3>Votre panier est vide</h3>
        <button className="btn btn-primary mt-3" onClick={() => setCurrentPage('menu')}>
          Retour au Menu
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page py-5 bg-light">
      <div className="container">
        <h1 className="fs-3 fw-extrabold mb-4">Finaliser votre Commande</h1>

        <form onSubmit={handleSubmitOrder}>
          <div className="row g-4">
            {/* Left Column: Form Details */}
            <div className="col-lg-8">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white mb-4">
                {/* Step 1: Type de Commande */}
                <div className="step-title d-flex align-items-center gap-3 mb-3">
                  <span className="badge bg-dark rounded-circle p-2">1</span>
                  <h3 className="fs-5 fw-bold mb-0">Mode de Commande</h3>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div
                      className={`card p-3 text-center border-2 rounded-4 ${orderType === 'delivery' ? 'border-primary bg-light' : 'border'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setOrderType('delivery')}
                    >
                      <i className="bi bi-scooter fs-3 text-primary mb-2"></i>
                      <b className="d-block">Livraison à Domicile</b>
                      <small className="text-muted">Directement chez vous</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      className={`card p-3 text-center border-2 rounded-4 ${orderType === 'pickup' ? 'border-primary bg-light' : 'border'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setOrderType('pickup')}
                    >
                      <i className="bi bi-shop fs-3 text-primary mb-2"></i>
                      <b className="d-block">À Emporter / Retrait</b>
                      <small className="text-muted">Au comptoir à Ouargla</small>
                    </div>
                  </div>
                </div>

                {/* Step 2: Coordonnées & Adresse */}
                <div className="step-title d-flex align-items-center gap-3 mb-3">
                  <span className="badge bg-dark rounded-circle p-2">2</span>
                  <h3 className="fs-5 fw-bold mb-0">Coordonnées du Client</h3>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Nom Complet *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Amine Khelifi"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Numéro de Téléphone *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Ex: 0550 12 34 56"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>

                  {orderType === 'delivery' && (
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-bold mb-0">Adresse de Livraison Complète (Ouargla) *</label>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-primary small text-decoration-none fw-bold d-flex align-items-center gap-1"
                          style={{ fontSize: '11px' }}
                          onClick={handleDetectLocation}
                        >
                          <i className="bi bi-crosshair text-danger"></i>
                          <span>{gpsLoading ? 'Localisation...' : '📍 Détecter Position GPS'}</span>
                        </button>
                      </div>
                      {addresses.length > 0 && (
                        <div className="d-flex gap-2 mb-2">
                          {addresses.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              className={`btn btn-sm ${selectedAddressId === a.id ? 'btn-dark' : 'btn-outline-secondary'}`}
                              onClick={() => {
                                setSelectedAddressId(a.id);
                                setCustomAddress(`${a.address_line}, ${a.city}`);
                              }}
                            >
                              📍 {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Quartier, Bâtiment, Numéro, Repère à Ouargla..."
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  )}

                  <div className="col-12">
                    <label className="form-label small fw-bold">Notes pour la Cuisine ou le Livreur (Optionnel)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Code interphone 1420, sonner à la porte gauche..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Step 3: Mode de Paiement */}
                <div className="step-title d-flex align-items-center gap-3 mb-3">
                  <span className="badge bg-dark rounded-circle p-2">3</span>
                  <h3 className="fs-5 fw-bold mb-0">Mode de Paiement</h3>
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <div
                      className={`card p-3 text-center border-2 rounded-4 ${paymentMethod === 'cod' ? 'border-primary bg-light' : 'border'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <i className="bi bi-cash-stack fs-3 text-success mb-2"></i>
                      <b className="d-block small">Paiement à la Livraison</b>
                      <small className="text-muted" style={{ fontSize: '11px' }}>Espèces au coursier</small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      className={`card p-3 text-center border-2 rounded-4 ${paymentMethod === 'baridimob' ? 'border-primary bg-light' : 'border'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setPaymentMethod('baridimob')}
                    >
                      <i className="bi bi-phone-vibrate fs-3 text-warning mb-2"></i>
                      <b className="d-block small">BaridiMob (Algérie Poste)</b>
                      <small className="text-muted" style={{ fontSize: '11px' }}>Virement instantané</small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      className={`card p-3 text-center border-2 rounded-4 ${paymentMethod === 'card' ? 'border-primary bg-light' : 'border'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <i className="bi bi-credit-card-2-front fs-3 text-primary mb-2"></i>
                      <b className="d-block small">Carte CIB / Edahabia</b>
                      <small className="text-muted" style={{ fontSize: '11px' }}>Paiement en ligne</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div className="col-lg-4">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white sticky-top" style={{ top: '95px' }}>
                <h3 className="fs-5 fw-bold mb-3">Récapitulatif de Commande</h3>

                <div className="order-preview mb-3">
                  {cart.map(({ item, quantity }) => (
                    <div key={item.id} className="d-flex align-items-center justify-content-between py-2 border-bottom small">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-dark">{quantity}x</span>
                        <span className="text-truncate" style={{ maxWidth: '160px' }}>{item.name}</span>
                      </div>
                      <strong className="text-nowrap">{item.price * quantity} {currency}</strong>
                    </div>
                  ))}
                </div>

                <div className="bill-lines border-top border-bottom py-2 my-2 small">
                  <div className="d-flex justify-content-between mb-1 text-muted">
                    <span>Sous-total</span>
                    <b className="text-dark">{subtotal} {currency}</b>
                  </div>
                  {discount > 0 && (
                    <div className="d-flex justify-content-between mb-1 text-success">
                      <span>Réduction</span>
                      <b>-{discount} {currency}</b>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-1 text-muted">
                    <span>Livraison ({orderType === 'delivery' ? 'Domicile' : 'Retrait'})</span>
                    <b className={finalDeliveryFee === 0 ? 'text-success' : 'text-dark'}>
                      {finalDeliveryFee === 0 ? 'GRATUIT' : `${finalDeliveryFee} ${currency}`}
                    </b>
                  </div>
                </div>

                <div className="grand-total d-flex justify-content-between align-items-center my-3">
                  <span className="fs-5 fw-bold">Total Final</span>
                  <strong className="fs-3 text-primary">{finalTotal} {currency}</strong>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 py-3 fs-6 fw-bold shadow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Traitement en cours...</span>
                  ) : (
                    <span>Confirmer la Commande <i className="bi bi-check2-circle ms-1"></i></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
