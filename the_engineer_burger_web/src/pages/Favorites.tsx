import React from 'react';
import { useCart } from '../context/CartContext';
import { FoodCard } from '../components/FoodCard';
import { MenuItem } from '../types';

interface FavoritesProps {
  setCurrentPage: (page: string) => void;
  setSelectedDish: (dish: MenuItem) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({ setCurrentPage, setSelectedDish }) => {
  const { menuItems, favorites } = useCart();
  const favoriteDishes = menuItems.filter((m) => favorites.includes(m.id));

  return (
    <div className="favorites-page py-5 bg-light min-vh-100">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fs-3 fw-extrabold mb-1">Vos Plats Favoris ❤️ ({favoriteDishes.length})</h1>
            <p className="text-muted small mb-0">Retrouvez vos smash burgers préférés en un clic</p>
          </div>
          <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setCurrentPage('menu')}>
            + Ajouter d'autres plats
          </button>
        </div>

        {favoriteDishes.length > 0 ? (
          <div className="row g-4">
            {favoriteDishes.map((dish) => (
              <div key={dish.id} className="col-6 col-md-4 col-lg-3">
                <FoodCard
                  item={dish}
                  onSelect={(item) => {
                    setSelectedDish(item);
                    setCurrentPage('dish-detail');
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 p-5 text-center rounded-4 shadow-sm bg-white my-4">
            <span className="fs-1 text-danger">💔</span>
            <h3 className="fw-bold mt-3">Aucun plat favori pour le moment</h3>
            <p className="text-muted">Cliquez sur le petit cœur des plats du menu pour les retrouver ici.</p>
            <div>
              <button className="btn btn-primary-custom px-4 py-2" onClick={() => setCurrentPage('menu')}>
                Explorer le Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
