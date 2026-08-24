import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface RegisterProps {
  setCurrentPage: (page: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ setCurrentPage }) => {
  const { register } = useAuth();
  const { t, isRTL } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setIsSubmitting(true);
    const success = await register(name, email, phone, password);
    setIsSubmitting(false);
    if (success) {
      setCurrentPage('home');
    }
  };

  return (
    <div className="auth-section py-4 py-md-5 bg-light min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="container" style={{ maxWidth: '460px' }}>
        <div className="card border-0 p-4 p-md-5 rounded-4 shadow-sm bg-white">
          <div className="text-center mb-4">
            <span className="fs-2">🍔</span>
            <h1 className="fs-4 fw-extrabold mt-2 mb-1">
              {isRTL ? 'إنشاء حساب زبون جديد' : 'Créer un Compte Client'}
            </h1>
            <p className="text-muted small">
              {isRTL
                ? 'انضم إلينا واستمتع بأشهى برجر سماش وعروض حصرية'
                : 'Rejoignez The Engineer Burger et commandez en quelques clics'}
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {isRTL ? 'الاسم الكامل' : 'Nom & Prénom'}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Karim Bensalem"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">
                {isRTL ? 'البريد الإلكتروني' : 'Adresse Email'}
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="nom@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">
                {isRTL ? 'رقم الهاتف' : 'Numéro de Téléphone'}
              </label>
              <input
                type="tel"
                className="form-control"
                placeholder="0550 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold">
                {isRTL ? 'كلمة المرور' : 'Mot de passe'}
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-3 fw-bold shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isRTL ? 'جارٍ إنشاء الحساب...' : 'Création en cours...')
                : (isRTL ? 'تأكيد التسجيل ➔' : "S'inscrire ➔")}
            </button>
          </form>

          <div className="text-center mt-4">
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
                {t('login')}
              </a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
