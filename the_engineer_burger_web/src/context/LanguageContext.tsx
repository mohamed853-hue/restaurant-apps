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
  brandName: { fr: "Restaurant l'Amitié", ar: 'مطعم الصداقة' },
  brandTagline: { fr: "Saveurs Gourmandes, Grillades & Plats d'Exception", ar: 'أشهى المأكولات والمشويات والبرجر الفاخر' },
  exploreMenu: { fr: 'Notre Menu', ar: 'قائمة الطعام' },
  cart: { fr: 'Panier', ar: 'السلة' },
  login: { fr: 'Connexion Client', ar: 'تسجيل دخول الزبائن' },
  logout: { fr: 'Se Déconnecter', ar: 'تسجيل الخروج' },
  myProfile: { fr: 'Mon Profil', ar: 'حسابي' },
  myOrders: { fr: 'Mes Commandes', ar: 'طلباتي' },
  favorites: { fr: 'Plats Favoris', ar: 'المفضلة' },
  adminDashboard: { fr: 'Administration Privée', ar: 'لوحة تحكم الإدارة' },
  adminPortalTitle: { fr: "Portail Administration & Staff Privé", ar: 'بوابة الإدارة والموظفين الخاصة' },
  switchToStore: { fr: 'Voir la Boutique Client', ar: 'عرض متجر الزبائن' },
  switchToAdmin: { fr: 'Accéder au Dashboard Admin', ar: 'الدخول للوحة الإدارة' },
  freeDeliveryAnnounce: { fr: 'Livraison offerte dès 10 000 FCFA | Code BIENVENUE1000 pour 1 000 FCFA offerts', ar: 'توصيل مجاني للطلبات فوق 10,000 فرنك سيفا | كود BIENVENUE1000 لخصم 1,000 FCFA' },
  
  // Hero
  heroEyebrow: { fr: '🔥 BIENVENUE AU RESTAURANT L\'AMITIÉ', ar: '🔥 مرحباً بكم في مطعم الصداقة' },
  heroTitle1: { fr: 'Le Goût Unique du', ar: 'المذاق الأصيل لـ' },
  heroTitle2: { fr: 'Vrai Repas Gourmet', ar: 'أشهى الأطباق والمشويات' },
  heroDesc: {
    fr: 'Découvrez nos délicieuses grillades, nos burgers gourmets pur bœuf, nos sauces maison secrètes et nos plats authentiques préparés chaque jour avec passion et fraîcheur.',
    ar: 'اكتشف أشهى المشويات الطازجة والبرجر الفاخر والوجبات الشهية المحضرة بمكونات طبيعية طازجة وبكل إتقان.'
  },
  orderNow: { fr: 'Commander Maintenant', ar: 'اطلب الآن' },
  viewFullMenu: { fr: 'Découvrir le Menu', ar: 'استكشف القائمة' },
  servingsCount: { fr: '+15 000 repas préparés avec passion au Restaurant l\'Amitié', ar: '+15,000 وجبة شهية تم تحضيرها بكل حب وإتقان' },

  // Perks
  perk1Title: { fr: '100% Frais & Savoureux', ar: 'طازج وشهي 100%' },
  perk1Desc: { fr: 'Ingrédients sélectionnés', ar: 'مكونات ممتازة يومياً' },
  perk2Title: { fr: 'Préparation Minute', ar: 'تحضير فوري' },
  perk2Desc: { fr: 'Cuit à la commande', ar: 'يُحضر فور طلبك' },
  perk3Title: { fr: 'Livraison Rapide', ar: 'توصيل سريع وساخن' },
  perk3Desc: { fr: 'Sacs thermiques scellés', ar: 'حقائب حرارية مخصصة' },
  perk4Title: { fr: 'Offres Spéciales', ar: 'عروض حصرية' },
  perk4Desc: { fr: 'Code BIENVENUE1000', ar: 'كود BIENVENUE1000' },

  // Categories & Menu
  categoriesTitle: { fr: 'Nos Catégories', ar: 'أقسام القائمة' },
  categoriesDesc: { fr: 'Des grillades authentiques aux burgers et desserts maison', ar: 'من المشويات والبرجر الفاخر إلى الحلويات والمشروبات' },
  bestsellersTitle: { fr: 'Nos Plats Phares ⭐', ar: 'الأطباق الأكثر طلباً ⭐' },
  bestsellersDesc: { fr: "Les spécialités plébiscitées par nos clients fidèles", ar: 'المفضلة لدى زبائننا الكرام' },
  allDishes: { fr: 'Tous les Plats', ar: 'جميع الأطباق' },
  vegOnly: { fr: 'Végétarien uniquement', ar: 'أطباق نباتية فقط' },
  searchPlaceholder: { fr: 'Rechercher grillades, burgers, frites, sauces, jus...', ar: 'ابحث عن مشويات، برجر، أطباق، عصير...' },
  add: { fr: 'Ajouter', ar: 'إضافة' },
  addToCart: { fr: 'Ajouter au Panier', ar: 'إضافة إلى السلة' },
  prepTime: { fr: 'Temps de préparation', ar: 'مدة التحضير' },
  spiceLevel: { fr: 'Niveau Épicé', ar: 'درجة الحرارة' },
  specialNotes: { fr: 'Instructions spéciales (Optionnel)', ar: 'ملاحظات خاصة (اختياري)' },
  reviewsTitle: { fr: 'Avis & Évaluations Clients ⭐', ar: 'تقييمات وآراء الزبائن ⭐' },
  leaveReview: { fr: 'Laisser un Avis', ar: 'أضف تقييمك' },
  publishReview: { fr: 'Publier mon avis', ar: 'نشر التقييم' },

  // Cart & Checkout
  cartTitle: { fr: 'Votre Panier Gourmand', ar: 'سلة المشتريات' },
  emptyCart: { fr: 'Votre panier est vide', ar: 'سلتك فارغة حالياً' },
  emptyCartDesc: { fr: 'Parcourez notre carte et découvrez les délices du Restaurant l\'Amitié !', ar: 'تصفح القائمة واختر وجبتك المفضلة من مطعم الصداقة !' },
  subtotal: { fr: 'Sous-total', ar: 'المجموع الفرعي' },
  discountCoupon: { fr: 'Réduction Coupon', ar: 'خصم الكوبون' },
  deliveryFee: { fr: 'Frais de Livraison', ar: 'تكلفة التوصيل' },
  freeDelivery: { fr: 'GRATUIT 🎉', ar: 'مجاني 🎉' },
  totalToPay: { fr: 'Total à Payer', ar: 'المجموع الإجمالي' },
  checkoutBtn: { fr: 'Passer la Commande', ar: 'إتمام الطلب' },
  applyCoupon: { fr: 'Appliquer', ar: 'تطبيق' },
  couponPlaceholder: { fr: 'Code Promo (ex: BIENVENUE1000)', ar: 'كود الخصم (مثال: BIENVENUE1000)' },

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
  cashOnDelivery: { fr: 'Paiement à la Livraison (Espèces / Cash)', ar: 'الدفع نقداً عند الاستلام (كاش)' },
  baridimob: { fr: 'Paiement Mobile / Wave / Orange Money', ar: 'الدفع عبر الهاتف / محفظة إلكترونية' },
  cardCIB: { fr: 'Carte Bancaire / Visa / Mastercard', ar: 'بطاقة بنكية / فيزا' },
  confirmOrder: { fr: 'Confirmer la Commande', ar: 'تأكيد الطلب الآن' },

  // Order Tracker
  trackingTitle: { fr: 'Suivi de Commande en Direct', ar: 'تتبع حالة الطلب المباشر' },
  stepPending: { fr: 'Reçue', ar: 'تم الاستلام' },
  stepConfirmed: { fr: 'Confirmée', ar: 'تم التأكيد' },
  stepKitchen: { fr: 'En Cuisine (Grill)', ar: 'قيد التحضير في المطبخ' },
  stepDelivery: { fr: 'En Livraison', ar: 'مع رجل التوصيل' },
  stepDelivered: { fr: 'Livrée avec Succès', ar: 'تم التوصيل بنجاح' },
  estimatedArrival: { fr: 'Arrivée Estimée', ar: 'الوقت التقديري للوصول' },
  liveGpsSim: { fr: 'Trajet en Direct (Simulation GPS)', ar: 'مسار التوصيل المباشر (GPS)' },
  callRider: { fr: 'Appeler le Livreur', ar: 'اتصال برجل التوصيل' },

  // Dashboard Staff
  staffPortal: { fr: "Restaurant l'Amitié · Espace Staff & Gestion", ar: 'فضاء إدارة مطعم الصداقة والموظفين' },
  tabOverview: { fr: 'Vue d\'ensemble', ar: 'نظرة عامة' },
  tabOrders: { fr: 'Commandes', ar: 'الطلبات' },
  tabKitchen: { fr: 'File Cuisine (Grill)', ar: 'طلبات المطبخ' },
  tabDelivery: { fr: 'File Livraison', ar: 'طلبات التوصيل' },
  tabMenu: { fr: 'Gestion du Menu', ar: 'إدارة الوجبات' },
  tabCoupons: { fr: 'Codes Promo', ar: 'أكواد الخصم' },
  tabStaff: { fr: 'Équipe & Staff', ar: 'طاقم العمل والموظفين' },
  tabCashSettlement: { fr: 'Caisse & Livreurs', ar: 'صندوق التسليم والسائقين' },
  tabSettings: { fr: 'Paramètres Restaurant', ar: 'إعدادات المطعم' },
  startCooking: { fr: 'Lancer la Cuisson', ar: 'بدء الطهي والتحضير' },
  markReady: { fr: 'Marquer Prêt pour Livraison', ar: 'تحديد كـ جاهز للتوصيل' },
  startDelivery: { fr: 'Démarrer la Course', ar: 'بدء التوصيل' },
  markDelivered: { fr: 'Marquer comme Livré', ar: 'تحديد كـ تم التوصيل' },
  revenueToday: { fr: 'Chiffre d\'Affaires', ar: 'إجمالي المبيعات' },
  activeKitchen: { fr: 'En Cuisine', ar: 'في المطبخ حالياً' },
  exportCsvBtn: { fr: 'Exporter en CSV', ar: 'تصدير كملف CSV' },
  
  // Users & Stock & Additional Translations
  tabUsers: { fr: 'Utilisateurs & Clients', ar: 'الزبائن والمستخدمين' },
  orderHistory: { fr: 'Historique des Commandes', ar: 'سجل الطلبات' },
  available: { fr: 'Disponible', ar: 'متوفر' },
  outOfStock: { fr: 'Épuisé (Rupture)', ar: 'نفدت الكمية' },
  confirmAssign: { fr: 'Assigner au Livreur', ar: 'إسناد لرجل التوصيل' },
  orderSuccessThankYou: { fr: "Merci pour votre commande chez Restaurant l'Amitié !", ar: 'شكراً لطلبكم من مطعم الصداقة !' },
  orderSuccessDesc: { fr: 'Votre repas est préparé avec des ingrédients frais du jour.', ar: 'وجبتكم تُحضر بمكونات طازجة يومياً بكل إتقان.' }
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
    const saved = localStorage.getItem('amitie_restaurant_lang') || localStorage.getItem('engineer_burger_lang');
    return (saved === 'ar' || saved === 'fr') ? saved : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('amitie_restaurant_lang', lang);
  };

  const isRTL = language === 'ar';
  const currency = 'FCFA';

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
