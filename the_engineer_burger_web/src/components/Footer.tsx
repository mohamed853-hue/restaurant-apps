import React from 'react';
import { useCart } from '../context/CartContext';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const { settings } = useCart();

  return (
    <footer className="footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="brand text-white mb-3 d-flex align-items-center gap-2">
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff'
                }}
              >
                🍲
              </span>
              <span>{settings.restaurant_name}</span>
            </div>
            <p className="text-secondary" style={{ fontSize: '13px', lineHeight: '1.7' }}>
              L'art des saveurs authentiques, des grillades gourmandes et des recettes savoureuses au Restaurant l'Amitié. Ingrédients frais sélectionnés avec soin, cuissons parfaites et sauces maison.
            </p>
            <div className="socials mt-3 d-flex gap-2">
              <a href={String(settings.instagram_url || 'https://instagram.com')} target="_blank" rel="noreferrer" className="social-icon" title="Instagram"><i className="bi bi-instagram"></i></a>
              <a href={String(settings.facebook_url || 'https://facebook.com')} target="_blank" rel="noreferrer" className="social-icon" title="Facebook"><i className="bi bi-facebook"></i></a>
              <a href={String(settings.tiktok_url || 'https://tiktok.com')} target="_blank" rel="noreferrer" className="social-icon" title="TikTok"><i className="bi bi-tiktok"></i></a>
              <a href={`https://wa.me/${String(settings.whatsapp_number || '221771234567').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="social-icon" title="WhatsApp"><i className="bi bi-whatsapp"></i></a>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="text-white fw-bold mb-3">Boutique Client</h6>
            <div className="d-flex flex-column gap-2" style={{ fontSize: '13px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} className="text-secondary text-decoration-none hover-white">Accueil</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('menu'); }} className="text-secondary text-decoration-none hover-white">Menu Gourmet</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('cart'); }} className="text-secondary text-decoration-none hover-white">Mon Panier</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('orders'); }} className="text-secondary text-decoration-none hover-white">Suivi de Commande</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('favorites'); }} className="text-secondary text-decoration-none hover-white">Favoris</a>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <h6 className="text-white fw-bold mb-3">Horaires & Contact</h6>
            <div className="text-secondary" style={{ fontSize: '13px', lineHeight: '1.8' }}>
              <div><i className="bi bi-geo-alt text-primary me-2"></i>{settings.restaurant_address}</div>
              <div><i className="bi bi-telephone text-primary me-2"></i>{settings.restaurant_phone}</div>
              <div><i className="bi bi-clock text-primary me-2"></i>{settings.opening_hours}</div>
              <div><i className="bi bi-envelope text-primary me-2"></i>{settings.restaurant_email}</div>
            </div>
          </div>

          <div className="col-lg-3">
            <h6 className="text-white fw-bold mb-3">Moyens de Paiement</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-secondary p-2">💵 Espèces à la livraison</span>
              <span className="badge bg-secondary p-2">📱 Wave / Orange Money</span>
              <span className="badge bg-secondary p-2">💳 Carte Bancaire</span>
            </div>
            <div className="p-3 rounded" style={{ background: '#25201c', border: '1px solid #3d352e' }}>
              <small className="text-warning d-block fw-bold mb-1"><i className="bi bi-shield-check me-1"></i> Fraîcheur & Livraison Rapide</small>
              <small className="text-secondary" style={{ fontSize: '11px' }}>Vos repas sont cuisinés à la commande et livrés chauds dans des sacs thermiques scellés.</small>
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: '#332d28' }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2" style={{ fontSize: '12px', color: '#777' }}>
          <div>© {new Date().getFullYear()} {settings.restaurant_name} (مطعم الصداقة). Tous droits réservés.</div>
          <div className="d-flex align-items-center gap-3">
            <a href="#" className="text-secondary text-decoration-none">Conditions Générales</a>
            <a href="#" className="text-secondary text-decoration-none">Confidentialité</a>
            <span className="text-muted">|</span>
            {/* Discrete link for staff & administration */}
            <a
              href="/admin"
              className="text-muted text-decoration-none"
              style={{ fontSize: '11px' }}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('admin-dashboard');
              }}
            >
              🔒 Portail Staff Privé
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
