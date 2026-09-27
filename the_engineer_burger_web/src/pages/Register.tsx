import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface RegisterProps {
  setCurrentPage: (page: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ setCurrentPage }) => {
  const { register } = useAuth();
  const { isRTL } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLoading(false);
          const coords = `Quartier Amitié (GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
          setAddress(coords);
        },
        (err) => {
          setGpsLoading(false);
          console.warn('GPS location access rejected or unavailable', err);
          setAddress('Quartier Amitié');
        }
      );
    } else {
      setAddress('Quartier Amitié');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        isRTL ? 'كلمتا المرور غير متطابقتين !' : 'Les deux mots de passe ne correspondent pas !'
      );
      return;
    }

    if (password.length < 4) {
      setErrorMessage(
        isRTL ? 'كلمة المرور يجب أن تحتوي على 4 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 4 caractères.'
      );
      return;
    }

    setIsSubmitting(true);
    const created = await register(name, email, phone, password, address || 'Quartier Amitié');
    setIsSubmitting(false);

    if (created) {
      setCurrentPage('home');
    }
  };

  return (
    <div className="auth-section py-4 py-md-5 bg-light min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card border-0 p-4 p-md-5 rounded-4 shadow-sm bg-white position-relative overflow-hidden">
          
          {/* Glowing Brand Header */}
          <div className="text-center mb-3">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '1px solid #fde68a'
              }}
            >
              <span className="fs-6">🍲</span>
              <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '11px' }}>RESTAURANT L'AMITIÉ</span>
            </div>

            <h2
              className="fw-extrabold text-uppercase tracking-wider mb-0"
              style={{
                fontSize: '22px',
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, #ea580c, #f59e0b, #d97706, #ea580c)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shineGradient 3s linear infinite',
                filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.25))'
              }}
            >
              Restaurant l'Amitié
            </h2>
            <p className="text-muted small mt-1 mb-0">
              {isRTL ? 'أنشئ حسابك واستمتع بأشهى المشويات والأطباق الفاخرة' : 'Rejoignez Restaurant l\'Amitié et commandez en quelques clics'}
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {isRTL ? 'الاسم الكامل' : 'Nom & Prénom'} *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-person text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Ex: Moussa Traoré"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">
                {isRTL ? 'البريد الإلكتروني' : 'Adresse Email'} *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="nom@domaine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">
                {isRTL ? 'رقم الهاتف' : 'Numéro de Téléphone'} *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-telephone text-muted"></i>
                </span>
                <input
                  type="tel"
                  className="form-control border-start-0"
                  placeholder="77 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Address with GPS Button */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">
                  {isRTL ? 'عنوان التوصيل' : 'Adresse de Livraison'}
                </label>
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary small text-decoration-none fw-bold d-flex align-items-center gap-1"
                  style={{ fontSize: '11px' }}
                  onClick={handleDetectLocation}
                >
                  <i className="bi bi-crosshair text-danger"></i>
                  <span>{gpsLoading ? 'Localisation...' : '📍 Détecter GPS'}</span>
                </button>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Quartier Amitié 2, Villa 45..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Password with Eye */}
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {isRTL ? 'كلمة المرور' : 'Mot de passe'} *
              </label>
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
                  required
                />
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password with Eye */}
            <div className="mb-4">
              <label className="form-label small fw-bold">
                {isRTL ? 'تأكيد كلمة المرور' : 'Confirmer le Mot de passe'} *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-shield-lock text-muted"></i>
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-3 fw-bold shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isRTL ? 'جارٍ إنشاء الحساب...' : 'Création du compte...')
                : (isRTL ? 'تأكيد التسجيل وإنشاء الحساب ➔' : 'Créer Mon Compte ➔')}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <small className="text-muted">
              {isRTL ? 'لديك حساب بالفعل ؟ ' : 'Vous avez déjà un compte ? '}
              <a
                href="#"
                className="text-primary fw-bold text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('login');
                }}
              >
                {isRTL ? 'تسجيل الدخول' : 'Se connecter'}
              </a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
