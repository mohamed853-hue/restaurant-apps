import React, { useState } from 'react';
import { MenuItem, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface DishDetailProps {
  dish: MenuItem | null;
  setCurrentPage: (page: string) => void;
}

export const DishDetail: React.FC<DishDetailProps> = ({ dish, setCurrentPage }) => {
  if (!dish) {
    return (
      <div className="container py-5 text-center">
        <h3>Plat introuvable</h3>
        <button className="btn btn-primary mt-3" onClick={() => setCurrentPage('menu')}>
          Retour au Menu
        </button>
      </div>
    );
  }

  const { addToCart, toggleFavorite, isFavorite, currency } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      user_id: '1',
      menu_item_id: dish.id,
      rating: 5,
      comment: 'Absolument délicieux ! La cuisson smash est parfaite et croustillante, la sauce est un pur bonheur.',
      user_name: 'Amine K.',
      admin_reply: 'Merci Amine ! Nous sommes ravis que vous ayez apprécié notre recette signature.',
      helpful_count: 4,
      status: 1,
      created_at: 'Hier'
    }
  ]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const favorite = isFavorite(dish.id);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      user_id: user?.id || 'guest',
      menu_item_id: dish.id,
      rating: newRating,
      comment: newComment,
      user_name: user?.name || 'Client Gourmet',
      helpful_count: 0,
      status: 1,
      created_at: "À l'instant"
    };
    setReviews([newRev, ...reviews]);
    setNewComment('');
    addToast('success', 'Votre avis a été publié avec succès !');
  };

  return (
    <div className="dish-detail-page py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <button
            className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
            onClick={() => setCurrentPage('menu')}
          >
            <i className="bi bi-arrow-left me-1"></i> Retour au Menu
          </button>
        </nav>

        <div className="row g-5 align-items-center">
          {/* Dish Image */}
          <div className="col-lg-6">
            <div className="detail-image position-relative rounded-4 overflow-hidden shadow-lg" style={{ height: '480px' }}>
              <img src={dish.image} alt={dish.name} className="w-100 h-100 object-fit-cover" />
              <button
                className={`heart position-absolute top-0 end-0 m-3 ${favorite ? 'active text-danger' : 'text-muted'}`}
                onClick={() => toggleFavorite(dish.id)}
              >
                <i className={`bi ${favorite ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
              </button>
              <span className="detail-tag position-absolute bottom-0 start-0 m-3 bg-white p-2 px-3 rounded-3 shadow">
                <i className="bi bi-fire text-danger me-1"></i> Préparation Minute
              </span>
            </div>
          </div>

          {/* Dish Details */}
          <div className="col-lg-6 detail-copy">
            <div className="d-flex align-items-center gap-3 mb-2">
              <span className={`veg-label ${dish.is_veg ? 'text-success' : 'text-danger'} fw-bold small`}>
                <i className="bi bi-circle-fill me-1" style={{ fontSize: '8px' }}></i>
                {dish.is_veg ? 'Végétarien' : '100% Viande Halal'}
              </span>
              <div className="detail-rating d-flex align-items-center gap-2">
                <span className="badge bg-success px-2 py-1">
                  ⭐ {dish.rating}
                </span>
                <span className="text-muted small">({reviews.length} avis vérifiés)</span>
              </div>
            </div>

            <h1 className="display-5 fw-extrabold mb-3">{dish.name}</h1>
            <p className="lead text-muted fs-6 mb-4">{dish.description}</p>

            {/* Dish Meta Notes */}
            <div className="detail-notes d-flex gap-4 py-3 border-top border-bottom mb-4">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-4 text-primary">⏱️</span>
                <div>
                  <b className="d-block small">Temps de cuisson</b>
                  <small className="text-muted">{dish.preparation_time} minutes</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="fs-4 text-danger">🌶️</span>
                <div>
                  <b className="d-block small">Niveau Épicé</b>
                  <small className="text-muted">
                    {dish.spice_level === 0 ? 'Doux' : dish.spice_level === 1 ? 'Moyen' : 'Piquant'}
                  </small>
                </div>
              </div>
            </div>

            {/* Special Instructions Input */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">
                Instructions spéciales (Optionnel)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Sans oignons, sauce à part, bien cuit..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Price & Add to cart CTA */}
            <div className="d-flex align-items-center gap-4">
              <div className="detail-price">
                <span className="fs-3 fw-extrabold text-primary">
                  {dish.price * quantity} {currency}
                </span>
                {quantity > 1 && (
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                    ({dish.price} {currency} / unité)
                  </small>
                )}
              </div>

              {/* Quantity Picker */}
              <div className="quantity-picker border rounded-pill d-flex align-items-center px-2">
                <button
                  className="btn btn-sm btn-link text-dark p-1"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <i className="bi bi-dash fs-5"></i>
                </button>
                <span className="px-3 fw-bold">{quantity}</span>
                <button
                  className="btn btn-sm btn-link text-dark p-1"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <i className="bi bi-plus fs-5"></i>
                </button>
              </div>

              <button
                className="btn btn-primary-custom flex-grow-1 py-3 px-4 shadow"
                onClick={() => addToCart(dish, quantity, instructions)}
              >
                <i className="bi bi-bag-plus-fill me-2"></i> Ajouter au Panier
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="review-section mt-5 pt-5 border-top">
          <h2 className="fs-3 fw-bold mb-4">Avis & Évaluations Clients ⭐</h2>

          <div className="row g-4">
            {/* Reviews List */}
            <div className="col-lg-7">
              {reviews.map((rev) => (
                <div key={rev.id} className="card p-3 mb-3 border rounded-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="customer-avatar rounded-circle">
                        {rev.user_name?.charAt(0)}
                      </div>
                      <div>
                        <b className="d-block small">{rev.user_name}</b>
                        <small className="text-muted" style={{ fontSize: '10px' }}>{rev.created_at}</small>
                      </div>
                    </div>
                    <span className="text-warning">{'⭐'.repeat(rev.rating)}</span>
                  </div>
                  <p className="small mb-2">{rev.comment}</p>
                  {rev.admin_reply && (
                    <div className="p-2 rounded bg-light border-start border-primary border-3 mt-2">
                      <small className="fw-bold d-block text-primary">Réponse du Chef :</small>
                      <small className="text-muted">{rev.admin_reply}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Review Form */}
            <div className="col-lg-5">
              <div className="card p-4 rounded-4 shadow-sm border">
                <h3 className="fs-5 fw-bold mb-3">Laisser un Avis</h3>
                <form onSubmit={handleAddReview}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Votre Note</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="btn btn-sm p-1 border-0"
                          onClick={() => setNewRating(star)}
                        >
                          <i className={`bi bi-star-fill fs-4 ${star <= newRating ? 'text-warning' : 'text-muted'}`}></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Votre Commentaire</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Comment avez-vous trouvé ce plat ? (Goût, cuisson, sauce...)"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-dark w-100 py-2 rounded-pill fw-bold">
                    Publier mon avis
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
