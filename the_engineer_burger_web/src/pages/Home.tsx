import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { FoodCard } from '../components/FoodCard';
import { MenuItem } from '../types';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (catId: string) => void;
  setSelectedDish: (dish: MenuItem) => void;
}

export const Home: React.FC<HomeProps> = ({
  setCurrentPage,
  setSelectedCategory,
  setSelectedDish
}) => {
  const { menuItems, categories, currency } = useCart();
  const { t, isRTL } = useLanguage();
  const bestsellers = menuItems.filter((m) => m.is_bestseller || m.is_featured).slice(0, 4);

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero position-relative overflow-hidden py-5">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6 hero-copy">
              <div className="eyebrow mb-3">
                <span>🔥</span>
                <span>{t('heroEyebrow')}</span>
              </div>

              <h1 className="display-4 fw-extrabold mb-3">
                {t('heroTitle1')} <em>{t('heroTitle2')}</em>.
              </h1>

              <p className="lead text-muted mb-4">
                {t('heroDesc')}
              </p>

              <div className="hero-actions d-flex flex-wrap align-items-center gap-3 mb-4">
                <button
                  className="btn btn-primary-custom px-4 py-3 fs-6 shadow-sm"
                  onClick={() => setCurrentPage('menu')}
                >
                  <i className="bi bi-bag-check-fill me-2"></i> {t('orderNow')}
                </button>
                <button
                  className="btn btn-outline-dark rounded-pill px-4 py-3 fw-bold"
                  onClick={() => setCurrentPage('menu')}
                >
                  <i className="bi bi-book-half me-2"></i> {t('viewFullMenu')}
                </button>
              </div>

              <div className="hero-trust d-flex align-items-center gap-3 pt-3 border-top">
                <div className="avatars d-flex">
                  <span style={{ background: '#f4511e' }}>🍲</span>
                  <span style={{ background: '#181512' }}>⭐</span>
                  <span style={{ background: '#218653' }}>🚀</span>
                </div>
                <div>
                  <div className="stars text-warning fw-bold">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <b className="text-dark ms-2">4.9/5</b>
                  </div>
                  <small className="text-muted">{t('servingsCount')}</small>
                </div>
              </div>
            </div>

            <div className="col-lg-6 hero-visual text-center position-relative">
              <div className="hero-ring position-absolute"></div>
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=85"
                alt="Restaurant l'Amitié Grillades et Plats"
                className="hero-main img-fluid shadow-lg rounded-circle"
                style={{ width: '420px', height: '420px', objectFit: 'cover' }}
              />

              {/* Floating Cards */}
              <div className="floating-card delivery">
                <span><i className="bi bi-scooter text-primary fs-4"></i></span>
                <div className="text-start">
                  <b>{isRTL ? 'توصيل سريع' : 'Livraison Express'}</b>
                  <small>{isRTL ? 'توصيل ساخن في 20-30 دقيقة' : 'Livraison Chaude (20-30 min)'}</small>
                </div>
              </div>

              <div className="floating-card rating">
                <i className="bi bi-patch-check-fill text-warning fs-3"></i>
                <div className="text-start">
                  <b>{isRTL ? 'طازج وشهي 100%' : '100% Frais & Fait Maison'}</b>
                  <small>{isRTL ? 'جودة ونكهة مضمونة' : 'Qualité & Saveurs Garanties'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Perks Bar */}
      <section className="quick-perks bg-light py-3 border-top border-bottom">
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-6 col-md-3 d-flex align-items-center justify-content-center gap-3">
              <span className="fs-3 text-primary">🥩</span>
              <div className="text-start">
                <b className="d-block small">{t('perk1Title')}</b>
                <small className="text-muted">{t('perk1Desc')}</small>
              </div>
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center justify-content-center gap-3">
              <span className="fs-3 text-primary">⚡</span>
              <div className="text-start">
                <b className="d-block small">{t('perk2Title')}</b>
                <small className="text-muted">{t('perk2Desc')}</small>
              </div>
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center justify-content-center gap-3">
              <span className="fs-3 text-primary">🚀</span>
              <div className="text-start">
                <b className="d-block small">{t('perk3Title')}</b>
                <small className="text-muted">{t('perk3Desc')}</small>
              </div>
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center justify-content-center gap-3">
              <span className="fs-3 text-primary">🎁</span>
              <div className="text-start">
                <b className="d-block small">{t('perk4Title')}</b>
                <small className="text-muted">{t('perk4Desc')}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section category-section py-5">
        <div className="container">
          <div className="section-heading d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small">{isRTL ? 'استكشف' : 'Explorer'}</span>
              <h2 className="fs-2 fw-extrabold mb-1">{t('categoriesTitle')}</h2>
              <p className="text-muted mb-0">{t('categoriesDesc')}</p>
            </div>
            <button
              className="btn btn-link text-primary fw-bold p-0 text-decoration-none"
              onClick={() => setCurrentPage('menu')}
            >
              {isRTL ? 'عرض القائمة كاملة ←' : 'Voir tout le menu →'}
            </button>
          </div>

          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat.id} className="col-6 col-md-4 col-lg-2">
                <div
                  className="category-card card h-100 p-2 text-center border-0 shadow-sm"
                  style={{ cursor: 'pointer', borderRadius: '18px' }}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage('menu');
                  }}
                >
                  <span className="d-block mb-2">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="rounded-circle img-fluid"
                      style={{ width: '85px', height: '85px', objectFit: 'cover' }}
                    />
                  </span>
                  <b className="d-block" style={{ fontSize: '13px' }}>{cat.name}</b>
                  <small className="text-muted" style={{ fontSize: '11px' }}>{isRTL ? 'اكتشف' : 'Découvrir'}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="offer-section py-4">
        <div className="container">
          <div className="offer-card rounded-4 p-4 p-lg-5 position-relative text-white overflow-hidden" style={{ background: '#1c1917' }}>
            <div className="row align-items-center">
              <div className="col-lg-7">
                <span className="badge bg-warning text-dark fw-bold px-3 py-2 text-uppercase mb-3">
                  {isRTL ? 'عرض ترحيبي خاص' : "Offre de Bienvenue"}
                </span>
                <h2 className="display-5 fw-extrabold mb-3">
                  {isRTL ? `خصم 1,000 ${currency} على أول طلبية !` : `1 000 ${currency} de Réduction sur votre Commande !`}
                </h2>
                <p className="text-secondary mb-4">
                  {isRTL
                    ? 'تذوق أشهى المشويات المشكلة والبرجر الفاخر مع الصلصات الخاصة بالصداقة.'
                    : 'Découvrez la Grillade Mixte Spéciale Amitié ou nos Burgers Gourmets avec frites maison et sauces secrètes.'}
                </p>

                <div className="coupon-pill d-inline-flex align-items-center gap-3 p-2 px-3 rounded-3" style={{ background: '#2c2622', border: '1px dashed #e65100' }}>
                  <span className="text-secondary small">{isRTL ? 'كود الخصم :' : 'CODE PROMO :'}</span>
                  <b className="text-warning fs-5 tracking-wide">BIENVENUE1000</b>
                  <button
                    className="btn btn-sm btn-primary ms-2"
                    onClick={() => {
                      navigator.clipboard.writeText('BIENVENUE1000');
                      alert('Code promo BIENVENUE1000 copié !');
                    }}
                  >
                    <i className="bi bi-clipboard me-1"></i> {isRTL ? 'نسخ' : 'Copier'}
                  </button>
                </div>
              </div>

              <div className="col-lg-5 text-center mt-4 mt-lg-0">
                <img
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=85"
                  alt="Grillade Spéciale Amitié"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="section popular py-5 bg-light">
        <div className="container">
          <div className="section-heading d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small">{isRTL ? 'الأكثر طلباً' : 'Les Incontournables'}</span>
              <h2 className="fs-2 fw-extrabold mb-1">{t('bestsellersTitle')}</h2>
              <p className="text-muted mb-0">{t('bestsellersDesc')}</p>
            </div>
            <button
              className="btn btn-outline-dark rounded-pill px-4"
              onClick={() => setCurrentPage('menu')}
            >
              {t('viewFullMenu')} <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>

          <div className="row g-4">
            {bestsellers.map((item) => (
              <div key={item.id} className="col-6 col-md-6 col-lg-3">
                <FoodCard
                  item={item}
                  onSelect={(dish) => {
                    setSelectedDish(dish);
                    setCurrentPage('dish-detail');
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
