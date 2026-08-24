export type UserRole = 'customer' | 'admin' | 'kitchen' | 'delivery' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status?: string;
  created_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  city: string;
  pincode: string;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image?: string;
  sort_order: number;
  status: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  image: string;
  is_veg: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  spice_level: number; // 0, 1, 2, 3
  preparation_time: number; // in mins
  rating: number;
  stock: number;
  status: number;
  category?: Category;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  minimum_order: number;
  max_discount?: number;
  valid_until: string;
  usage_limit: number;
  used_count: number;
  status: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'baridimob' | 'card' | 'cash';
export type OrderType = 'delivery' | 'pickup' | 'dine_in';

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id?: string;
  item_name: string;
  item_price: number;
  quantity: number;
  instructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_type: OrderType;
  table_number?: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  tax: number;
  total: number;
  coupon_code?: string;
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'paid' | 'refunded';
  status: OrderStatus;
  notes?: string;
  delivery_user_id?: string;
  estimated_minutes: number;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name?: string;
  menu_item_id: string;
  order_id?: string;
  rating: number;
  comment: string;
  admin_reply?: string;
  admin_replied_at?: string;
  helpful_count: number;
  status?: number;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  icon: string;
  is_read: boolean;
  created_at: string;
}

export interface RestaurantSettings {
  restaurant_name: string;
  restaurant_phone: string;
  restaurant_address: string;
  currency: string;
  delivery_fee: number;
  tax_rate: number;
  minimum_order: number;
  free_delivery_threshold: number;
  restaurant_email: string;
  opening_hours: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  whatsapp_number?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  instructions?: string;
}
