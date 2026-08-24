import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar';

export interface Translations {
  [key: string]: {
    fr: string;
    ar: string;
  };
}

export const translations = {
  // Navigation & Brand
  brandName: { fr: 'The Engineer Burger', ar: 'برجر المهندس' },
  brandTagline: { fr: 'L\'Art de l\'Ingénierie Culinaire & Smash Burgers', ar: 'فن الهندسة الغذائية وأشهى سماش برجر في الجزائر' },
  exploreMenu: { fr: 'Notre Menu', ar: 'قائمة الطعام' },
  cart: { fr: 'Panier', ar: 'السلة' },
  login: { fr: 'Connexion', ar: 'تسجيل الدخول' },
  logout: { fr: 'Se Déconnecter', ar: 'تسجيل الخروج' },
  myProfile: { fr: 'Mon Profil', ar: 'حسابي' },
  myOrders: { fr: 'Mes Commandes', ar: 'طلباتي' },
  favorites: { fr: 'Plats Favoris', ar: 'المفضلة' },
  adminDashboard: { fr: 'Dashboard Staff & Admin', ar: 'لوحة تحكم الإدارة والموظفين' },
  switchToStore: { fr: 'Voir la Boutique Client', ar: 'عرض متجر الزبائن' },
  switchToAdmin: { fr: 'Accéder au Dashboard Admin', ar: 'الدخول للوحة الإدارة' },
  freeDeliveryAnnounce: { fr: 'Livraison offerte dès 2500 DA | Utilisez WELCOME300 pour 300 DA offerts', ar: 'توصيل مجاني للطلبات فوق 2500 د.ج | استخدم كود WELCOME300 لخصم 300 د.ج' },
  
  // Hero
  heroEyebrow: { fr: '🔥 LE NUMÉRO 1 DU SMASH BURGER À ALGER', ar: '🔥 الرقم 1 في السماش برجر في الجزائر العاصمة' },
  heroTitle1: { fr: 'L\'Ingénierie du', ar: 'هندسة' },
  heroTitle2: { fr: 'Vrai Burger Gourmet', ar: 'البرجر الفاخر الحقيقي' },
  heroDesc: {
    fr: 'Découvrez nos smash burgers pur bœuf croustillants aux bords dorés, nos pains briochés toastés au beurre et nos sauces secrètes.',
    ar: 'اكتشف أشهى برجر سماش بلحم بقري طازج 100%، خبز بريوش محمص بالزبدة وصلصات المهندس السرية الخاصة.'
  },
  orderNow: { fr: 'Commander Maintenant', ar: 'اطلب الآن' },
  viewFullMenu: { fr: 'Découvrir le Menu', ar: 'استكشف القائمة' },
  servingsCount: { fr: '+12 500 burgers smash servis avec passion', ar: '+12,500 برجر تم تحضيرها بكل إتقان' },

  // Perks
  perk1Title: { fr: '100% Bœuf Frais', ar: 'لحم بقري طازج 100%' },
  perk1Desc: { fr: 'Jamais de congelé', ar: 'طازج يومياً بدون تجميد' },
  perk2Title: { fr: 'Préparation Minute', ar: 'تحضير فوري' },
  perk2Desc: { fr: 'Smashé à la commande', ar: 'يُشوى فور طلبك' },
  perk3Title: { fr: 'Livraison Chaude', ar: 'توصيل ساخن وسريع' },
  perk3Desc: { fr: 'Sacs thermiques scellés', ar: 'حقائب حرارية مخصصة' },
  perk4Title: { fr: 'Offres Exclusives', ar: 'عروض حصرية' },
  perk4Desc: { fr: 'Code WELCOME300', ar: 'كود خصم WELCOME300' },

  // Categories & Menu
  categoriesTitle: { fr: 'Nos Catégories', ar: 'أقسام القائمة' },
  categoriesDesc: { fr: 'Du smash burger gourmet aux desserts maison', ar: 'من السماش برجر الفاخر إلى التحليات اللذيذة' },
  bestsellersTitle: { fr: 'Nos Plats Phares ⭐', ar: 'الأطباق الأكثر طلباً ⭐' },
  bestsellersDesc: { fr: 'Les favoris plébiscités par nos clients à Hydra & Alger', ar: 'المفضلة لدى زبائننا في حيدرة والجزائر' },
  allDishes: { fr: 'Tous les Plats', ar: 'جميع الأطباق' },
  vegOnly: { fr: 'Végétarien uniquement', ar: 'أطباق نباتية فقط' },
  searchPlaceholder: { fr: 'Rechercher burgers, smash, frites, sauces...', ar: 'ابحث عن برجر، سماش، بطاطا، صلصات...' },
  add: { fr: 'Ajouter', ar: 'إضافة' },
  addToCart: { fr: 'Ajouter au Panier', ar: 'إضافة إلى السلة' },
  prepTime: { fr: 'Temps de cuisson', ar: 'مدة التحضير' },
  spiceLevel: { fr: 'Niveau Épicé', ar: 'درجة الحرارة' },
  specialNotes: { fr: 'Instructions spéciales (Optionnel)', ar: 'ملاحظات خاصة (اختياري)' },
  reviewsTitle: { fr: 'Avis & Évaluations Clients ⭐', ar: 'تقييمات وآراء الزبائن ⭐' },
  leaveReview: { fr: 'Laisser un Avis', ar: 'أضف تقييمك' },
  publishReview: { fr: 'Publier mon avis', ar: 'نشر التقييم' },

  // Cart & Checkout
  cartTitle: { fr: 'Votre Panier Gourmet', ar: 'سلة المشتريات' },
  emptyCart: { fr: 'Votre panier est vide', ar: 'سلتك فارغة حالياً' },
  emptyCartDesc: { fr: 'Parcourez notre carte et ajoutez vos smash burgers préférés !', ar: 'تصفح القائمة واختر وجبتك المفضلة !' },
  subtotal: { fr: 'Sous-total', ar: 'المجموع الفرعي' },
  discountCoupon: { fr: 'Réduction Coupon', ar: 'خصم الكوبون' },
  deliveryFee: { fr: 'Frais de Livraison', ar: 'تكلفة التوصيل' },
  freeDelivery: { fr: 'GRATUIT 🎉', ar: 'مجاني 🎉' },
  totalToPay: { fr: 'Total à Payer', ar: 'المجموع الإجمالي' },
  checkoutBtn: { fr: 'Passer la Commande', ar: 'إتمام الطلب' },
  applyCoupon: { fr: 'Appliquer', ar: 'تطبيق' },
  couponPlaceholder: { fr: 'Code Promo (ex: WELCOME300)', ar: 'كود الخصم (مثال: WELCOME300)' },

  // Checkout Form
  checkoutTitle: { fr: 'Finaliser votre Commande', ar: 'تأكيد ودفع الطلب' },
  orderType: { fr: 'Mode de Commande', ar: 'نوع الطلب' },
  homeDelivery: { fr: 'Livraison à Domicile', ar: 'توصيل إلى المنزل' },
  pickup: { fr: 'À Emporter / Retrait au Comptoir', ar: 'استلام من المطعم' },
  customerInfo: { fr: 'Coordonnées du Client', ar: 'معلومات الزبون' },
  fullName: { fr: 'Nom Complet', ar: 'الاسم الكامل' },
  phone: { fr: 'Numéro de Téléphone', ar: 'رقم الهاتف' },
  deliveryAddress: { fr: 'Adresse de Livraison Complète', ar: 'عنوان التوصيل بالتفصيل' },
  orderNotes: { fr: 'Notes pour la Cuisine ou le Livreur', ar: 'ملاحظات للمطبخ أو رجل التوصيل' },
  paymentMethod: { fr: 'Mode de Paiement', ar: 'طريقة الدفع' },
  cashOnDelivery: { fr: 'Paiement à la Livraison (Cash)', ar: 'الدفع نقداً عند الاستلام (كاش)' },
  baridimob: { fr: 'BaridiMob (Algérie Poste)', ar: 'بريدي موب (بريد الجزائر)' },
  cardCIB: { fr: 'Carte CIB / Edahabia', ar: 'البطاقة الذهبية / CIB' },
  confirmOrder: { fr: 'Confirmer la Commande', ar: 'تأكيد الطلب الآن' },

  // Order Tracker
  trackingTitle: { fr: 'Suivi de Commande en Direct', ar: 'تتبع حالة الطلب المباشر' },
  stepPending: { fr: 'Reçue', ar: 'تم الاستلام' },
  stepConfirmed: { fr: 'Confirmée', ar: 'تم التأكيد' },
  stepKitchen: { fr: 'En Cuisine (Grill)', ar: 'قيد الشواء في المطبخ' },
  stepDelivery: { fr: 'En Livraison', ar: 'مع رجل التوصيل' },
  stepDelivered: { fr: 'Livrée avec Succès', ar: 'تم التوصيل بنجاح' },
  estimatedArrival: { fr: 'Arrivée Estimée', ar: 'الوقت التقديري للوصول' },
  liveGpsSim: { fr: 'Trajet en Direct (Simulation GPS)', ar: 'مسار التوصيل المباشر (GPS)' },
  callRider: { fr: 'Appeler le Livreur', ar: 'اتصال برجل التوصيل' },

  // Dashboard Staff
  staffPortal: { fr: 'Espace Staff & Gestion', ar: 'فضاء إدارة المطعم والموظفين' },
  tabOverview: { fr: 'Vue d\'ensemble', ar: 'نظرة عامة' },
  tabOrders: { fr: 'Commandes', ar: 'الطلبات' },
  tabKitchen: { fr: 'File Cuisine (Grill)', ar: 'طلبات المطبخ' },
  tabDelivery: { fr: 'File Livraison', ar: 'طلبات التوصيل' },
  tabMenu: { fr: 'Gestion du Menu', ar: 'إدارة الوجبات' },
  tabCoupons: { fr: 'Codes Promo', ar: 'أكواد الخصم' },
  tabSettings: { fr: 'Paramètres Restaurant', ar: 'إعدادات المطعم' },
  startCooking: { fr: 'Lancer la Cuisson (Grill)', ar: 'بدء الشواء والتحضير' },
  markReady: { fr: 'Marquer Prêt pour Livraison', ar: 'تحديد كـ جاهز للتوصيل' },
  startDelivery: { fr: 'Démarrer la Course', ar: 'بدء التوصيل' },
  markDelivered: { fr: 'Marquer comme Livré', ar: 'تحديد كـ تم التوصيل' },
  revenueToday: { fr: 'Chiffre d\'Affaires', ar: 'إجمالي المبيعات' },
  activeKitchen: { fr: 'En Cuisine', ar: 'في المطبخ حالياً' },
  exportCsvBtn: { fr: 'Exporter en CSV', ar: 'تصدير كملف CSV' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
  currency: string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('engineer_burger_lang');
    return (saved === 'ar' || saved === 'fr') ? saved : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('engineer_burger_lang', lang);
  };

  const isRTL = language === 'ar';
  const currency = language === 'ar' ? 'د.ج' : 'DA';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (isRTL) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }, [language, isRTL]);

  const t = (key: keyof typeof translations): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].fr;
    }
    return String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currency, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
