import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedAvatar } from '../components/AnimatedAvatar';

interface LoginProps {
  setCurrentPage: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setCurrentPage }) => {
  const { login } = useAuth();
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
    const loggedUser = await login(email, password);
    setIsSubmitting(false);

    if (loggedUser) {
      routeByRole(loggedUser.role);
    }
  };

  return (
    <div className="auth-section py-4 py-md-5 bg-light min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="container" style={{ maxWidth: '460px' }}>
        <div className="card border-0 p-4 p-md-5 rounded-4 shadow-sm bg-white position-relative overflow-hidden">
          
          {/* Glowing Animated Brand Header (Orange Doré & Effet Lumineux) */}
          <div className="text-center mb-3">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '1px solid #fde68a'
              }}
            >
              <span className="fs-6">🍔</span>
              <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '11px' }}>OUARGLA · ورقلة</span>
            </div>

            {/* Shimmering Animated Brand Title */}
            <h2
              className="fw-extrabold text-uppercase tracking-wider mb-0"
              style={{
                fontSize: '24px',
                letterSpacing: '1.5px',
                background: 'linear-gradient(90deg, #ea580c, #f59e0b, #d97706, #ea580c)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shineGradient 3s linear infinite',
                filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.25))'
              }}
            >
              The Engineer Burger
            </h2>
            <small className="text-muted d-block mt-1" style={{ fontSize: '12px', fontWeight: 600 }}>
              {isRTL ? 'فن البرجر السماش الفاخر' : 'L\'Ingénierie du Smash Burger Gourmet'}
            </small>
          </div>

          {/* Animated SVG Avatar (Yéti Interactif) */}
          <div className="mb-2">
            <AnimatedAvatar
              isPasswordFocused={isPasswordFocused}
              emailValue={email}
              isEmailFocused={isEmailFocused}
            />
          </div>

          <div className="text-center mb-4">
            <h1 className="fs-5 fw-extrabold mb-1">{t('login')}</h1>
            <p className="text-muted small mb-0">
              {isRTL ? 'أدخل بريدك الإلكتروني وكلمة المرور' : 'Entrez vos identifiants pour vous connecter'}
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
                  placeholder="votre-email@domaine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
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
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-3 fw-bold shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isRTL ? 'جارٍ التحقق والدخول...' : 'Connexion en cours...')
                : (isRTL ? 'تسجيل الدخول ➔' : 'Se Connecter ➔')}
            </button>
          </form>

          {/* Clean registration footer (NO ROLE BUTTONS) */}
          <div className="text-center mt-4 pt-3 border-top">
            <small className="text-muted">
              {isRTL ? 'ليس لديك حساب بعد ؟ ' : 'Nouveau client ? '}
              <a
                href="#"
                className="text-primary fw-bold text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('register');
                }}
              >
                {isRTL ? 'إنشاء حساب زبون جديد' : 'Créer un compte client'}
              </a>
            </small>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shineGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};
