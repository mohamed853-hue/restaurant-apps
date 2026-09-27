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
import { MyOrders } from './pages/MyOrders';
import { Favorites } from './pages/Favorites';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { KitchenPortal } from './pages/KitchenPortal';
import { DeliveryPortal } from './pages/DeliveryPortal';
import { MenuItem, Order } from './types';
import './styles/style.css';
import './styles/custom-theme.css';

const resolvePageFromLocation = (): string => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  const portal = search.get('portal')?.toLowerCase() || search.get('role')?.toLowerCase() || search.get('page')?.toLowerCase();

  if (path.startsWith('/admin/login') || path.startsWith('/admin-login')) return 'admin-login';
  if (portal === 'admin' || path.startsWith('/admin') || hash.includes('admin')) return 'admin-dashboard';
  if (portal === 'delivery' || portal === 'livreur' || path.startsWith('/delivery') || path.startsWith('/livreur') || hash.includes('delivery') || hash.includes('livreur')) return 'delivery-portal';
  if (portal === 'kitchen' || portal === 'cuisine' || path.startsWith('/kitchen') || path.startsWith('/cuisine') || hash.includes('kitchen') || hash.includes('cuisine')) return 'kitchen-portal';
  if (path.startsWith('/menu') || hash.includes('menu')) return 'menu';
  if (path.startsWith('/cart') || hash.includes('cart') || path.startsWith('/panier')) return 'cart';
  if (path.startsWith('/checkout') || hash.includes('checkout')) return 'checkout';
  if (path.startsWith('/track') || hash.includes('track')) return 'track';
  if (path.startsWith('/favorites') || hash.includes('favorites')) return 'favorites';
  if (path.startsWith('/orders') || hash.includes('orders') || path.startsWith('/commandes')) return 'orders';
  if (path.startsWith('/customer-dashboard') || path.startsWith('/profile') || hash.includes('profile')) return 'customer-dashboard';
  if (path.startsWith('/login') || hash.includes('login')) return 'login';
  if (path.startsWith('/register') || hash.includes('register')) return 'register';
  return 'home';
};

const pageToPathMap: Record<string, string> = {
  'home': '/',
  'menu': '/menu',
  'dish-detail': '/menu',
  'cart': '/cart',
  'checkout': '/checkout',
  'order-success': '/order-success',
  'track': '/track',
  'customer-dashboard': '/profile',
  'orders': '/orders',
  'favorites': '/favorites',
  'login': '/login',
  'register': '/register',
  'admin-login': '/admin/login',
  'admin-dashboard': '/admin',
  'kitchen-portal': '/kitchen',
  'delivery-portal': '/delivery'
};

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(() => resolvePageFromLocation());

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync state with URL changes (back/forward or hash change)
  React.useEffect(() => {
    const handleUrlChange = () => {
      const page = resolvePageFromLocation();
      setCurrentPage(page);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
    const targetPath = pageToPathMap[page] || '/';
    if (window.location.pathname !== targetPath) {
      try {
        window.history.pushState(null, '', targetPath);
      } catch {
        // Fallback for isolated webview contexts
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDedicatedPortal =
    currentPage === 'admin-dashboard' ||
    currentPage === 'kitchen-portal' ||
    currentPage === 'delivery-portal' ||
    currentPage === 'admin-login';

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

        {(currentPage === 'orders' || currentPage === 'my-orders') && (
          <MyOrders
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

        {currentPage === 'admin-login' && <AdminLogin setCurrentPage={handleSetCurrentPage} />}

        {currentPage === 'admin-dashboard' && (
          (user?.role === 'admin' || user?.role === 'staff') ? (
            <AdminDashboard setCurrentPage={handleSetCurrentPage} />
          ) : (
            <AdminLogin setCurrentPage={handleSetCurrentPage} />
          )
        )}

        {currentPage === 'kitchen-portal' && (
          (user?.role === 'kitchen' || user?.role === 'admin') ? (
            <KitchenPortal setCurrentPage={handleSetCurrentPage} />
          ) : (
            <AdminLogin setCurrentPage={handleSetCurrentPage} />
          )
        )}

        {currentPage === 'delivery-portal' && (
          (user?.role === 'delivery' || user?.role === 'admin') ? (
            <DeliveryPortal setCurrentPage={handleSetCurrentPage} />
          ) : (
            <AdminLogin setCurrentPage={handleSetCurrentPage} />
          )
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
