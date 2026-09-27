import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, Coupon, Order, RestaurantSettings, Category } from '../types';
import { supabase, DEFAULT_SETTINGS, INITIAL_COUPONS, INITIAL_MENU_ITEMS, INITIAL_CATEGORIES } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  settings: RestaurantSettings;
  favorites: string[]; // item ids
  orders: Order[];
  menuItems: MenuItem[];
  categories: Category[];
  coupons: Coupon[];
  favoriteDrivers: string[];
  driverPreferredCustomers: string[];
  addToCart: (item: MenuItem, quantity?: number, instructions?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  toggleCouponStatus: (couponId: string) => Promise<void>;
  addMenuItem: (item: MenuItem) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  toggleItemAvailability: (itemId: string) => Promise<void>;
  addCategory: (name: string, icon?: string, image?: string) => Promise<Category>;
  refreshCategories: () => Promise<void>;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  toggleFavoriteDriver: (driverId: string) => void;
  toggleDriverPreferredCustomer: (customerPhone: string) => void;
  placeOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status'], deliveryUserId?: string, driverNotes?: string) => Promise<void>;
  assignDriverToOrder: (orderId: string, deliveryUserId: string, driverName: string) => Promise<void>;
  settleDriverCash: (orderIds: string[]) => Promise<number>;
  rateDriver: (orderId: string, rating: number, review?: string) => Promise<void>;
  cancelOrderByDriver: (orderId: string, reason: string) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshMenuItems: () => Promise<void>;
  refreshSettings: () => Promise<void>;
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

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'o-live-01',
    order_number: 'AM260824B2',
    user_id: '00000000-0000-0000-0000-000000000001',
    customer_name: 'Moussa Traoré',
    customer_phone: '771230001',
    delivery_address: 'Quartier Amitié 2, Villa 45',
    order_type: 'delivery',
    subtotal: 6000,
    discount: 0,
    delivery_fee: 1000,
    tax: 0,
    total: 7000,
    payment_method: 'cod',
    payment_status: 'pending',
    status: 'out_for_delivery',
    delivery_user_id: '00000000-0000-0000-0000-000000000004',
    assigned_driver_name: 'Ousmane Livreur Express (Moto)',
    driver_cash_collected: false,
    admin_cash_settled: false,
    estimated_minutes: 15,
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    items: [
      { item_name: "Grillade Mixte Spéciale Amitié", item_price: 4500, quantity: 1, instructions: 'Bien cuit' },
      { item_name: 'Frites Maison Croustillantes & Sauce Fromagère', item_price: 1500, quantity: 1 }
    ]
  },
  {
    id: 'o-live-02',
    order_number: 'AM260824D4',
    user_id: 'usr-demo-nadia',
    customer_name: 'Awa Diop',
    customer_phone: '776123456',
    delivery_address: 'Avenue Mandela, Résidence Les Palmiers',
    order_type: 'delivery',
    subtotal: 8400,
    discount: 0,
    delivery_fee: 1000,
    tax: 0,
    total: 9400,
    payment_method: 'cod',
    payment_status: 'pending',
    status: 'ready',
    delivery_user_id: '00000000-0000-0000-0000-000000000004',
    assigned_driver_name: 'Ousmane Livreur Express (Moto)',
    driver_cash_collected: false,
    admin_cash_settled: false,
    estimated_minutes: 20,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    items: [
      { item_name: "Burger Gourmand L'Amitié Double Cheese", item_price: 3500, quantity: 2 },
      { item_name: 'Aloco Banane Plantain Dorée', item_price: 1800, quantity: 1 }
    ]
  },
  {
    id: 'o-settle-01',
    order_number: 'AM260824H8',
    user_id: 'usr-demo-karim',
    customer_name: 'Ibrahima Cissé',
    customer_phone: '777098765',
    delivery_address: 'Rue 10 x Corniche, Amitié',
    order_type: 'delivery',
    subtotal: 4800,
    discount: 0,
    delivery_fee: 1000,
    tax: 0,
    total: 5800,
    payment_method: 'cod',
    payment_status: 'paid',
    status: 'delivered',
    delivery_user_id: '00000000-0000-0000-0000-000000000004',
    assigned_driver_name: 'Ousmane Livreur Express (Moto)',
    driver_cash_collected: true,
    admin_cash_settled: false,
    driver_notes: 'Client ponctuel, payé en espèces',
    driver_rating: 5,
    driver_review: 'Livraison rapide en 20 min, grillades très chaudes et délicieuses !',
    estimated_minutes: 20,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    items: [
      { item_name: 'Poulet Braisé & Sauce Verte Pimentée', item_price: 3800, quantity: 1 },
      { item_name: 'Jus de Bissap & Gingembre Frais Maison', item_price: 1000, quantity: 1 }
    ]
  },
  {
    id: 'o-past-01',
    order_number: 'AM260801A1',
    user_id: '00000000-0000-0000-0000-000000000001',
    customer_name: 'Moussa Traoré',
    customer_phone: '771230001',
    delivery_address: 'Quartier Amitié 2, Villa 45',
    order_type: 'delivery',
    subtotal: 8000,
    discount: 1000,
    delivery_fee: 0,
    tax: 0,
    total: 7000,
    coupon_code: 'BIENVENUE1000',
    payment_method: 'baridimob',
    payment_status: 'paid',
    status: 'delivered',
    delivery_user_id: '00000000-0000-0000-0000-000000000004',
    assigned_driver_name: 'Ousmane Livreur Express (Moto)',
    driver_cash_collected: false,
    admin_cash_settled: true,
    settled_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    driver_rating: 5,
    driver_review: 'Parfait comme toujours !',
    estimated_minutes: 25,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    items: [
      { item_name: "Grillade Mixte Spéciale Amitié", item_price: 4500, quantity: 1 },
      { item_name: "Burger Gourmand L'Amitié Double Cheese", item_price: 3500, quantity: 1 }
    ]
  }
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, sendNotification } = useAuth();
  const { addToast } = useToast();

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('amitie_restaurant_cart') || localStorage.getItem('engineer_burger_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('amitie_restaurant_coupon') || localStorage.getItem('engineer_burger_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amitie_restaurant_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteDrivers, setFavoriteDrivers] = useState<string[]>(() => {
    const saved = localStorage.getItem('amitie_restaurant_fav_drivers');
    return saved ? JSON.parse(saved) : ['00000000-0000-0000-0000-000000000004'];
  });

  const [driverPreferredCustomers, setDriverPreferredCustomers] = useState<string[]>(() => {
    const saved = localStorage.getItem('amitie_restaurant_driver_fav_clients');
    return saved ? JSON.parse(saved) : ['771230001', '776123456'];
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    try {
      const saved = localStorage.getItem('amitie_restaurant_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currency === 'FCFA' && parsed.restaurant_name?.includes('Amiti')) return parsed;
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('amitie_restaurant_menu');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name?.includes('Amiti')) return parsed;
      }
    } catch {}
    return INITIAL_MENU_ITEMS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('amitie_restaurant_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name?.includes('Grillades')) return parsed;
      }
    } catch {}
    return INITIAL_CATEGORIES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('amitie_restaurant_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].order_number?.startsWith('AM')) return parsed;
      }
    } catch {}
    return INITIAL_DEMO_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('amitie_restaurant_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('amitie_restaurant_coupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_fav_drivers', JSON.stringify(favoriteDrivers));
  }, [favoriteDrivers]);

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_driver_fav_clients', JSON.stringify(driverPreferredCustomers));
  }, [driverPreferredCustomers]);

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  // Real-Time Cross-Tab & Supabase Live Synchronizer
  useEffect(() => {
    refreshCategories();
    refreshMenuItems();
    refreshOrders();
    refreshSettings();

    // 1. Cross-tab Broadcast Channel (Instant 0ms live sync across open tabs)
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('the_engineer_burger_sync_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'ORDERS_UPDATED' && Array.isArray(event.data.orders)) {
          setOrders(event.data.orders);
        } else if (event.data?.type === 'REFRESH_ALL') {
          refreshOrders();
        }
      };
    }

    // 2. Storage event listener (Cross-tab local storage changes)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'engineer_burger_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Supabase Realtime postgres_changes listener
    const realtimeChannel = supabase
      .channel('realtime_orders_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refreshOrders();
      })
      .subscribe();

    // 4. Background heartbeat polling (every 2.5 seconds)
    const pollInterval = setInterval(() => {
      refreshOrders();
    }, 2500);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(realtimeChannel);
      clearInterval(pollInterval);
    };
  }, []);

  const refreshCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 1)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        setCategories(data);
        localStorage.setItem('engineer_burger_categories', JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Using local categories cache', e);
    }
  };

  const addCategory = async (name: string, icon = 'bi-fire', image = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=85') => {
    const newCatId = '10000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0');
    const newCat: Category = {
      id: newCatId,
      name,
      icon,
      image,
      sort_order: categories.length + 1,
      status: 1
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem('engineer_burger_categories', JSON.stringify(updated));
    try {
      await supabase.from('categories').insert([newCat]);
    } catch (e) {
      console.warn('Saved category locally', e);
    }
    addToast('success', `Catégorie "${name}" créée avec succès !`);
    return newCat;
  };

  const refreshSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (!error && data && data.length > 0) {
        const loaded: Record<string, any> = {};
        data.forEach((row: { setting_key: string; setting_value: string }) => {
          const val = row.setting_value;
          if (val === 'true') loaded[row.setting_key] = true;
          else if (val === 'false') loaded[row.setting_key] = false;
          else if (!isNaN(Number(val)) && val.trim() !== '') loaded[row.setting_key] = Number(val);
          else loaded[row.setting_key] = val;
        });
        setSettings((prev) => {
          const merged = { ...prev, ...loaded };
          localStorage.setItem('engineer_burger_settings', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn('Using local settings cache', e);
    }
  };

  const refreshMenuItems = async () => {
    try {
      const { data, error } = await supabase.from('menu_items').select('*').eq('status', 1);
      if (!error && data && data.length > 0) {
        const saved = localStorage.getItem('engineer_burger_menu');
        const localItems: MenuItem[] = saved ? JSON.parse(saved) : [];
        const dbIds = new Set(data.map((d: any) => d.id));
        const localOnly = localItems.filter((li) => !dbIds.has(li.id));
        const merged = [...data, ...localOnly];
        setMenuItems(merged);
        localStorage.setItem('engineer_burger_menu', JSON.stringify(merged));
        return;
      }
    } catch (e) {
      console.warn('Using local menu items cache', e);
    }
    const saved = localStorage.getItem('engineer_burger_menu');
    if (saved) {
      try {
        setMenuItems(JSON.parse(saved));
      } catch {}
    }
  };

  const refreshOrders = async () => {
    // 1. Retrieve current cached orders
    const saved = localStorage.getItem('engineer_burger_orders');
    let localList: Order[] = [];
    try {
      localList = saved ? JSON.parse(saved) : orders;
    } catch {
      localList = orders;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const dbOrders: Order[] = data.map((o: any) => ({
          ...o,
          items: o.order_items && o.order_items.length > 0
            ? o.order_items
            : (localList.find((lo) => lo.id === o.id || lo.order_number === o.order_number)?.items || [])
        }));

        // Merge: keep all local orders AND all DB orders
        const orderMap = new Map<string, Order>();
        localList.forEach((o) => {
          const key = o.order_number || o.id;
          orderMap.set(key, o);
        });
        dbOrders.forEach((o) => {
          const key = o.order_number || o.id;
          const existing = orderMap.get(key);
          orderMap.set(key, { ...existing, ...o });
        });

        const merged = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        setOrders(merged);
        localStorage.setItem('engineer_burger_orders', JSON.stringify(merged));
        return;
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
          addToast('warning', `Commande minimale de ${data.minimum_order} ${settings.currency} requise.`);
          return false;
        }
        setAppliedCoupon(data);
        addToast('success', `Coupon appliqué ! Réduction de ${data.type === 'percent' ? data.value + '%' : data.value + ' ' + settings.currency}`);
        return true;
      }
    } catch (e) {
      console.warn('Coupon fallback check', e);
    }

    const matched = INITIAL_COUPONS.find((c) => c.code === cleanCode);
    if (matched) {
      if (subtotal < matched.minimum_order) {
        addToast('warning', `Commande minimale de ${matched.minimum_order} ${settings.currency} requise.`);
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

  const toggleFavoriteDriver = (driverId: string) => {
    setFavoriteDrivers((prev) => {
      const exists = prev.includes(driverId);
      const next = exists ? prev.filter((id) => id !== driverId) : [...prev, driverId];
      addToast('success', exists ? 'Livreur retiré de vos favoris' : 'Livreur ajouté à vos favoris ❤️ !');
      return next;
    });
  };

  const toggleDriverPreferredCustomer = (customerPhone: string) => {
    setDriverPreferredCustomers((prev) => {
      const exists = prev.includes(customerPhone);
      const next = exists ? prev.filter((p) => p !== customerPhone) : [...prev, customerPhone];
      addToast('info', exists ? 'Client retiré des favoris' : 'Client marqué comme VIP / Préféré ⭐');
      return next;
    });
  };

  const broadcastOrders = (ordersList: Order[]) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('the_engineer_burger_sync_channel');
        channel.postMessage({ type: 'ORDERS_UPDATED', orders: ordersList });
        channel.close();
      } catch {}
    }
  };

  const placeOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    const orderNumber = 'EB' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.random().toString(36).substring(2, 6).toUpperCase();
    const safeId = '00000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0');

    const newOrder: Order = {
      id: safeId,
      order_number: orderNumber,
      user_id: user?.id,
      customer_name: orderData.customer_name || user?.name || 'Client',
      customer_phone: orderData.customer_phone || user?.phone || '',
      delivery_address: orderData.delivery_address || user?.address || 'Centre-Ville, Ouargla',
      order_type: orderData.order_type || 'delivery',
      subtotal,
      discount,
      delivery_fee: orderData.order_type === 'delivery' ? deliveryFee : 0,
      tax,
      total: orderData.order_type === 'delivery' ? total : Math.max(0, total - deliveryFee),
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

    const updatedOrders = [newOrder, ...orders.filter((o) => o.id !== newOrder.id && o.order_number !== newOrder.order_number)];
    setOrders(updatedOrders);
    localStorage.setItem('engineer_burger_orders', JSON.stringify(updatedOrders));
    broadcastOrders(updatedOrders);

    try {
      const { data: dbOrder, error } = await supabase.from('orders').insert([
        {
          id: newOrder.id,
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

    clearCart();
    addToast('success', `🎉 Commande #${newOrder.order_number} confirmée avec succès !`);
    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    deliveryUserId?: string,
    driverNotes?: string
  ) => {
    const isDelivered = status === 'delivered';
    const nowStr = new Date().toISOString();

    const targetOrder = orders.find((o) => o.id === orderId);

    const nextOrders = orders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status,
        delivery_user_id: deliveryUserId || o.delivery_user_id,
        driver_cash_collected: isDelivered ? (o.payment_method === 'cod' || o.payment_method === 'cash') : o.driver_cash_collected,
        payment_status: isDelivered ? 'paid' : o.payment_status,
        driver_notes: driverNotes !== undefined ? driverNotes : o.driver_notes,
        updated_at: nowStr
      };
    });

    setOrders(nextOrders);
    localStorage.setItem('engineer_burger_orders', JSON.stringify(nextOrders));
    broadcastOrders(nextOrders);

    // Trigger Notification for the Customer
    if (targetOrder?.user_id) {
      if (status === 'confirmed') {
        sendNotification(targetOrder.user_id, 'Commande Confirmée ! ✅', `Votre commande #${targetOrder.order_number} est confirmée par le restaurant.`, 'bi-check2-all');
      } else if (status === 'preparing') {
        sendNotification(targetOrder.user_id, 'Cuisson en Cours 🔥', `Votre commande #${targetOrder.order_number} est actuellement en préparation au Grill !`, 'bi-fire');
      } else if (status === 'ready') {
        sendNotification(targetOrder.user_id, 'Commande Prête 📦', `Votre commande #${targetOrder.order_number} est prête et emballée avec soin.`, 'bi-box-seam');
      } else if (status === 'out_for_delivery') {
        sendNotification(targetOrder.user_id, 'Livreur en Route 🛵', `Votre commande #${targetOrder.order_number} est en cours de livraison !`, 'bi-scooter');
      } else if (status === 'delivered') {
        sendNotification(targetOrder.user_id, 'Commande Livrée ! 🎉', `Votre commande #${targetOrder.order_number} a été livrée avec succès. Bon appétit !`, 'bi-bag-check-fill');
      }
    }

    try {
      await supabase
        .from('orders')
        .update({
          status,
          delivery_user_id: deliveryUserId,
          payment_status: isDelivered ? 'paid' : undefined,
          updated_at: nowStr
        })
        .eq('id', orderId);
    } catch (e) {
      console.warn('Status updated locally', e);
    }
    addToast('info', `Statut de la commande mis à jour : ${status.toUpperCase()}`);
  };

  const assignDriverToOrder = async (orderId: string, deliveryUserId: string, driverName: string) => {
    const nextOrders = orders.map((o) =>
      o.id === orderId
        ? { ...o, delivery_user_id: deliveryUserId, assigned_driver_name: driverName, status: o.status === 'pending' ? 'confirmed' : o.status }
        : o
    );
    setOrders(nextOrders);
    localStorage.setItem('engineer_burger_orders', JSON.stringify(nextOrders));
    broadcastOrders(nextOrders);
    addToast('success', `Commande assignée au livreur : ${driverName}`);
  };

  const settleDriverCash = async (orderIds: string[]): Promise<number> => {
    let totalSettled = 0;
    const settledAtStr = new Date().toISOString();

    const nextOrders = orders.map((o) => {
      if (orderIds.includes(o.id)) {
        totalSettled += o.total;
        return {
          ...o,
          admin_cash_settled: true,
          driver_cash_collected: true,
          settled_at: settledAtStr
        };
      }
      return o;
    });

    setOrders(nextOrders);
    localStorage.setItem('engineer_burger_orders', JSON.stringify(nextOrders));
    broadcastOrders(nextOrders);

    try {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', updated_at: settledAtStr })
        .in('id', orderIds);
    } catch (e) {
      console.warn('Cash settlement saved locally', e);
    }

    addToast('success', `🎉 Remise d'espèces validée : ${totalSettled} ${settings.currency} encaissés au Chiffre d'Affaires !`);
    return totalSettled;
  };

  const rateDriver = async (orderId: string, rating: number, review?: string) => {
    const nextOrders = orders.map((o) =>
      o.id === orderId ? { ...o, driver_rating: rating, driver_review: review } : o
    );
    setOrders(nextOrders);
    localStorage.setItem('engineer_burger_orders', JSON.stringify(nextOrders));
    broadcastOrders(nextOrders);
    addToast('success', '⭐ Merci pour votre évaluation du livreur !');
  };

  const cancelOrderByDriver = async (orderId: string, reason: string) => {
    const nextOrders: Order[] = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'cancelled' as const, cancel_reason: reason } : o
    );
    setOrders(nextOrders);
    localStorage.setItem('engineer_burger_orders', JSON.stringify(nextOrders));
    broadcastOrders(nextOrders);
    addToast('warning', `Course annulée par le livreur (${reason}).`);
  };

  const cancelOrder = async (orderId: string, reason = 'Annulée par le client') => {
    const target = orders.find((o) => o.id === orderId);
    const nowStr = new Date().toISOString();

    const nextOrders: Order[] = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'cancelled' as const,
            notes: o.notes ? `${o.notes} | ${reason}` : reason,
            updated_at: nowStr
          }
        : o
    );

    setOrders(nextOrders);
    localStorage.setItem('engineer_burger_orders', JSON.stringify(nextOrders));
    broadcastOrders(nextOrders);

    try {
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          notes: target?.notes ? `${target.notes} | ${reason}` : reason,
          updated_at: nowStr
        })
        .eq('id', orderId);
    } catch (e) {
      console.warn('Order cancellation saved locally', e);
    }

    addToast('warning', `Commande #${target?.order_number || orderId} annulée avec succès.`);
  };

  const updateSettings = async (newSettings: RestaurantSettings) => {
    setSettings(newSettings);
    localStorage.setItem('engineer_burger_settings', JSON.stringify(newSettings));

    // Persist directly to Supabase settings table
    try {
      const rows = Object.entries(newSettings).map(([key, val]) => ({
        setting_key: key,
        setting_value: String(val ?? '')
      }));

      const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'setting_key' });
      if (error) {
        console.warn('Supabase settings upsert error', error);
      } else {
        console.log('Settings successfully saved to Supabase database!');
      }
    } catch (err) {
      console.warn('Failed saving settings to Supabase, cached locally', err);
    }

    addToast('success', '✅ Paramètres du restaurant enregistrés dans la Base de Données !');
  };

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('engineer_burger_coupons_list');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  useEffect(() => {
    localStorage.setItem('engineer_burger_coupons_list', JSON.stringify(coupons));
  }, [coupons]);

  const addMenuItem = async (item: MenuItem) => {
    const safeId = item.id && item.id.includes('-') && item.id.length >= 32
      ? item.id
      : '20000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0');

    const readyItem: MenuItem = {
      ...item,
      id: safeId,
      name: item.name || item.name_ar || 'Nouveau Plat Gourmet',
      name_ar: item.name_ar || item.name || 'وجبة جديدة',
      slug: (item.name || item.name_ar || 'plat').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900),
      description: item.description || item.description_ar || 'Préparé avec des ingrédients frais du jour.',
      description_ar: item.description_ar || item.description || 'محضر بمكونات طازجة يومياً.',
      price: Number(item.price) || 500,
      compare_price: item.compare_price ? Number(item.compare_price) : undefined,
      image: item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=88',
      category_id: item.category_id || categories[0]?.id || '10000000-0000-0000-0000-000000000001',
      is_veg: item.is_veg ?? false,
      is_featured: item.is_featured ?? true,
      is_bestseller: item.is_bestseller ?? false,
      spice_level: item.spice_level ?? 1,
      preparation_time: item.preparation_time ?? 15,
      rating: item.rating ?? 5.0,
      stock: item.stock ?? 50,
      status: 1
    };

    const newMenu = [readyItem, ...menuItems.filter((m) => m.id !== readyItem.id)];
    setMenuItems(newMenu);
    localStorage.setItem('engineer_burger_menu', JSON.stringify(newMenu));

    try {
      const { error } = await supabase.from('menu_items').upsert([{
        id: readyItem.id,
        name: readyItem.name,
        name_ar: readyItem.name_ar,
        slug: readyItem.slug,
        description: readyItem.description,
        description_ar: readyItem.description_ar,
        price: readyItem.price,
        compare_price: readyItem.compare_price,
        image: readyItem.image,
        category_id: readyItem.category_id,
        is_veg: readyItem.is_veg,
        is_featured: readyItem.is_featured,
        is_bestseller: readyItem.is_bestseller,
        spice_level: readyItem.spice_level,
        preparation_time: readyItem.preparation_time,
        rating: readyItem.rating,
        stock: readyItem.stock,
        status: readyItem.status
      }], { onConflict: 'id' });
      if (error) console.warn('Supabase menu upsert error:', error);
    } catch (e) {
      console.warn('Saved menu item locally', e);
    }
    addToast('success', `Plat "${readyItem.name}" ajouté avec succès au menu !`);
  };

  const updateMenuItem = async (item: MenuItem) => {
    const updated = menuItems.map((m) => (m.id === item.id ? { ...m, ...item } : m));
    setMenuItems(updated);
    localStorage.setItem('engineer_burger_menu', JSON.stringify(updated));

    try {
      const { error } = await supabase.from('menu_items').update({
        name: item.name,
        name_ar: item.name_ar,
        description: item.description,
        description_ar: item.description_ar,
        price: item.price,
        compare_price: item.compare_price,
        image: item.image,
        category_id: item.category_id,
        is_veg: item.is_veg,
        is_featured: item.is_featured,
        is_bestseller: item.is_bestseller,
        spice_level: item.spice_level,
        preparation_time: item.preparation_time,
        rating: item.rating,
        stock: item.stock,
        status: item.status
      }).eq('id', item.id);
      if (error) console.warn('Supabase menu update error:', error);
    } catch (e) {
      console.warn('Updated menu item locally', e);
    }
    addToast('success', `Plat "${item.name}" mis à jour avec succès !`);
  };

  const toggleItemAvailability = async (itemId: string) => {
    const target = menuItems.find((m) => m.id === itemId);
    if (!target) return;
    const newStatus = target.status === 1 ? 0 : 1;
    const updated = menuItems.map((m) => (m.id === itemId ? { ...m, status: newStatus } : m));
    setMenuItems(updated);
    localStorage.setItem('engineer_burger_menu', JSON.stringify(updated));

    try {
      await supabase.from('menu_items').update({ status: newStatus }).eq('id', itemId);
    } catch (e) {
      console.warn('Item availability updated locally', e);
    }

    addToast(
      newStatus === 1 ? 'success' : 'warning',
      newStatus === 1
        ? `Plat "${target.name}" marqué comme DISPONIBLE ✅`
        : `Plat "${target.name}" marqué comme ÉPUISÉ (Rupture) 🔴`
    );
  };

  const deleteMenuItem = async (itemId: string) => {
    const updated = menuItems.filter((m) => m.id !== itemId);
    setMenuItems(updated);
    localStorage.setItem('engineer_burger_menu', JSON.stringify(updated));
    try {
      await supabase.from('menu_items').delete().eq('id', itemId);
    } catch (e) {
      console.warn('Deleted menu item locally', e);
    }
    addToast('info', 'Plat retiré du menu.');
  };

  const addCoupon = async (coupon: Coupon) => {
    const updated = [coupon, ...coupons];
    setCoupons(updated);
    localStorage.setItem('engineer_burger_coupons_list', JSON.stringify(updated));
    try {
      await supabase.from('coupons').insert([{
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minimum_order: coupon.minimum_order,
        max_discount: coupon.max_discount,
        valid_until: coupon.valid_until,
        usage_limit: coupon.usage_limit,
        used_count: coupon.used_count,
        status: coupon.status
      }]);
    } catch (e) {
      console.warn('Coupon saved locally', e);
    }
    addToast('success', `Code promo "${coupon.code}" créé avec succès !`);
  };

  const deleteCoupon = async (couponId: string) => {
    const updated = coupons.filter((c) => c.id !== couponId);
    setCoupons(updated);
    localStorage.setItem('engineer_burger_coupons_list', JSON.stringify(updated));
    try {
      await supabase.from('coupons').delete().eq('id', couponId);
    } catch (e) {
      console.warn('Coupon deleted locally', e);
    }
    addToast('info', 'Code promo supprimé.');
  };

  const toggleCouponStatus = async (couponId: string) => {
    const updated = coupons.map((c) => (c.id === couponId ? { ...c, status: c.status === 1 ? 0 : 1 } : c));
    setCoupons(updated);
    localStorage.setItem('engineer_burger_coupons_list', JSON.stringify(updated));
    addToast('info', 'Statut du code promo modifié.');
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
        categories,
        coupons,
        favoriteDrivers,
        driverPreferredCustomers,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        addCoupon,
        deleteCoupon,
        toggleCouponStatus,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        addCategory,
        refreshCategories,
        toggleFavorite,
        isFavorite,
        toggleFavoriteDriver,
        toggleDriverPreferredCustomer,
        placeOrder,
        updateOrderStatus,
        assignDriverToOrder,
        settleDriverCash,
        rateDriver,
        cancelOrderByDriver,
        cancelOrder,
        refreshOrders,
        refreshMenuItems,
        refreshSettings,
        updateSettings,
        subtotal,
        discount,
        deliveryFee,
        tax,
        total,
        cartCount,
        currency: settings.currency || 'FCFA'
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
