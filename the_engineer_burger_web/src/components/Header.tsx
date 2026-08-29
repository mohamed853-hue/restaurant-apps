import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery
}) => {
  const { user, unreadCount, notifications, markNotificationsAsRead, logout } = useAuth();
  const { cartCount, favorites, orders } = useCart();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="announcement d-flex justify-content-between align-items-center px-3 py-1">
        <div className="d-flex align-items-center gap-2 small">
          <i className="bi bi-lightning-charge-fill text-warning"></i>
          <span>{t('freeDeliveryAnnounce')}</span>
        </div>

        {/* Clean Language Toggle on the top right */}
        <div className="d-flex align-items-center gap-1">
          <button
            className={`btn btn-xs px-2 py-0 rounded-pill ${language === 'fr' ? 'btn-light text-dark fw-bold' : 'btn-outline-light'}`}
            style={{ fontSize: '11px' }}
            onClick={() => setLanguage('fr')}
          >
            🇫🇷 FR
          </button>
          <button
            className={`btn btn-xs px-2 py-0 rounded-pill ${language === 'ar' ? 'btn-warning text-dark fw-bold' : 'btn-outline-light'}`}
            style={{ fontSize: '11px', fontFamily: 'Cairo, sans-serif' }}
            onClick={() => setLanguage('ar')}
          >
            🇩🇿 العربية
          </button>
        </div>
      </div>

      {/* Main Glass Navigation Bar */}
      <nav className="navbar navbar-expand-lg sticky-top glass-nav">
        <div className="container">
          {/* Brand Logo & Name */}
          <a
            className="navbar-brand brand d-flex align-items-center gap-2"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage('home');
            }}
          >
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f4511e, #d83a0a)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 6px 16px rgba(244,81,30,.28)',
                fontSize: '18px'
              }}
            >
              🍔
            </span>
            <span
              className="fw-extrabold fs-5 text-nowrap d-flex align-items-center gap-1"
              style={{ letterSpacing: '-0.3px', fontWeight: 900 }}
            >
              <span style={{ color: '#ea580c' }}>THE</span>
              <span style={{ color: '#111827' }}>ENGINEER</span>
              <span style={{ color: '#d97706' }}>BURGER</span>
            </span>
          </a>

          {/* Mobile Toggler */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
          >
            <i className="bi bi-list fs-2"></i>
          </button>

          {/* Navigation Links and Right Controls */}
          <div className="collapse navbar-collapse" id="mainNav">
            {/* Search Input */}
            <div className="nav-search mx-lg-auto my-2 my-lg-0">
              <i className="bi bi-search text-muted"></i>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentPage !== 'menu') setCurrentPage('menu');
                }}
              />
              {searchQuery && (
                <button
                  className="btn btn-sm btn-link text-muted p-0 border-0"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>

            {/* Right-aligned Navigation Controls */}
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <li className="nav-item">
                <a
                  className={`nav-link ${currentPage === 'menu' ? 'active text-primary fw-bold' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage('menu');
                  }}
                >
                  {t('exploreMenu')}
                </a>
              </li>

              {user ? (
                <>
                  {/* Notifications */}
                  <li className="nav-item position-relative">
                    <button
                      className="nav-link nav-icon border-0 bg-transparent"
                      onClick={() => {
                        setShowNotifs(!showNotifs);
                        setShowProfile(false);
                      }}
                      title="Notifications"
                    >
                      <i className="bi bi-bell"></i>
                      {unreadCount > 0 && <b>{unreadCount}</b>}
                    </button>

                    {showNotifs && (
                      <div
                        className="dropdown-menu dropdown-menu-end p-2 show position-absolute shadow-lg"
                        style={{ [isRTL ? 'left' : 'right']: 0, top: '45px', width: '300px', zIndex: 1050 }}
                      >
                        <div className="d-flex justify-content-between align-items-center px-2 py-1 mb-1 border-bottom">
                          <strong className="small">Notifications</strong>
                          {unreadCount > 0 && (
                            <button
                              className="btn btn-sm btn-link text-primary p-0 text-decoration-none"
                              style={{ fontSize: '11px' }}
                              onClick={markNotificationsAsRead}
                            >
                              Tout marquer comme lu
                            </button>
                          )}
                        </div>
                        {notifications.length > 0 ? (
                          notifications.map((note) => (
                            <div
                              key={note.id}
                              className={`p-2 mb-1 rounded small ${!note.is_read ? 'bg-light font-weight-bold' : ''}`}
                            >
                              <div className="d-flex align-items-start gap-2">
                                <i className={`bi ${note.icon || 'bi-bell'} text-primary mt-1`}></i>
                                <div>
                                  <strong>{note.title}</strong>
                                  <div className="text-muted" style={{ fontSize: '11px' }}>{note.message}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-muted small">Aucune notification</div>
                        )}
                      </div>
                    )}
                  </li>

                  {/* Profile Dropdown */}
                  <li className="nav-item position-relative">
                    <button
                      className="profile-chip border-0 bg-transparent"
                      onClick={() => {
                        setShowProfile(!showProfile);
                        setShowNotifs(false);
                      }}
                    >
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                      <div className="text-start">
                        <div>{user.name.split(' ')[0]}</div>
                        <small className="badge bg-light text-dark text-uppercase">{user.role}</small>
                      </div>
                      <i className="bi bi-chevron-down ms-1"></i>
                    </button>

                    {showProfile && (
                      <ul
                        className="dropdown-menu dropdown-menu-end show position-absolute shadow-lg"
                        style={{ [isRTL ? 'left' : 'right']: 0, top: '50px', minWidth: '220px', zIndex: 1050 }}
                      >
                        {/* If user has staff role, allow jumping to their dedicated portal */}
                        {user.role === 'admin' && (
                          <li>
                            <a
                              className="dropdown-item py-2 fw-bold text-primary"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage('admin-dashboard');
                                setShowProfile(false);
                              }}
                            >
                              <i className="bi bi-speedometer2 me-2"></i> {t('adminDashboard')}
                            </a>
                          </li>
                        )}
                        {user.role === 'kitchen' && (
                          <li>
                            <a
                              className="dropdown-item py-2 fw-bold text-danger"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage('kitchen-portal');
                                setShowProfile(false);
                              }}
                            >
                              <i className="bi bi-fire me-2"></i> Écran Cuisine (KDS)
                            </a>
                          </li>
                        )}
                        {user.role === 'delivery' && (
                          <li>
                            <a
                              className="dropdown-item py-2 fw-bold text-info"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage('delivery-portal');
                                setShowProfile(false);
                              }}
                            >
                              <i className="bi bi-scooter me-2"></i> Espace Livreur
                            </a>
                          </li>
                        )}

                        <li>
                          <a
                            className="dropdown-item py-2"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage('customer-dashboard');
                              setShowProfile(false);
                            }}
                          >
                            <i className="bi bi-person-circle me-2 text-dark"></i> {t('myProfile')}
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item py-2"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage('orders');
                              setShowProfile(false);
                            }}
                          >
                            <i className="bi bi-bag-check me-2 text-dark"></i> {t('myOrders')}
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item py-2"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage('favorites');
                              setShowProfile(false);
                            }}
                          >
                            <i className="bi bi-heart me-2 text-danger"></i> {t('favorites')}
                          </a>
                        </li>

                        <li>
                          <hr className="dropdown-divider my-1" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger py-2"
                            onClick={() => {
                              logout();
                              setShowProfile(false);
                              setCurrentPage('home');
                            }}
                          >
                            <i className="bi bi-box-arrow-right me-2"></i> {t('logout')}
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                </>
              ) : (
                /* Only the clean Login button is shown on the public site */
                <li className="nav-item">
                  <button
                    className="btn btn-outline-dark rounded-pill px-4 fw-bold"
                    onClick={() => setCurrentPage('login')}
                  >
                    <i className="bi bi-person-fill me-1"></i> {t('login')}
                  </button>
                </li>
              )}

              {/* My Orders Button in Navbar */}
              <li className="nav-item">
                <button
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-2 border shadow-sm ${
                    currentPage === 'orders'
                      ? 'btn-primary text-white border-primary shadow'
                      : 'btn-light text-dark bg-white'
                  }`}
                  onClick={() => setCurrentPage('orders')}
                  title="Mes Commandes & Suivi en Direct"
                  style={{ fontSize: '13px' }}
                >
                  <i className="bi bi-receipt text-warning"></i>
                  <span>{isRTL ? 'طلباتي' : 'Mes Commandes'}</span>
                  {orders.filter((o) => (!user || o.user_id === user.id || (user?.phone && o.customer_phone === user.phone)) && o.status !== 'delivered' && o.status !== 'cancelled').length > 0 && (
                    <span className="badge rounded-pill bg-warning text-dark fw-bold" style={{ fontSize: '10px' }}>
                      {orders.filter((o) => (!user || o.user_id === user.id || (user?.phone && o.customer_phone === user.phone)) && o.status !== 'delivered' && o.status !== 'cancelled').length}
                    </span>
                  )}
                </button>
              </li>

              {/* Favorites Button in Navbar */}
              <li className="nav-item">
                <button
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-2 border shadow-sm ${
                    currentPage === 'favorites'
                      ? 'btn-danger text-white border-danger'
                      : 'btn-light text-dark bg-white'
                  }`}
                  onClick={() => setCurrentPage('favorites')}
                  title="Mes Plats Favoris"
                  style={{ fontSize: '13px' }}
                >
                  <i className={`bi ${favorites.length > 0 ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'}`}></i>
                  <span>{t('favorites')}</span>
                  <span
                    className={`badge rounded-pill ${favorites.length > 0 ? 'bg-danger text-white' : 'bg-light text-dark border'}`}
                    style={{ fontSize: '10px' }}
                  >
                    {favorites.length}
                  </span>
                </button>
              </li>

              {/* Cart Button */}
              <li className="nav-item">
                <a
                  className="cart-button"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage('cart');
                  }}
                >
                  <i className="bi bi-bag-heart"></i>
                  <span>{t('cart')}</span>
                  <b>{cartCount}</b>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
