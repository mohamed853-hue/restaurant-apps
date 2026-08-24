import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { INITIAL_CATEGORIES } from '../lib/supabase';
import { FoodCard } from '../components/FoodCard';
import { MenuItem } from '../types';

interface MenuProps {
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedDish: (dish: MenuItem) => void;
  setCurrentPage: (page: string) => void;
}

export const Menu: React.FC<MenuProps> = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  setSelectedDish,
  setCurrentPage
}) => {
  const { menuItems } = useCart();
  const [onlyVeg, setOnlyVeg] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  let filtered = menuItems.filter((item) => {
    const matchesCat = !selectedCategory || selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !onlyVeg || item.is_veg;
    return matchesCat && matchesSearch && matchesVeg;
  });

  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="menu-page py-4">
      {/* Page Header */}
      <div className="page-hero compact py-4 bg-light text-center border-bottom mb-4">
        <div className="container">
          <span className="badge bg-primary text-white text-uppercase px-3 py-2 mb-2">Catalogue Gourmet</span>
          <h1 className="display-6 fw-extrabold mb-1">Notre Carte & Menus</h1>
          <p className="text-muted small mb-0">Tous nos burgers sont smashés et préparés à la commande</p>
        </div>
      </div>

      <div className="container">
        {/* Toolbar & Filters */}
        <div className="menu-toolbar d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom mb-4">
          {/* Categories Horizontal Scroll */}
          <div className="category-pills d-flex gap-2 overflow-auto pb-2 pb-md-0" style={{ maxWidth: '100%' }}>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${!selectedCategory || selectedCategory === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedCategory('all')}
            >
              Tous les Plats ({menuItems.length})
            </button>
            {INITIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`btn btn-sm rounded-pill px-3 fw-bold text-nowrap ${selectedCategory === cat.id ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <i className={`bi ${cat.icon} me-1`}></i>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Quick Filter & Sort */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${onlyVeg ? 'btn-success text-white' : 'btn-outline-secondary'}`}
              onClick={() => setOnlyVeg(!onlyVeg)}
            >
              <i className="bi bi-circle-fill me-1" style={{ fontSize: '9px' }}></i>
              Végétarien uniquement
            </button>

            <select
              className="form-select form-select-sm rounded-pill px-3"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
            >
              <option value="default">Tri par défaut</option>
              <option value="price-asc">Prix : Moins cher</option>
              <option value="price-desc">Prix : Plus cher</option>
              <option value="rating">Mieux notés ⭐</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fs-5 fw-bold mb-0">
            {searchQuery ? `Résultats pour "${searchQuery}"` : 'Tous nos plats'}
          </h2>
          <span className="text-muted small">{filtered.length} article(s) trouvé(s)</span>
        </div>

        {/* Food Grid */}
        {filtered.length > 0 ? (
          <div className="row g-4">
            {filtered.map((dish) => (
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
          <div className="empty-state py-5 text-center">
            <div className="fs-1 text-muted mb-3">🍔🔍</div>
            <h3 className="fw-bold">Aucun plat trouvé</h3>
            <p className="text-muted">Essayez un autre mot clé ou réinitialisez les filtres.</p>
            <button
              className="btn btn-primary-custom px-4 py-2"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyVeg(false);
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
