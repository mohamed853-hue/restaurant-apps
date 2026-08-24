import React from 'react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  item: MenuItem;
  onSelect?: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onSelect }) => {
  const { addToCart, toggleFavorite, isFavorite, currency } = useCart();
  const favorite = isFavorite(item.id);

  return (
    <div className="food-card h-100 d-flex flex-column shadow-sm position-relative">
      <div className="food-image position-relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-100 h-100 object-fit-cover"
          onClick={() => onSelect && onSelect(item)}
          style={{ cursor: 'pointer' }}
        />

        {/* Veg/Halal indicator */}
        <span className={`veg-dot ${item.is_veg ? '' : 'non-veg'}`} title={item.is_veg ? 'Végétarien' : '100% Viande Halal'}>
          <i></i>
        </span>

        {/* Favorite button */}
        <button
          className={`heart ${favorite ? 'active text-danger' : 'text-muted'}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
        >
          <i className={`bi ${favorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>

        {/* Bestseller badge */}
        {item.is_bestseller && (
          <span className="bestseller">
            <i className="bi bi-fire text-warning me-1"></i> Bestseller
          </span>
        )}
      </div>

      <div className="food-body flex-grow-1 d-flex flex-column p-3">
        <div className="food-meta d-flex align-items-center gap-3 mb-2" style={{ fontSize: '11px', color: '#888' }}>
          <span>
            <i className="bi bi-star-fill text-warning me-1"></i>
            <strong>{item.rating}</strong>
          </span>
          <span>
            <i className="bi bi-clock me-1"></i>
            {item.preparation_time} min
          </span>
          {item.spice_level > 0 && (
            <span>
              <i className="bi bi-fire text-danger me-1"></i>
              {'🌶️'.repeat(Math.min(3, item.spice_level))}
            </span>
          )}
        </div>

        <h3
          className="fs-6 fw-bold mb-1"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect && onSelect(item)}
        >
          {item.name}
        </h3>

        <p className="text-muted small mb-3 flex-grow-1" style={{ fontSize: '12px', lineHeight: '1.4', maxHeight: '38px', overflow: 'hidden' }}>
          {item.description}
        </p>

        <div className="food-bottom d-flex align-items-center justify-content-between pt-2 border-top">
          <div className="price fw-bold fs-6">
            {item.price} {currency}
            {item.compare_price && item.compare_price > item.price && (
              <del className="text-muted small ms-1" style={{ fontSize: '11px' }}>
                {item.compare_price} {currency}
              </del>
            )}
          </div>

          <button
            className="btn btn-sm add-btn fw-bold px-3 py-1 d-flex align-items-center gap-1"
            onClick={() => addToCart(item, 1)}
          >
            <i className="bi bi-plus-lg"></i> Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};
