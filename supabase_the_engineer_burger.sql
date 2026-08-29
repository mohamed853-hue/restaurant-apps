-- ==============================================================================
-- 🍔 THE ENGINEER BURGER (برجر المهندس) - OUARGLA (ورقلة)
-- SCRIPT SQL SUPABASE 100% VALIDE & TESTÉ
-- ==============================================================================
-- Copiez et collez l'intégralité de ce script dans :
-- Supabase Dashboard > SQL Editor > New Query > Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SUPPRESSION PROPRE DES ANCIENNES TABLES
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS review_helpful CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 3. CRÉATION DES TABLES

-- Table Utilisateurs (Clients, Livreurs, Cuisine, Admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT '123456',
    phone VARCHAR(30) DEFAULT NULL,
    address VARCHAR(255) DEFAULT 'Centre-Ville, Ouargla',
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'kitchen', 'delivery', 'staff'
    avatar VARCHAR(500) DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    orders_count INT DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Adresses Clients
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Maison',
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Ouargla',
    pincode VARCHAR(20) NOT NULL DEFAULT '30000',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Catégories du Menu
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) DEFAULT NULL,
    icon VARCHAR(60) NOT NULL DEFAULT 'bi-fire',
    image VARCHAR(500) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Plats du Menu (Bilingue Français / Arabe)
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(140) NOT NULL,
    name_ar VARCHAR(140) DEFAULT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    description_ar TEXT DEFAULT NULL,
    price NUMERIC(10,2) NOT NULL,
    compare_price NUMERIC(10,2) DEFAULT NULL,
    image VARCHAR(500) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    spice_level INT NOT NULL DEFAULT 1,
    preparation_time INT NOT NULL DEFAULT 15,
    rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
    stock INT NOT NULL DEFAULT 50,
    status INT NOT NULL DEFAULT 1, -- 1: Disponible, 0: Épuisé (Rupture)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Codes Promo & Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL DEFAULT 'fixed', -- 'fixed' ou 'percent'
    value NUMERIC(10,2) NOT NULL,
    minimum_order NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount NUMERIC(10,2) DEFAULT NULL,
    valid_until DATE NOT NULL,
    usage_limit INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Commandes
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    delivery_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address TEXT NOT NULL,
    order_type VARCHAR(20) NOT NULL DEFAULT 'delivery', -- 'delivery', 'pickup', 'dine_in'
    table_number VARCHAR(20) DEFAULT NULL,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 250,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    coupon_code VARCHAR(40) DEFAULT NULL,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cod', -- 'cod', 'baridimob', 'card', 'cash'
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
    notes TEXT DEFAULT NULL,
    estimated_minutes INT NOT NULL DEFAULT 25,
    assigned_driver_name VARCHAR(120) DEFAULT NULL,
    driver_cash_collected BOOLEAN DEFAULT false,
    admin_cash_settled BOOLEAN DEFAULT false,
    driver_notes TEXT DEFAULT NULL,
    driver_rating INT DEFAULT NULL,
    driver_review TEXT DEFAULT NULL,
    settled_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table Articles de Commandes
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name VARCHAR(140) NOT NULL,
    item_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    instructions TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Notifications en Direct
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(60) DEFAULT 'bi-bell-fill',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Paramètres Généraux du Restaurant (Clé / Valeur)
CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INSERTION DES PARAMÈTRES PAR DÉFAUT (OUARGLA)
INSERT INTO settings (setting_key, setting_value) VALUES
('restaurant_name', 'The Engineer Burger'),
('restaurant_phone', '+213 550 12 34 56'),
('restaurant_address', 'Boulevard 1er Novembre, En face Université Kasdi Merbah, Centre-Ville, Ouargla'),
('currency', 'DA'),
('delivery_fee', '250'),
('tax_rate', '0'),
('minimum_order', '500'),
('free_delivery_threshold', '2500'),
('restaurant_email', 'contact@engineerburger.dz'),
('opening_hours', '11:00 AM – 00:00 AM'),
('facebook_url', 'https://facebook.com/theengineerburger'),
('instagram_url', 'https://instagram.com/theengineerburger'),
('tiktok_url', 'https://tiktok.com/@theengineerburger'),
('whatsapp_number', '+213550123456')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 5. INSERTION DES UTILISATEURS DÉMO & LIVREURS
INSERT INTO users (id, name, email, password, phone, address, role, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Amine Khelifi', 'customer@demo.com', '123456', '0550000001', 'Quartier Rouissat, Ouargla', 'customer', 'active'),
('00000000-0000-0000-0000-000000000002', 'Chef Yanis (Gérant Admin)', 'admin@demo.com', '123456', '0550000002', 'Centre-Ville, Ouargla', 'admin', 'active'),
('00000000-0000-0000-0000-000000000003', 'Chef Karim (Cuisine Grill)', 'kitchen@demo.com', '123456', '0550000003', 'Boulevard 1er Novembre, Ouargla', 'kitchen', 'active'),
('00000000-0000-0000-0000-000000000004', 'Sofiane Livreur (Moto Express)', 'delivery@demo.com', '123456', '0550000004', 'Beni Thour, Ouargla', 'delivery', 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. INSERTION DES CATÉGORIES
INSERT INTO categories (id, name, icon, image, sort_order, status) VALUES
('10000000-0000-0000-0000-000000000001', 'Burgers Smash', 'bi-fire', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=85', 1, 1),
('10000000-0000-0000-0000-000000000002', 'Menus Complets', 'bi-box2-heart', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=85', 2, 1),
('10000000-0000-0000-0000-000000000003', 'Poulet Croustillant', 'bi-egg-fried', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=85', 3, 1),
('10000000-0000-0000-0000-000000000004', 'Frites & Sides', 'bi-stars', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=85', 4, 1),
('10000000-0000-0000-0000-000000000005', 'Boissons & Shakes', 'bi-cup-straw', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=85', 5, 1),
('10000000-0000-0000-0000-000000000006', 'Desserts Gourmet', 'bi-cake2', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85', 6, 1)
ON CONFLICT (id) DO NOTHING;

-- 7. INSERTION DES PLATS DU MENU (BILINGUES)
INSERT INTO menu_items (id, category_id, name, name_ar, slug, description, description_ar, price, compare_price, image, is_veg, is_featured, is_bestseller, spice_level, preparation_time, rating, stock, status) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Double Engineer Burger', 'دبل برجر المهندس', 'double-engineer-burger', 'Deux steaks smash pur bœuf de 100g croustillants, double cheddar affiné fondant, oignons caramélisés et notre fameuse sauce secrète The Engineer dans un pain brioché toasté.', 'شريحتا لحم بقري سماش مقرمشتان 100غ، جبنة شيدر مذابة، بصل مكرمل وصلصة المهندس الخاصة.', 950.00, 1150.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=88', false, true, true, 1, 15, 4.9, 80, 1),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Architect Smash Burger', 'برجر أركيتكت سماش', 'architect-smash-burger', 'Triple steak smash pur bœuf, bacon de bœuf halal fumé croustillant, triple fromage Monterey Jack, sauce barbecue maison au miel et pickles croquants.', 'ثلاث شرائح سماش لحم بقري، لحم مقدد مدخن حلال، جبن مونتيري جاك وصلصة باربكيو بالعسل.', 1100.00, 1300.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=88', false, true, true, 2, 18, 5.0, 60, 1),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Tower Cheese Supreme', 'تاور تشيز سوبريم', 'tower-cheese-supreme', 'Pour les passionnés de fromage : double smash burger avec cascade de sauce fromagère chaude au cheddar fondu, mozzarella filante et chips d oignon.', 'لعشاق الجبن : دبل سماش مع شلال من صلصة الجبن الساخنة، موزاريلا ورقائق البصل المقرمشة.', 1350.00, 1550.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=88', false, true, false, 0, 20, 4.8, 50, 1),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Crispy Master Chicken', 'كريسبي ماستر تشيكن', 'crispy-master-chicken', 'Filet de poulet frais mariné 24h pané aux épices secrètes ultra croustillant, salade iceberg fraîche, cheddar et mayonnaise maison au poivre noir.', 'صدر دجاج طازج متبل ومقرمش بخلطة الأعشاب، سلطة آيسبيرغ وجبن شيدر ومايونيز بالفلفل الأسود.', 900.00, 1050.00, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=900&q=88', false, false, true, 1, 14, 4.7, 70, 1),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'Frites Maison & Sauce Fromagère', 'بطاطا مقلية طازجة بصلصة الجبن', 'frites-maison-sauce-fromagere', 'Pommes de terre algériennes fraîches coupées chaque matin, double cuisson pour un croquant parfait, servies avec notre sauce cheddar chaude.', 'بطاطا طازجة مقلية مرتين لقرمشة مثالية مع صلصة الشيدر الساخنة.', 350.00, 450.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=900&q=88', true, false, true, 0, 10, 4.8, 120, 1)
ON CONFLICT (id) DO NOTHING;

-- 8. INSERTION DES CODES PROMO
INSERT INTO coupons (id, code, type, value, minimum_order, max_discount, valid_until, usage_limit, used_count, status) VALUES
('50000000-0000-0000-0000-000000000001', 'WELCOME300', 'fixed', 300.00, 1500.00, 300.00, '2030-12-31', 1000, 42, 1),
('50000000-0000-0000-0000-000000000002', 'ENGINEER10', 'percent', 10.00, 1000.00, 400.00, '2030-12-31', 500, 18, 1),
('50000000-0000-0000-0000-000000000003', 'SMASH500', 'fixed', 500.00, 2500.00, 500.00, '2030-12-31', 500, 8, 1)
ON CONFLICT (id) DO NOTHING;

-- 9. CONFIGURATION POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- Active l'accès en lecture et écriture pour l'application frontend
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read addresses" ON addresses FOR SELECT USING (true);
CREATE POLICY "Allow public insert addresses" ON addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update addresses" ON addresses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete addresses" ON addresses FOR DELETE USING (true);

CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public manage categories" ON categories FOR ALL USING (true);

CREATE POLICY "Allow public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public manage menu_items" ON menu_items FOR ALL USING (true);

CREATE POLICY "Allow public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow public manage coupons" ON coupons FOR ALL USING (true);

CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);

CREATE POLICY "Allow public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notifications" ON notifications FOR UPDATE USING (true);

CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public manage settings" ON settings FOR ALL USING (true);
