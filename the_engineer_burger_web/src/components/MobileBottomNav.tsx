import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface MobileBottomNavProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  setCurrentPage
}) => {
  const { user } = useAuth();
  const { cartCount, favorites } = useCart();
  const { isRTL } = useLanguage();

  return (
    <nav className="mobile-app-bottom-nav d-lg-none fixed-bottom bg-white border-top shadow-lg">
      <div className="d-flex justify-content-around align-items-center py-2">
        {/* 1. Home */}
        <button
          className={`btn btn-link text-decoration-none d-flex flex-column align-items-center p-1 ${
            currentPage === 'home' ? 'text-primary fw-bold active-nav-item' : 'text-secondary'
          }`}
          onClick={() => setCurrentPage('home')}
        >
          <i className={`bi ${currentPage === 'home' ? 'bi-house-door-fill' : 'bi-house-door'} fs-5`}></i>
          <span style={{ fontSize: '10px' }}>{isRTL ? 'الرئيسية' : 'Accueil'}</span>
        </button>

        {/* 2. Menu */}
        <button
          className={`btn btn-link text-decoration-none d-flex flex-column align-items-center p-1 ${
            currentPage === 'menu' || currentPage === 'dish-detail' ? 'text-primary fw-bold active-nav-item' : 'text-secondary'
          }`}
          onClick={() => setCurrentPage('menu')}
        >
          <i className={`bi ${currentPage === 'menu' ? 'bi-grid-fill' : 'bi-grid'} fs-5`}></i>
          <span style={{ fontSize: '10px' }}>{isRTL ? 'القائمة' : 'Menu'}</span>
        </button>

        {/* 3. Cart with Badge */}
        <button
          className={`btn btn-link text-decoration-none d-flex flex-column align-items-center p-1 position-relative ${
            currentPage === 'cart' || currentPage === 'checkout' ? 'text-primary fw-bold active-nav-item' : 'text-secondary'
          }`}
          onClick={() => setCurrentPage('cart')}
        >
          <div className="position-relative">
            <i className={`bi ${currentPage === 'cart' ? 'bi-bag-heart-fill' : 'bi-bag-heart'} fs-5`}></i>
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '9px', padding: '3px 5px' }}
              >
                {cartCount}
              </span>
            )}
          </div>
          <span style={{ fontSize: '10px' }}>{isRTL ? 'السلة' : 'Panier'}</span>
        </button>

        {/* 4. Favorites */}
        <button
          className={`btn btn-link text-decoration-none d-flex flex-column align-items-center p-1 ${
            currentPage === 'favorites' ? 'text-primary fw-bold active-nav-item' : 'text-secondary'
          }`}
          onClick={() => setCurrentPage('favorites')}
        >
          <div className="position-relative">
            <i className={`bi ${currentPage === 'favorites' ? 'bi-heart-fill text-danger' : 'bi-heart'} fs-5`}></i>
            {favorites.length > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                style={{ fontSize: '8px', padding: '2px 4px' }}
              >
                {favorites.length}
              </span>
            )}
          </div>
          <span style={{ fontSize: '10px' }}>{isRTL ? 'المفضلة' : 'Favoris'}</span>
        </button>

        {/* 5. Profile / Login */}
        <button
          className={`btn btn-link text-decoration-none d-flex flex-column align-items-center p-1 ${
            currentPage === 'customer-dashboard' || currentPage === 'login' || currentPage === 'register'
              ? 'text-primary fw-bold active-nav-item'
              : 'text-secondary'
          }`}
          onClick={() => setCurrentPage(user ? 'customer-dashboard' : 'login')}
        >
          <i className={`bi ${user ? 'bi-person-circle' : 'bi-person'} fs-5`}></i>
          <span style={{ fontSize: '10px' }}>
            {user ? user.name.split(' ')[0] : isRTL ? 'حسابي' : 'Compte'}
          </span>
        </button>
      </div>

      <style>{`
        .mobile-app-bottom-nav {
          z-index: 1040;
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.96) !important;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
        }
        .active-nav-item i {
          color: var(--primary) !important;
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
      `}</style>
    </nav>
  );
};
