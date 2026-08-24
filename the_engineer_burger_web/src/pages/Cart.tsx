import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

interface CartProps {
  setCurrentPage: (page: string) => void;
}

export const Cart: React.FC<CartProps> = ({ setCurrentPage }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    currency,
    settings
  } = useCart();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCoupon(couponCode);
      setCouponCode('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="empty-state">
          <span className="fs-1">🛒</span>
          <h2 className="fw-extrabold mt-3">Votre panier est vide</h2>
          <p className="text-muted">Parcourez notre carte et ajoutez vos smash burgers préférés !</p>
          <button
            className="btn btn-primary-custom px-4 py-3"
            onClick={() => setCurrentPage('menu')}
          >
            <i className="bi bi-book-half me-2"></i> Explorer le Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page py-5 bg-light">
      <div className="container">
        <h1 className="fs-3 fw-extrabold mb-4">Votre Panier Gourmet ({cart.length})</h1>

        <div className="row g-4">
          {/* Cart Items List */}
          <div className="col-lg-8">
            <div className="cart-items card border-0 p-4 rounded-4 shadow-sm bg-white">
              <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
                <h2 className="fs-5 fw-bold mb-0">Articles Sélectionnés</h2>
                <button
                  className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                  onClick={clearCart}
                >
                  <i className="bi bi-trash me-1"></i> Vider le panier
                </button>
              </div>

              {cart.map(({ item, quantity, instructions }) => (
                <div
                  key={item.id}
                  className="cart-item d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 py-3 border-bottom"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded-3"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 className="fs-6 fw-bold mb-1">{item.name}</h3>
                      <div className="text-primary fw-bold small">
                        {item.price} {currency}
                      </div>
                      {instructions && (
                        <small className="text-muted fst-italic d-block">
                          Note : {instructions}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-4">
                    {/* Quantity Picker */}
                    <div className="quantity-picker border rounded-pill d-flex align-items-center px-2">
                      <button
                        className="btn btn-sm btn-link text-dark p-1"
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="px-2 fw-bold small">{quantity}</span>
                      <button
                        className="btn btn-sm btn-link text-dark p-1"
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    <div className="text-end" style={{ minWidth: '85px' }}>
                      <strong className="fs-6">{item.price * quantity} {currency}</strong>
                    </div>

                    <button
                      className="btn btn-sm btn-link text-muted p-0"
                      onClick={() => removeFromCart(item.id)}
                      title="Supprimer"
                    >
                      <i className="bi bi-x-circle fs-5 text-danger"></i>
                    </button>
                  </div>
                </div>
              ))}

              {/* Delivery Guarantee */}
              <div className="delivery-promise d-flex align-items-center gap-3 p-3 rounded-3 mt-4 bg-light border">
                <span className="fs-3 text-success">🛵</span>
                <div>
                  <b className="d-block small text-success">Garantie Livraison Chaude</b>
                  <small className="text-muted">Vos burgers sont scellés et acheminés en sac isotherme sous 25 minutes.</small>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="col-lg-4">
            <div className="bill-card card border-0 p-4 rounded-4 shadow-sm bg-white sticky-top" style={{ top: '95px' }}>
              <h3 className="fs-5 fw-bold mb-3">Récapitulatif</h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="coupon-form mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    placeholder="Code Promo (ex: WELCOME300)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button className="btn btn-dark fw-bold" type="submit">
                    Appliquer
                  </button>
                </div>
              </form>

              {appliedCoupon && (
                <div className="alert alert-success d-flex justify-content-between align-items-center py-2 px-3 mb-3">
                  <small>
                    <i className="bi bi-tag-fill me-1"></i>
                    Code <strong>{appliedCoupon.code}</strong> appliqué (-{discount} {currency})
                  </small>
                  <button
                    className="btn-close btn-sm"
                    onClick={removeCoupon}
                  ></button>
                </div>
              )}

              {/* Bill Details */}
              <div className="bill-lines border-top border-bottom py-3 my-2">
                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Sous-total</span>
                  <b className="text-dark">{subtotal} {currency}</b>
                </div>

                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>Réduction Coupon</span>
                    <b>-{discount} {currency}</b>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Frais de Livraison</span>
                  <b className={deliveryFee === 0 ? 'text-success' : 'text-dark'}>
                    {deliveryFee === 0 ? 'GRATUIT 🎉' : `${deliveryFee} ${currency}`}
                  </b>
                </div>

                {deliveryFee > 0 && (
                  <div className="text-muted small fst-italic mb-2" style={{ fontSize: '11px' }}>
                    💡 Ajoutez pour {settings.free_delivery_threshold - subtotal} {currency} pour la livraison gratuite !
                  </div>
                )}

                {tax > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>TVA ({settings.tax_rate}%)</span>
                    <b>{tax} {currency}</b>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="grand-total d-flex justify-content-between align-items-center my-3">
                <div>
                  <b className="fs-5 d-block">Total à Payer</b>
                  <small className="text-muted">Toutes taxes incluses</small>
                </div>
                <strong className="fs-3 text-primary">{total} {currency}</strong>
              </div>

              {/* Checkout CTA */}
              <button
                className="btn btn-primary-custom w-100 py-3 fs-6 shadow-sm"
                onClick={() => setCurrentPage('checkout')}
              >
                Passer la Commande <i className="bi bi-arrow-right ms-2"></i>
              </button>

              <small className="secure-note text-center text-muted d-block mt-3" style={{ fontSize: '11px' }}>
                <i className="bi bi-shield-lock-fill text-success me-1"></i> Paiement 100% sécurisé à la livraison ou en ligne
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
