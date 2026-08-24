import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/ToastContainer';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { DishDetail } from './pages/DishDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { OrderTracker } from './pages/OrderTracker';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { Favorites } from './pages/Favorites';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { KitchenPortal } from './pages/KitchenPortal';
import { DeliveryPortal } from './pages/DeliveryPortal';
import { MenuItem, Order } from './types';
import './styles/style.css';
import './styles/custom-theme.css';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (user?.role === 'kitchen') return 'kitchen-portal';
    if (user?.role === 'delivery') return 'delivery-portal';
    if (user?.role === 'admin') return 'admin-dashboard';
    return 'home';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDedicatedPortal =
    currentPage === 'admin-dashboard' ||
    currentPage === 'kitchen-portal' ||
    currentPage === 'delivery-portal';

  return (
    <div className="app-container d-flex flex-column min-vh-100 pb-5 pb-lg-0">
      <ToastContainer />

      {/* Hide storefront header on dedicated staff portals */}
      {!isDedicatedPortal && (
        <Header
          currentPage={currentPage}
          setCurrentPage={handleSetCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      <main className="flex-grow-1">
        {currentPage === 'home' && (
          <Home
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
            setSelectedDish={setSelectedDish}
          />
        )}

        {currentPage === 'menu' && (
          <Menu
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSelectedDish={setSelectedDish}
            setCurrentPage={handleSetCurrentPage}
          />
        )}

        {currentPage === 'dish-detail' && (
          <DishDetail dish={selectedDish} setCurrentPage={handleSetCurrentPage} />
        )}

        {currentPage === 'cart' && <Cart setCurrentPage={handleSetCurrentPage} />}

        {currentPage === 'checkout' && (
          <Checkout
            setCurrentPage={handleSetCurrentPage}
            setLastOrder={setSelectedOrder}
          />
        )}

        {currentPage === 'order-success' && (
          <OrderSuccess
            order={selectedOrder}
            setCurrentPage={handleSetCurrentPage}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {currentPage === 'track' && (
          <OrderTracker order={selectedOrder} setCurrentPage={handleSetCurrentPage} />
        )}

        {currentPage === 'customer-dashboard' && (
          <CustomerDashboard
            setCurrentPage={handleSetCurrentPage}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {currentPage === 'orders' && (
          <CustomerDashboard
            setCurrentPage={handleSetCurrentPage}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {currentPage === 'favorites' && (
          <Favorites
            setCurrentPage={handleSetCurrentPage}
            setSelectedDish={setSelectedDish}
          />
        )}

        {currentPage === 'login' && <Login setCurrentPage={handleSetCurrentPage} />}

        {currentPage === 'register' && <Register setCurrentPage={handleSetCurrentPage} />}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboard setCurrentPage={handleSetCurrentPage} />
        )}

        {currentPage === 'kitchen-portal' && (
          <KitchenPortal setCurrentPage={handleSetCurrentPage} />
        )}

        {currentPage === 'delivery-portal' && (
          <DeliveryPortal setCurrentPage={handleSetCurrentPage} />
        )}
      </main>

      {!isDedicatedPortal && <Footer setCurrentPage={handleSetCurrentPage} />}

      {/* Native-like Mobile Bottom Navigation for smartphone views */}
      {!isDedicatedPortal && (
        <MobileBottomNav
          currentPage={currentPage}
          setCurrentPage={handleSetCurrentPage}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;
