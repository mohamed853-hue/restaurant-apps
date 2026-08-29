import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Order } from '../types';

interface MyOrdersProps {
  setCurrentPage: (page: string) => void;
  setSelectedOrder: (order: Order) => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ setCurrentPage, setSelectedOrder }) => {
  const { user } = useAuth();
  const { orders, currency, cancelOrder } = useCart();
  const { isRTL } = useLanguage();

  const [activeFilter, setActiveFilter] = useState<'active' | 'history' | 'all'>('active');

  // Filter orders related to this user (or all local orders if guest)
  const myOrders = orders.filter((o) => {
    if (!user) return true;
    return o.user_id === user.id || (user.phone && o.customer_phone === user.phone);
  });

  const activeOrders = myOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = myOrders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const displayedOrders =
    activeFilter === 'active'
      ? activeOrders
      : activeFilter === 'history'
      ? pastOrders
      : myOrders;

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: isRTL ? 'في انتظار التأكيد' : 'En Attente de Confirmation',
          badgeClass: 'bg-warning text-dark',
          icon: 'bi-hourglass-split',
          step: 1
        };
      case 'confirmed':
        return {
          label: isRTL ? 'تم تأكيد الطلب' : 'Commande Confirmée ✅',
          badgeClass: 'bg-info text-dark',
          icon: 'bi-check2-circle',
          step: 2
        };
      case 'preparing':
        return {
          label: isRTL ? 'قيد التحضير في المطبخ 🔥' : 'En Préparation au Grill 🔥',
          badgeClass: 'bg-primary text-white',
          icon: 'bi-fire',
          step: 3
        };
      case 'ready':
        return {
          label: isRTL ? 'الطلب جاهز للتوصيل 📦' : 'Prête & Emballée 📦',
          badgeClass: 'bg-warning text-dark fw-bold',
          icon: 'bi-box-seam',
          step: 4
        };
      case 'out_for_delivery':
        return {
          label: isRTL ? 'مع رجل التوصيل 🛵' : 'En Cours de Route (Livreur) 🛵',
          badgeClass: 'bg-warning text-dark fw-bold border border-warning shadow-sm',
          icon: 'bi-scooter',
          step: 5
        };
      case 'delivered':
        return {
          label: isRTL ? 'تم التوصيل بنجاح 🎉' : 'Livrée avec Succès 🎉',
          badgeClass: 'bg-success text-white',
          icon: 'bi-bag-check-fill',
          step: 6
        };
      case 'cancelled':
        return {
          label: isRTL ? 'ملغاة ❌' : 'Annulée ❌',
          badgeClass: 'bg-danger text-white',
          icon: 'bi-x-circle-fill',
          step: 0
        };
      default:
        return {
          label: status,
          badgeClass: 'bg-secondary',
          icon: 'bi-info-circle',
          step: 1
        };
    }
  };

  return (
    <div className="my-orders-page py-4 py-md-5 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2 bg-white border shadow-sm">
              <span className="fs-6">🍔</span>
              <span className="fw-bold text-dark" style={{ fontSize: '11px' }}>THE ENGINEER BURGER · OUARGLA</span>
            </div>
            <h1 className="fs-3 fw-extrabold mb-1 text-dark">
              {isRTL ? '🛍️ متابعة وتاريخ طلباتي' : '🛍️ Mes Commandes & Suivi en Direct'}
            </h1>
            <p className="text-muted small mb-0">
              {isRTL
                ? 'تتبع حالة طلبك خطوة بخطوة بالوقت الحقيقي دون الحاجة لتحديث الصفحة'
                : 'Suivez le statut de vos commandes en temps réel sans recharger la page.'}
            </p>
          </div>

          <button
            className="btn btn-primary-custom rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
            onClick={() => setCurrentPage('menu')}
          >
            <i className="bi bi-plus-lg"></i>
            <span>{isRTL ? 'طلب جديد' : 'Nouvelle Commande'}</span>
          </button>
        </div>

        {/* Filters Tabs */}
        <div className="d-flex gap-2 mb-4 p-1 bg-white rounded-pill shadow-sm border" style={{ maxWidth: '420px' }}>
          <button
            className={`btn btn-sm rounded-pill flex-fill fw-bold transition-all ${
              activeFilter === 'active' ? 'btn-primary text-white shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => setActiveFilter('active')}
          >
            🔥 {isRTL ? 'قيد التنفيذ' : 'En Cours'} ({activeOrders.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill flex-fill fw-bold transition-all ${
              activeFilter === 'history' ? 'btn-primary text-white shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => setActiveFilter('history')}
          >
            📜 {isRTL ? 'السجل' : 'Historique'} ({pastOrders.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill flex-fill fw-bold transition-all ${
              activeFilter === 'all' ? 'btn-primary text-white shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            {isRTL ? 'الكل' : 'Toutes'} ({myOrders.length})
          </button>
        </div>

        {/* Orders List */}
        {displayedOrders.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {displayedOrders.map((ord) => {
              const statusInfo = getStatusInfo(ord.status);
              const isActive = ord.status !== 'delivered' && ord.status !== 'cancelled';

              return (
                <div
                  key={ord.id}
                  className={`card border-0 rounded-4 shadow-sm bg-white overflow-hidden ${
                    isActive ? 'border-start border-4 border-warning' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3 p-md-4 border-bottom bg-light bg-opacity-50 d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5 fw-extrabold text-dark">#{ord.order_number}</span>
                        <span className={`badge rounded-pill px-3 py-1 ${statusInfo.badgeClass}`}>
                          <i className={`bi ${statusInfo.icon} me-1`}></i>
                          {statusInfo.label}
                        </span>
                      </div>
                      <small className="text-muted d-block mt-1">
                        <i className="bi bi-clock me-1"></i>
                        {new Date(ord.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="text-end me-2">
                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                          {isRTL ? 'المبلغ الإجمالي' : 'Total payé'}
                        </small>
                        <b className="fs-5 text-primary">{ord.total} {currency}</b>
                      </div>

                      {(ord.status === 'pending' || ord.status === 'confirmed') && (
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm"
                          onClick={() => {
                            if (window.confirm(isRTL ? 'هل أنت متأكد من إلغاء هذا الطلب ؟' : `Voulez-vous vraiment annuler votre commande #${ord.order_number} ?`)) {
                              cancelOrder(ord.id, 'Annulée par le client');
                            }
                          }}
                          title="Annuler cette commande"
                        >
                          <i className="bi bi-x-circle-fill"></i>
                          <span>{isRTL ? 'إلغاء الطلب' : 'Annuler'}</span>
                        </button>
                      )}

                      <button
                        className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setCurrentPage('track');
                        }}
                      >
                        <i className="bi bi-geo-alt-fill text-danger"></i>
                        <span>{isRTL ? 'تتبع مباشر (GPS)' : 'Suivi Live'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 p-md-4">
                    {/* Live Progress Bar for Active Orders */}
                    {isActive && (
                      <div className="mb-4 p-3 rounded-3 bg-light border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="fw-bold text-dark">
                            🚀 {isRTL ? 'حالة الطلب المباشرة :' : 'Progression de la commande :'}
                          </small>
                          <small className="badge bg-white text-dark border fw-bold">
                            {isRTL ? 'يتم التحديث تلقائياً' : 'Mise à jour en temps réel'} ⚡
                          </small>
                        </div>

                        {/* Progress Stepper */}
                        <div className="position-relative my-3">
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-warning progress-bar-striped progress-bar-animated"
                              role="progressbar"
                              style={{
                                width: `${
                                  statusInfo.step === 1
                                    ? 20
                                    : statusInfo.step === 2
                                    ? 40
                                    : statusInfo.step === 3
                                    ? 60
                                    : statusInfo.step === 4
                                    ? 80
                                    : 100
                                }%`
                              }}
                            ></div>
                          </div>

                          <div className="d-flex justify-content-between mt-2 text-center" style={{ fontSize: '11px' }}>
                            <span className={statusInfo.step >= 1 ? 'fw-bold text-dark' : 'text-muted'}>
                              1. Reçue
                            </span>
                            <span className={statusInfo.step >= 2 ? 'fw-bold text-dark' : 'text-muted'}>
                              2. Confirmée ✅
                            </span>
                            <span className={statusInfo.step >= 3 ? 'fw-bold text-primary' : 'text-muted'}>
                              3. Au Grill 🔥
                            </span>
                            <span className={statusInfo.step >= 4 ? 'fw-bold text-dark' : 'text-muted'}>
                              4. Prête 📦
                            </span>
                            <span className={statusInfo.step >= 5 ? 'fw-bold text-warning text-dark' : 'text-muted'}>
                              5. En Livraison 🛵
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items List */}
                    <div className="row g-2 align-items-center mb-3">
                      <div className="col-md-8">
                        <small className="text-muted fw-bold d-block mb-1">
                          {isRTL ? 'الوجبات المطلوبة :' : 'Articles commandés :'}
                        </small>
                        <div className="d-flex flex-wrap gap-1">
                          {ord.items?.map((it, idx) => (
                            <span key={idx} className="badge bg-light text-dark border px-2 py-1">
                              <strong>{it.quantity}x</strong> {it.item_name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="col-md-4 text-md-end">
                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                          <i className="bi bi-geo-alt text-danger me-1"></i>
                          {ord.delivery_address || 'Centre-Ville, Ouargla'}
                        </small>
                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                          <i className="bi bi-credit-card me-1"></i>
                          {ord.payment_method === 'cod' ? 'Paiement à la livraison (Cash)' : 'Payé en ligne'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card border-0 p-5 rounded-4 shadow-sm bg-white text-center">
            <div className="fs-1 mb-3">🍔</div>
            <h3 className="fs-5 fw-bold mb-2">
              {activeFilter === 'active'
                ? isRTL ? 'لا توجد طلبيات جارية حالياً' : 'Aucune commande en cours'
                : isRTL ? 'لا توجد طلبيات سابقة' : 'Aucune commande enregistrée'}
            </h3>
            <p className="text-muted small mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
              {isRTL
                ? 'استكشف قائمة البرجر السماش الفاخرة واطلب وجبتك المفضلة لتصلك ساخنة في ورقلة !'
                : 'Explorez notre carte de smash burgers gourmets et passez votre commande dès maintenant !'}
            </p>
            <div>
              <button
                className="btn btn-primary-custom rounded-pill px-4 py-2 fw-bold shadow-sm"
                onClick={() => setCurrentPage('menu')}
              >
                {isRTL ? 'تصفح قائمة الطعام' : 'Découvrir le Menu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
