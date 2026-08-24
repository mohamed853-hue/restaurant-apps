import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cqmtmswdtwtocqyajkmu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbXRtc3dkdHd0b2NxeWFqa211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMjIzNDcsImV4cCI6MjEwMjY5ODM0N30.u5z8sBcBs4qcom5GR10IAUJ1m_7eX-Rf6VlxKbehiag';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_SETTINGS = {
  restaurant_name: 'The Engineer Burger',
  restaurant_phone: '+213 550 12 34 56',
  restaurant_address: '14 Boulevard Sidi Yahia, Hydra, Alger',
  currency: 'DA',
  delivery_fee: 250,
  tax_rate: 0,
  minimum_order: 500,
  free_delivery_threshold: 2500,
  restaurant_email: 'contact@engineerburger.dz',
  opening_hours: '11:00 AM – 00:00 AM',
  facebook_url: 'https://facebook.com/theengineerburger',
  instagram_url: 'https://instagram.com/theengineerburger',
  tiktok_url: 'https://tiktok.com/@theengineerburger',
  whatsapp_number: '+213550123456'
};

export const INITIAL_CATEGORIES = [
  { id: '10000000-0000-0000-0000-000000000001', name: 'Burgers Smash', icon: 'bi-fire', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=85', sort_order: 1, status: 1 },
  { id: '10000000-0000-0000-0000-000000000002', name: 'Menus Complets', icon: 'bi-box2-heart', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=85', sort_order: 2, status: 1 },
  { id: '10000000-0000-0000-0000-000000000003', name: 'Poulet Croustillant', icon: 'bi-egg-fried', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=85', sort_order: 3, status: 1 },
  { id: '10000000-0000-0000-0000-000000000004', name: 'Frites & Sides', icon: 'bi-stars', image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=85', sort_order: 4, status: 1 },
  { id: '10000000-0000-0000-0000-000000000005', name: 'Boissons & Shakes', icon: 'bi-cup-straw', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=85', sort_order: 5, status: 1 },
  { id: '10000000-0000-0000-0000-000000000006', name: 'Desserts Gourmet', icon: 'bi-cake2', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85', sort_order: 6, status: 1 }
];

export const INITIAL_MENU_ITEMS = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    category_id: '10000000-0000-0000-0000-000000000001',
    name: 'Double Engineer Burger',
    slug: 'double-engineer-burger',
    description: 'Double steak haché pur bœuf algérien, double cheddar affiné, sauce secrète de l\'ingénieur, oignons caramélisés dans un pain brioché toasté.',
    price: 950,
    compare_price: 1150,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=88',
    is_veg: false,
    is_featured: true,
    is_bestseller: true,
    spice_level: 1,
    preparation_time: 15,
    rating: 4.9,
    stock: 50,
    status: 1
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    category_id: '10000000-0000-0000-0000-000000000001',
    name: 'Architect Smash Burger',
    slug: 'architect-smash-burger',
    description: 'Steak smashé croustillant aux bords dorés, cheddar fondu, pickles maison et sauce algérienne maison aux épices douces.',
    price: 1100,
    compare_price: 1300,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=88',
    is_veg: false,
    is_featured: true,
    is_bestseller: true,
    spice_level: 2,
    preparation_time: 12,
    rating: 4.9,
    stock: 45,
    status: 1
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    category_id: '10000000-0000-0000-0000-000000000003',
    name: 'Crispy Master Chicken',
    slug: 'crispy-master-chicken',
    description: 'Filet de poulet fermier extra pané aux épices secrètes, salade iceberg croquante et mayonnaise onctueuse.',
    price: 900,
    compare_price: 1050,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=900&q=88',
    is_veg: false,
    is_featured: true,
    is_bestseller: false,
    spice_level: 1,
    preparation_time: 14,
    rating: 4.8,
    stock: 40,
    status: 1
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    category_id: '10000000-0000-0000-0000-000000000001',
    name: 'Tower Cheese Supreme',
    slug: 'tower-cheese-supreme',
    description: 'Triple smash burger pur bœuf, bacon de bœuf fumé halal, triple cheddar coulant et sauce fromagère dorée.',
    price: 1350,
    compare_price: 1550,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=88',
    is_veg: false,
    is_featured: true,
    is_bestseller: true,
    spice_level: 1,
    preparation_time: 18,
    rating: 5.0,
    stock: 30,
    status: 1
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    category_id: '10000000-0000-0000-0000-000000000004',
    name: 'Frites Maison & Sauce Fromagère',
    slug: 'frites-maison-sauce-fromagere',
    description: 'Portion généreuse de frites fraîches coupées main, assaisonnées au sel de mer et nappées de sauce cheddar dorée.',
    price: 350,
    compare_price: 450,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=900&q=88',
    is_veg: true,
    is_featured: true,
    is_bestseller: true,
    spice_level: 0,
    preparation_time: 8,
    rating: 4.8,
    stock: 80,
    status: 1
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    category_id: '10000000-0000-0000-0000-000000000004',
    name: 'Mozzarella Sticks Croustillants',
    slug: 'mozzarella-sticks',
    description: '6 bâtonnets de mozzarella panés extra croustillants avec cœur ultra filant et sauce barbecue fumée.',
    price: 450,
    compare_price: 550,
    image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=900&q=88',
    is_veg: true,
    is_featured: false,
    is_bestseller: true,
    spice_level: 0,
    preparation_time: 10,
    rating: 4.7,
    stock: 50,
    status: 1
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    category_id: '10000000-0000-0000-0000-000000000005',
    name: 'Hamoud Boualem Selecto',
    slug: 'hamoud-selecto-33cl',
    description: 'La boisson culte algérienne par excellence servie très fraîche avec tranche de citron.',
    price: 150,
    compare_price: 200,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=88',
    is_veg: true,
    is_featured: false,
    is_bestseller: false,
    spice_level: 0,
    preparation_time: 3,
    rating: 4.9,
    stock: 100,
    status: 1
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    category_id: '10000000-0000-0000-0000-000000000005',
    name: 'Milkshake Lotus Biscoff',
    slug: 'milkshake-lotus-biscoff',
    description: 'Glace vanille artisanale, coulis gourmand de spéculoos Lotus et chantilly légère parsemée d\'éclats croustillants.',
    price: 500,
    compare_price: 600,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=88',
    is_veg: true,
    is_featured: true,
    is_bestseller: true,
    spice_level: 0,
    preparation_time: 6,
    rating: 4.9,
    stock: 40,
    status: 1
  },
  {
    id: '20000000-0000-0000-0000-000000000009',
    category_id: '10000000-0000-0000-0000-000000000006',
    name: 'Churros & Chocolat Fondant',
    slug: 'churros-chocolat-fondant',
    description: 'Churros espagnols chauds saupoudrés de sucre cannelle avec ramequin de chocolat noir intense fondu.',
    price: 400,
    compare_price: 500,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=900&q=88',
    is_veg: true,
    is_featured: false,
    is_bestseller: true,
    spice_level: 0,
    preparation_time: 8,
    rating: 4.8,
    stock: 35,
    status: 1
  }
];

export const INITIAL_COUPONS = [
  { id: '50000000-0000-0000-0000-000000000001', code: 'ENGINEER10', type: 'percent' as const, value: 10, minimum_order: 1000, max_discount: 500, valid_until: '2030-12-31', usage_limit: 500, used_count: 12, status: 1 },
  { id: '50000000-0000-0000-0000-000000000002', code: 'WELCOME300', type: 'fixed' as const, value: 300, minimum_order: 1500, max_discount: 300, valid_until: '2030-12-31', usage_limit: 500, used_count: 45, status: 1 },
  { id: '50000000-0000-0000-0000-000000000003', code: 'SMASH500', type: 'fixed' as const, value: 500, minimum_order: 2500, max_discount: 500, valid_until: '2030-12-31', usage_limit: 500, used_count: 8, status: 1 }
];

export const DEMO_USERS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Amine Khelifi', email: 'customer@demo.com', phone: '0550000001', role: 'customer' as const, status: 'active' as const },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Chef Yanis (Gérant)', email: 'admin@demo.com', phone: '0550000002', role: 'admin' as const, status: 'active' as const },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Chef Karim (Cuisine)', email: 'kitchen@demo.com', phone: '0550000003', role: 'kitchen' as const, status: 'active' as const },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Sofiane Livreur (Moto)', email: 'delivery@demo.com', phone: '0550000004', role: 'delivery' as const, status: 'active' as const },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Sarah Caissière', email: 'staff@demo.com', phone: '0550000005', role: 'staff' as const, status: 'active' as const },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Chef Yanis (Admin)', email: 'admin@engineerburger.com', phone: '0550000002', role: 'admin' as const, status: 'active' as const }
];
