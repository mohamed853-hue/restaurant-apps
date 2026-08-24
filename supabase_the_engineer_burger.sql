-- ==============================================================================
-- 🍔 THE ENGINEER BURGER (برجر المهندس) - SUPABASE MASTER SCHEMA & DATA (100% VALIDE)
-- ==============================================================================
-- Copiez et collez l'intégralité de ce script dans :
-- Supabase Dashboard > SQL Editor > New query > Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SUPPRESSION PROPRE DES TABLES (Si réinitialisation)
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

-- Table Utilisateurs (Clients & Staff)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'kitchen', 'delivery', 'staff'
    avatar VARCHAR(500) DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Adresses Clients
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Maison',
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Alger',
    pincode VARCHAR(20) NOT NULL DEFAULT '16000',
    is_default BOOLEAN NOT NULL DEFAULT false
);

-- Table Catégories du Menu
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(60) NOT NULL DEFAULT 'bi-grid',
    image VARCHAR(500) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 1
);

-- Table Plats du Menu
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(140) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    compare_price NUMERIC(10,2) DEFAULT NULL,
    image VARCHAR(500) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    spice_level INT NOT NULL DEFAULT 1,
    preparation_time INT NOT NULL DEFAULT 15,
    rating NUMERIC(3,1) NOT NULL DEFAULT 4.8,
    stock INT NOT NULL DEFAULT 100,
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Coupons & Codes Promo
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
    status INT NOT NULL DEFAULT 1
);

-- Table Commandes
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(40) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address VARCHAR(400) NOT NULL,
    order_type VARCHAR(20) NOT NULL DEFAULT 'delivery', -- 'delivery', 'pickup', 'dine_in'
    table_number VARCHAR(30) DEFAULT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    coupon_code VARCHAR(40) DEFAULT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cod', -- 'cod', 'baridimob', 'card', 'cash'
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
    notes VARCHAR(500) DEFAULT NULL,
    delivery_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    estimated_minutes INT NOT NULL DEFAULT 25,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table Détail des Articles de Commande
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name VARCHAR(140) NOT NULL,
    item_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    instructions VARCHAR(255) DEFAULT NULL
);

-- Table Avis & Évaluations
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(600) NOT NULL,
    admin_reply VARCHAR(600) DEFAULT NULL,
    admin_replied_at TIMESTAMPTZ DEFAULT NULL,
    helpful_count INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Favoris
CREATE TABLE favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, menu_item_id)
);

-- Table Utilité des Avis
CREATE TABLE review_helpful (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, review_id)
);

-- Table Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(400) NOT NULL,
    icon VARCHAR(60) NOT NULL DEFAULT 'bi-bell',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Logs d'Activité
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(200) NOT NULL,
    ip_address VARCHAR(60) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Paramètres Restaurant
CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL
);

