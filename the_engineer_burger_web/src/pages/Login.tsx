import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedAvatar } from '../components/AnimatedAvatar';
import { DEMO_USERS } from '../lib/supabase';
import { UserRole } from '../types';

interface LoginProps {
  setCurrentPage: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setCurrentPage }) => {
  const { login, loginAsDemo } = useAuth();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const routeByRole = (role: string) => {
    if (role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else if (role === 'kitchen') {
      setCurrentPage('kitchen-portal');
    } else if (role === 'delivery') {
      setCurrentPage('delivery-portal');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      const lower = email.toLowerCase();
      if (lower.includes('admin')) {
        routeByRole('admin');
      } else if (lower.includes('kitchen')) {
        routeByRole('kitchen');
      } else if (lower.includes('delivery')) {
        routeByRole('delivery');
      } else {
        routeByRole('customer');
      }
    }
  };

  return (
    <div className="auth-section py-4 py-md-5 bg-light min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card border-0 p-4 p-md-5 rounded-4 shadow-sm bg-white">
          
          {/* Animated SVG Avatar */}
          <AnimatedAvatar
            isPasswordFocused={isPasswordFocused}
            emailValue={email}
            isEmailFocused={isEmailFocused}
          />

          <div className="text-center mb-4">
            <h1 className="fs-4 fw-extrabold mb-1">{t('login')}</h1>
            <p className="text-muted small mb-0">
              {isRTL ? 'سجل دخولك لمتابعة طلبياتك وإدارتها' : 'Connectez-vous pour accéder à votre espace'}
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {isRTL ? 'البريد الإلكتروني' : 'Adresse Email'}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="admin@demo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">
                  {isRTL ? 'كلمة المرور' : 'Mot de passe'}
                </label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                />
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-3 fw-bold shadow-sm mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isRTL ? 'جارٍ التحقق...' : 'Connexion en cours...') : t('login')}
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="p-3 rounded-3 bg-light border mt-4">
            <small className="d-block fw-bold text-dark mb-2">
              ⚡ {isRTL ? 'حسابات التجربة السريعة :' : 'Comptes Démo (Connexion & Redirection Directe) :'}
            </small>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-dark text-start p-2 d-flex justify-content-between align-items-center"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  loginAsDemo('admin');
                  routeByRole('admin');
                }}
              >
                <span>👑 <strong>[ADMIN]</strong> Chef Yanis (Gérant)</span>
                <span className="badge bg-warning text-dark">Dashboard ➔</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-dark text-start p-2 d-flex justify-content-between align-items-center"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  loginAsDemo('kitchen');
                  routeByRole('kitchen');
                }}
              >
                <span>👨‍🍳 <strong>[CUISINE]</strong> Chef Karim (Grill)</span>
                <span className="badge bg-danger text-white">Écran KDS ➔</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-dark text-start p-2 d-flex justify-content-between align-items-center"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  loginAsDemo('delivery');
                  routeByRole('delivery');
                }}
              >
                <span>🛵 <strong>[LIVREUR]</strong> Sofiane (Courses)</span>
                <span className="badge bg-info text-dark">Espace Livreur ➔</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-dark text-start p-2 d-flex justify-content-between align-items-center"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  loginAsDemo('customer');
                  routeByRole('customer');
                }}
              >
                <span>🍔 <strong>[CLIENT]</strong> Amine (Boutique)</span>
                <span className="badge bg-light text-dark">Menu ➔</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <small className="text-muted">
              {isRTL ? 'زبون جديد ؟ ' : "Nouveau client ? "}
              <a
                href="#"
                className="text-primary fw-bold text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('register');
                }}
              >
                {isRTL ? 'إنشاء حساب زبون' : 'Créer un compte client'}
              </a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
