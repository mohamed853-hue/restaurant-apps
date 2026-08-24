import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, Coupon, Order, RestaurantSettings } from '../types';
import { supabase, DEFAULT_SETTINGS, INITIAL_COUPONS, INITIAL_MENU_ITEMS } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  settings: RestaurantSettings;
  favorites: string[]; // item ids
  orders: Order[];
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, instructions?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  placeOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status'], deliveryUserId?: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshMenuItems: () => Promise<void>;
  updateSettings: (newSettings: RestaurantSettings) => Promise<void>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  cartCount: number;
  currency: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('engineer_burger_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('engineer_burger_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('engineer_burger_favorites');
    return saved ? JSON.parse(saved) : ['m1111111-1111-1111-1111-111111111111', 'm2222222-2222-2222-2222-222222222222'];
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem('engineer_burger_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('engineer_burger_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('engineer_burger_orders');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'o1111111-1111-1111-1111-111111111111',
            order_number: 'EB260801A1',
            user_id: '11111111-1111-1111-1111-111111111111',
            customer_name: 'Amine Khelifi',
            customer_phone: '0550000001',
            delivery_address: 'Résidence Les Palmiers, Hydra, Alger',
            order_type: 'delivery',
            subtotal: 2050,
            discount: 300,
            delivery_fee: 0,
            tax: 0,
            total: 1750,
            coupon_code: 'WELCOME300',
            payment_method: 'baridimob',
            payment_status: 'paid',
            status: 'delivered',
            estimated_minutes: 25,
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            items: [
              { item_name: 'Double Engineer Burger', item_price: 950, quantity: 1 },
              { item_name: 'Architect Smash Burger', item_price: 1100, quantity: 1 }
            ]
          },
          {
            id: 'o2222222-2222-2222-2222-222222222222',
            order_number: 'EB260824B2',
            user_id: '11111111-1111-1111-1111-111111111111',
            customer_name: 'Amine Khelifi',
            customer_phone: '0550000001',
            delivery_address: 'Résidence Les Palmiers, Hydra, Alger',
            order_type: 'delivery',
            subtotal: 1450,
            discount: 0,
            delivery_fee: 250,
            tax: 0,
            total: 1700,
            payment_method: 'cod',
            payment_status: 'pending',
            status: 'preparing',
            estimated_minutes: 20,
            created_at: new Date(Date.now() - 15 * 60000).toISOString(),
            items: [
              { item_name: 'Architect Smash Burger', item_price: 1100, quantity: 1 },
              { item_name: 'Frites Maison & Sauce Fromagère', item_price: 350, quantity: 1 }
            ]
          }
        ];
  });

  useEffect(() => {
    localStorage.setItem('engineer_burger_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('engineer_burger_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('engineer_burger_coupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('engineer_burger_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('engineer_burger_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    refreshMenuItems();
    refreshOrders();
  }, []);

  const refreshMenuItems = async () => {
    try {
      const { data, error } = await supabase.from('menu_items').select('*').eq('status', 1);
      if (!error && data && data.length > 0) {
        setMenuItems(data);
        localStorage.setItem('engineer_burger_menu', JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Using local menu items', e);
    }
  };

  const refreshOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: Order[] = data.map((o: any) => ({
          ...o,
          items: o.order_items || []
        }));
        setOrders(formatted);
        localStorage.setItem('engineer_burger_orders', JSON.stringify(formatted));
      }
    } catch (e) {
      console.warn('Using local orders state', e);
    }
  };

  const addToCart = (item: MenuItem, quantity = 1, instructions = '') => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + quantity, instructions: instructions || ci.instructions }
            : ci
        );
      }
      return [...prev, { item, quantity, instructions }];
    });
    addToast('success', `Ajouté au panier : ${item.name} (${quantity}x)`);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) => prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci)));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
    addToast('info', 'Article retiré du panier.');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations matching PHP functions.php
  const subtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (subtotal >= appliedCoupon.minimum_order) {
      discount =
        appliedCoupon.type === 'percent'
          ? (subtotal * appliedCoupon.value) / 100
          : appliedCoupon.value;

      if (appliedCoupon.max_discount) {
        discount = Math.min(discount, appliedCoupon.max_discount);
      }
      discount = Math.min(discount, subtotal);
    }
  }

  const deliveryFee =
    subtotal === 0 || subtotal >= settings.free_delivery_threshold ? 0 : settings.delivery_fee;

  const tax = Math.round((subtotal - discount) * (settings.tax_rate / 100));
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);
  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('status', 1)
        .single();

      if (!error && data) {
        if (subtotal < data.minimum_order) {
          addToast('warning', `Commande minimale de ${data.minimum_order} ${settings.currency} requise pour ce coupon.`);
          return false;
        }
        setAppliedCoupon(data);
        addToast('success', `Coupon appliqué ! Réduction de ${data.type === 'percent' ? data.value + '%' : data.value + ' ' + settings.currency}`);
        return true;
      }
    } catch (e) {
      console.warn('Coupon fallback check', e);
    }

    // Local fallback
    const matched = INITIAL_COUPONS.find((c) => c.code === cleanCode);
    if (matched) {
      if (subtotal < matched.minimum_order) {
        addToast('warning', `Commande minimale de ${matched.minimum_order} ${settings.currency} requise pour ce coupon.`);
        return false;
      }
      setAppliedCoupon(matched);
      addToast('success', `Coupon appliqué ! Réduction de ${matched.type === 'percent' ? matched.value + '%' : matched.value + ' ' + settings.currency}`);
      return true;
    }

    addToast('error', 'Code promo invalide ou expiré.');
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('info', 'Coupon retiré.');
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(itemId);
      const next = exists ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      addToast(exists ? 'info' : 'success', exists ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️');
      return next;
    });
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  const placeOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    const orderNumber = 'EB' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      order_number: orderNumber,
      user_id: user?.id,
      customer_name: orderData.customer_name || user?.name || 'Client',
      customer_phone: orderData.customer_phone || user?.phone || '0550000000',
      delivery_address: orderData.delivery_address || 'Hydra, Alger',
      order_type: orderData.order_type || 'delivery',
      subtotal,
      discount,
      delivery_fee: orderData.order_type === 'delivery' ? deliveryFee : 0,
      tax,
      total: orderData.order_type === 'delivery' ? total : total - deliveryFee,
      coupon_code: appliedCoupon?.code,
      payment_method: orderData.payment_method || 'cod',
      payment_status: orderData.payment_method === 'baridimob' || orderData.payment_method === 'card' ? 'paid' : 'pending',
      status: 'pending',
      notes: orderData.notes,
      estimated_minutes: 25,
      created_at: new Date().toISOString(),
      items: cart.map((ci) => ({
        item_name: ci.item.name,
        item_price: ci.item.price,
        quantity: ci.quantity,
        instructions: ci.instructions
      }))
    };

    try {
      const { data: dbOrder, error } = await supabase.from('orders').insert([
        {
          order_number: newOrder.order_number,
          user_id: newOrder.user_id,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          delivery_address: newOrder.delivery_address,
          order_type: newOrder.order_type,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          delivery_fee: newOrder.delivery_fee,
          tax: newOrder.tax,
          total: newOrder.total,
          coupon_code: newOrder.coupon_code,
          payment_method: newOrder.payment_method,
          payment_status: newOrder.payment_status,
          status: newOrder.status,
          notes: newOrder.notes,
          estimated_minutes: newOrder.estimated_minutes
        }
      ]).select().single();

      if (!error && dbOrder && newOrder.items) {
        newOrder.id = dbOrder.id;
        const itemsToInsert = newOrder.items.map((i) => ({
          order_id: dbOrder.id,
          item_name: i.item_name,
          item_price: i.item_price,
          quantity: i.quantity,
          instructions: i.instructions
        }));
        await supabase.from('order_items').insert(itemsToInsert);
      }
    } catch (e) {
      console.warn('Order saved to local storage', e);
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    addToast('success', `Commande #${newOrder.order_number} confirmée avec succès !`);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], deliveryUserId?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, delivery_user_id: deliveryUserId || o.delivery_user_id, updated_at: new Date().toISOString() }
          : o
      )
    );

    try {
      await supabase
        .from('orders')
        .update({ status, delivery_user_id: deliveryUserId, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    } catch (e) {
      console.warn('Status updated locally', e);
    }
    addToast('info', `Statut de la commande mis à jour : ${status.toUpperCase()}`);
  };

  const updateSettings = async (newSettings: RestaurantSettings) => {
    setSettings(newSettings);
    localStorage.setItem('engineer_burger_settings', JSON.stringify(newSettings));
    addToast('success', 'Paramètres du restaurant mis à jour.');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        appliedCoupon,
        settings,
        favorites,
        orders,
        menuItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        toggleFavorite,
        isFavorite,
        placeOrder,
        updateOrderStatus,
        refreshOrders,
        refreshMenuItems,
        updateSettings,
        subtotal,
        discount,
        deliveryFee,
        tax,
        total,
        cartCount,
        currency: settings.currency || 'DA'
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
