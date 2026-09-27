import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AdminLoginProps {
  setCurrentPage: (page: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const { isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const routeByStaffRole = (role: string) => {
    if (role === 'admin' || role === 'staff') {
      setCurrentPage('admin-dashboard');
    } else if (role === 'kitchen') {
      setCurrentPage('kitchen-portal');
    } else if (role === 'delivery') {
      setCurrentPage('delivery-portal');
    } else {
      setErrorMessage(
        "Accès non autorisé : Ce compte client n'a pas les privilèges d'administration ou de gestion staff."
      );
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email) return;

    setIsSubmitting(true);
    const loggedUser = await login(email, password);
    setIsSubmitting(false);

    if (loggedUser) {
      if (loggedUser.role === 'customer') {
        setErrorMessage(
          "Accès refusé : Ce portail est strictement réservé à la direction et au personnel du Restaurant l'Amitié. Veuillez utiliser la boutique client."
        );
      } else {
        routeByStaffRole(loggedUser.role);
      }
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setErrorMessage(null);
  };

  return (
    <div
      className="admin-auth-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #1e1b18 0%, #0d0c0b 100%)',
        color: '#f3efea'
      }}
    >
      <div className="container" style={{ maxWidth: '480px' }}>
        <div
          className="card border-0 p-4 p-md-5 rounded-4 shadow-lg position-relative"
          style={{
            background: 'linear-gradient(180deg, #181512 0%, #12100e 100%)',
            border: '1px solid rgba(244, 81, 30, 0.25)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(244, 81, 30, 0.15)'
          }}
        >
          {/* Security Shield Badge */}
          <div className="text-center mb-3">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3 rounded-4"
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #f4511e 0%, #ff8a50 100%)',
                color: '#fff',
                fontSize: '28px',
                boxShadow: '0 8px 24px rgba(244, 81, 30, 0.4)'
              }}
            >
              <i className="bi bi-shield-lock-fill"></i>
            </div>

            <div className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
              🔒 ESPACE PRIVÉ · ACCÈS RESTREINT
            </div>

            <h1
              className="fw-extrabold text-uppercase mb-1"
              style={{
                fontSize: '22px',
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, #ffffff, #ffb39c, #ffffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Restaurant l'Amitié
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>
              Portail de Gestion & Administration Privée
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2 border-0 bg-danger bg-opacity-25 text-danger fw-semibold">
              <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-light mb-1">
                Identifiant Staff / Email Professionnel
              </label>
              <div className="input-group">
                <span
                  className="input-group-text border-0"
                  style={{ background: '#25211d', color: '#9c958f' }}
                >
                  <i className="bi bi-person-badge-fill"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-0 text-white"
                  style={{ background: '#25211d', fontSize: '13px' }}
                  placeholder="admin@lamitie.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-light mb-0">
                  Code d'accès / Mot de passe
                </label>
              </div>
              <div className="input-group">
                <span
                  className="input-group-text border-0"
                  style={{ background: '#25211d', color: '#9c958f' }}
                >
                  <i className="bi bi-key-fill"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-0 text-white"
                  style={{ background: '#25211d', fontSize: '13px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="btn border-0 text-muted"
                  type="button"
                  style={{ background: '#25211d' }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Vérification des accès...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right fs-5"></i>
                  <span>Accéder à l'Espace Administration</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Staff Selectors for Fast Access */}
          <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
            <div className="text-muted small fw-bold mb-2 text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
              Comptes Staff de Démonstration :
            </div>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-sm btn-dark text-start p-2 rounded-3 d-flex align-items-center justify-content-between border border-secondary border-opacity-25"
                style={{ background: '#1e1a17' }}
                onClick={() => handleQuickFill('admin@lamitie.com')}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-warning text-dark fw-bold">ADMIN</span>
                  <small className="text-light fw-semibold">Direction & Gérance</small>
                </div>
                <small className="text-muted" style={{ fontSize: '11px' }}>admin@lamitie.com</small>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-dark text-start p-2 rounded-3 d-flex align-items-center justify-content-between border border-secondary border-opacity-25"
                style={{ background: '#1e1a17' }}
                onClick={() => handleQuickFill('cuisine@lamitie.com')}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-danger text-white fw-bold">CUISINE</span>
                  <small className="text-light fw-semibold">Chef Grill & Cuisine</small>
                </div>
                <small className="text-muted" style={{ fontSize: '11px' }}>cuisine@lamitie.com</small>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-dark text-start p-2 rounded-3 d-flex align-items-center justify-content-between border border-secondary border-opacity-25"
                style={{ background: '#1e1a17' }}
                onClick={() => handleQuickFill('livreur@lamitie.com')}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-info text-dark fw-bold">LIVREUR</span>
                  <small className="text-light fw-semibold">Livreur Express Moto</small>
                </div>
                <small className="text-muted" style={{ fontSize: '11px' }}>livreur@lamitie.com</small>
              </button>
            </div>
          </div>

          {/* Return to Client Site */}
          <div className="text-center mt-4 pt-2">
            <a
              href="#"
              className="text-secondary small text-decoration-none hover-white d-inline-flex align-items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('home');
              }}
            >
              <i className="bi bi-arrow-left"></i>
              <span>Revenir à la Boutique Client (Restaurant l'Amitié)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