-- 4. POLITIQUES DE SÉCURITÉ (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès public total users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total addresses" ON addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total favorites" ON favorites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total review_helpful" ON review_helpful FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès public total settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- 5. DONNÉES INITIALES (SEED 100% VALIDE AVEC UUIDS HEXADÉCIMAUX STRICTS)

-- Configuration Restaurant
INSERT INTO settings (setting_key, setting_value) VALUES
('restaurant_name', 'The Engineer Burger'),
('restaurant_phone', '+213 550 12 34 56'),
('restaurant_address', '14 Boulevard Sidi Yahia, Hydra, Alger'),
('currency', 'DA'),
('delivery_fee', '250'),
('tax_rate', '0'),
('minimum_order', '500'),
('free_delivery_threshold', '2500'),
('restaurant_email', 'contact@engineerburger.dz'),
('opening_hours', '11:00 AM – 00:00 AM');

-- Comptes Utilisateurs Démo (Tous le mot de passe: 'password')
INSERT INTO users (id, name, email, password, phone, role) VALUES
('00000000-0000-0000-0000-000000000001', 'Amine Khelifi', 'customer@demo.com', 'password', '0550000001', 'customer'),
('00000000-0000-0000-0000-000000000002', 'Chef Yanis (Gérant)', 'admin@demo.com', 'password', '0550000002', 'admin'),
('00000000-0000-0000-0000-000000000003', 'Chef Karim (Cuisine)', 'kitchen@demo.com', 'password', '0550000003', 'kitchen'),
('00000000-0000-0000-0000-000000000004', 'Sofiane Livreur (Moto)', 'delivery@demo.com', 'password', '0550000004', 'delivery'),
('00000000-0000-0000-0000-000000000005', 'Sarah Caissière', 'staff@demo.com', 'password', '0550000005', 'staff'),
('00000000-0000-0000-0000-000000000006', 'Chef Yanis (Admin)', 'admin@engineerburger.com', 'password', '0550000002', 'admin');

-- Adresse client démo
INSERT INTO addresses (id, user_id, label, address_line, city, pincode, is_default) VALUES
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Maison', 'Résidence Les Palmiers, Hydra', 'Alger', '16035', true);

-- Catégories de Démonstration (UUIDs valides 10000000-0000-0000-0000-00000000000X)
INSERT INTO categories (id, name, icon, image, sort_order) VALUES
('10000000-0000-0000-0000-000000000001', 'Burgers Smash', 'bi-fire', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=85', 1),
('10000000-0000-0000-0000-000000000002', 'Menus Complets', 'bi-box2-heart', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=85', 2),
('10000000-0000-0000-0000-000000000003', 'Poulet Croustillant', 'bi-egg-fried', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=85', 3),
('10000000-0000-0000-0000-000000000004', 'Frites & Sides', 'bi-stars', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=85', 4),
('10000000-0000-0000-0000-000000000005', 'Boissons & Shakes', 'bi-cup-straw', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=85', 5),
('10000000-0000-0000-0000-000000000006', 'Desserts Gourmet', 'bi-cake2', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85', 6);

-- Plats du Menu (UUIDs valides 20000000-0000-0000-0000-00000000000X)
INSERT INTO menu_items (id, category_id, name, slug, description, price, compare_price, image, is_veg, is_featured, is_bestseller, spice_level, preparation_time, rating, stock) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Double Engineer Burger', 'double-engineer-burger', 'Double steak haché pur bœuf algérien, double cheddar affiné, sauce secrète de l''ingénieur, oignons caramélisés dans un pain brioché toasté.', 950, 1150, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=88', false, true, true, 1, 15, 4.9, 50),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Architect Smash Burger', 'architect-smash-burger', 'Steak smashé croustillant aux bords dorés, cheddar fondu, pickles maison et sauce algérienne maison aux épices douces.', 1100, 1300, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=88', false, true, true, 2, 12, 4.9, 45),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Crispy Master Chicken', 'crispy-master-chicken', 'Filet de poulet fermier extra pané aux épices secrètes, salade iceberg croquante et mayonnaise onctueuse.', 900, 1050, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=900&q=88', false, true, false, 1, 14, 4.8, 40),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Tower Cheese Supreme', 'tower-cheese-supreme', 'Triple smash burger pur bœuf, bacon de bœuf fumé halal, triple cheddar coulant et sauce fromagère dorée.', 1350, 1550, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=88', false, true, true, 1, 18, 5.0, 30),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'Frites Maison & Sauce Fromagère', 'frites-maison-sauce-fromagere', 'Portion généreuse de frites fraîches coupées main, assaisonnées au sel de mer et nappées de sauce cheddar dorée.', 350, 450, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=900&q=88', true, true, true, 0, 8, 4.8, 80),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'Mozzarella Sticks Croustillants', 'mozzarella-sticks', '6 bâtonnets de mozzarella panés extra croustillants avec cœur ultra filant et sauce barbecue fumée.', 450, 550, 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=900&q=88', true, false, true, 0, 10, 4.7, 50),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005', 'Hamoud Boualem Selecto', 'hamoud-selecto-33cl', 'La boisson culte algérienne par excellence servie très fraîche avec tranche de citron.', 150, 200, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=88', true, false, false, 0, 3, 4.9, 100),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 'Milkshake Lotus Biscoff', 'milkshake-lotus-biscoff', 'Glace vanille artisanale, coulis gourmand de spéculoos Lotus et chantilly légère parsemée d''éclats croustillants.', 500, 600, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=88', true, true, true, 0, 6, 4.9, 40),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000006', 'Churros & Chocolat Fondant', 'churros-chocolat-fondant', 'Churros espagnols chauds saupoudrés de sucre cannelle avec ramequin de chocolat noir intense fondu.', 400, 500, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=900&q=88', true, false, true, 0, 8, 4.8, 35);

-- Coupons de Réduction
INSERT INTO coupons (id, code, type, value, minimum_order, max_discount, valid_until, usage_limit) VALUES
('50000000-0000-0000-0000-000000000001', 'ENGINEER10', 'percent', 10, 1000, 500, '2030-12-31', 500),
('50000000-0000-0000-0000-000000000002', 'WELCOME300', 'fixed', 300, 1500, 300, '2030-12-31', 500),
('50000000-0000-0000-0000-000000000003', 'SMASH500', 'fixed', 500, 2500, 500, '2030-12-31', 500);

-- Commandes Démo (UUIDs valides 30000000-0000-0000-0000-00000000000X)
INSERT INTO orders (id, order_number, user_id, customer_name, customer_phone, delivery_address, subtotal, discount, delivery_fee, tax, total, payment_method, payment_status, status, estimated_minutes, created_at) VALUES
('30000000-0000-0000-0000-000000000001', 'EB260801A1', '00000000-0000-0000-0000-000000000001', 'Amine Khelifi', '0550000001', 'Résidence Les Palmiers, Hydra, Alger', 2050, 300, 0, 0, 1750, 'baridimob', 'paid', 'delivered', 25, now() - INTERVAL '2 days'),
('30000000-0000-0000-0000-000000000002', 'EB260824B2', '00000000-0000-0000-0000-000000000001', 'Amine Khelifi', '0550000001', 'Résidence Les Palmiers, Hydra, Alger', 1450, 0, 250, 0, 1700, 'cod', 'pending', 'preparing', 20, now() - INTERVAL '15 minutes'),
('30000000-0000-0000-0000-000000000003', 'EB260824C3', NULL, 'Nadia Bensalem', '0661234567', '4 Boulevard Colonel Amirouche, Alger', 950, 0, 250, 0, 1200, 'cod', 'pending', 'confirmed', 25, now() - INTERVAL '5 minutes');

-- Articles des Commandes
INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Double Engineer Burger', 950, 1),
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Architect Smash Burger', 1100, 1),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Architect Smash Burger', 1100, 1),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 'Frites Maison & Sauce Fromagère', 350, 1),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Double Engineer Burger', 950, 1);

-- Avis Démo
INSERT INTO reviews (id, user_id, menu_item_id, order_id, rating, comment, admin_reply, admin_replied_at, helpful_count) VALUES
('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 5, 'Le Double Engineer Burger est incroyable ! La viande est fraîche et juteuse, la sauce secrète est parfaite.', 'Merci beaucoup Amine ! Toute l''équipe de l''ingénieur vous remercie pour votre fidélité.', now() - INTERVAL '1 day', 4),
('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 5, 'Le smash burger le plus croustillant et savoureux d''Alger, livraison rapide et chaude !', NULL, NULL, 2);

-- Notifications
INSERT INTO notifications (id, user_id, title, message, icon) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Commande en cours de préparation', 'Nos chefs ont commencé à griller votre burger pour la commande EB260824B2.', 'bi-fire'),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Nouvelle commande reçue !', 'Une commande de 1200 DA vient d''arriver de Nadia Bensalem.', 'bi-receipt');
