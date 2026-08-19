-- ==============================================================================
-- 🍔 THE ENGINEER BURGER (برجر المهندس) - SCHÉMA DE BASE DE DONNÉES SUPABASE
-- ==============================================================================
-- URL Supabase : https://cqmtmswdtwtocqyajkmu.supabase.co
-- Ce script est prêt à être exécuté dans l'éditeur SQL de Supabase (SQL Editor).
-- ==============================================================================

-- ==============================================================================
-- 📌 PARTIE 1 : EXTENSIONS & TYPES ÉNUMÉRÉS (ENUMS)
-- ==============================================================================

-- Activation de l'extension UUID pour générer des identifiants uniques sécurisés
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Type de rôle utilisateur
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'client', 'driver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut d'un livreur / coursier
DO $$ BEGIN
    CREATE TYPE driver_status AS ENUM ('pending_approval', 'online', 'busy', 'offline', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut d'une commande
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Type de paiement pour la commande
DO $$ BEGIN
    CREATE TYPE payment_mode AS ENUM ('client_cash', 'recipient_cash', 'online_card', 'baridimob');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 📌 PARTIE 2 : CRÉATION DES TABLES
-- ==============================================================================

-- 1. Table des Profils Utilisateurs (Liée à auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    age INTEGER CHECK (age >= 5 AND age <= 120),
    role user_role DEFAULT 'client'::user_role,
    avatar_url TEXT,
    default_address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table de Configuration du Restaurant
CREATE TABLE IF NOT EXISTS public.restaurant_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr TEXT NOT NULL DEFAULT 'The Engineer Burger',
    name_ar TEXT NOT NULL DEFAULT 'المهندس برغر',
    tagline_fr TEXT DEFAULT 'L''art de l''ingénierie culinaire & smash burgers d''exception',
    tagline_ar TEXT DEFAULT 'فن الهندسة الغذائية وأشهى برجر في الجزائر',
    currency_fr TEXT DEFAULT 'DA',
    currency_ar TEXT DEFAULT 'د.ج',
    delivery_fee INTEGER DEFAULT 250,
    phone TEXT DEFAULT '05 50 12 34 56',
    address_fr TEXT DEFAULT '14 Boulevard Sidi Yahia, Hydra, Alger',
    address_ar TEXT DEFAULT '14 شارع سيدي يحيى، حيدرة، الجزائر العاصمة',
    maps_url TEXT DEFAULT 'https://maps.google.com/?q=Hydra,Alger',
    logo_url TEXT DEFAULT '/logo.png',
    prep_time_minutes INTEGER DEFAULT 15,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des Catégories du Menu
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    icon TEXT DEFAULT '🍔',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 4. Table des Plats du Menu (Burgers, Menus, Sides, Boissons, Desserts)
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_fr TEXT,
    description_ar TEXT,
    price INTEGER NOT NULL CHECK (price >= 0), -- Prix en Dinar Algérien (DA)
    image_url TEXT,
    prep_time TEXT DEFAULT '15 min',
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table du Stock des Ingrédients & Sauces (Curseurs Gourmet 0 à 15)
CREATE TABLE IF NOT EXISTS public.ingredients_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    icon TEXT DEFAULT '🥫',
    is_available BOOLEAN DEFAULT true,
    min_gauge INTEGER DEFAULT 0,
    max_gauge INTEGER DEFAULT 15,
    default_gauge INTEGER DEFAULT 7,
    extra_cost INTEGER DEFAULT 0,
    unit_label TEXT DEFAULT 'Niveau',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Table des Livreurs / Coursiers (Avec système d'approbation et suspension)
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name_fr TEXT NOT NULL,
    name_ar TEXT,
    phone TEXT NOT NULL UNIQUE,
    vehicle_fr TEXT DEFAULT 'Moto Yamaha 125',
    vehicle_ar TEXT DEFAULT 'دراجة نارية',
    photo_url TEXT,
    status driver_status DEFAULT 'pending_approval'::driver_status, -- 🟡 Nécessite validation Admin !
    rating NUMERIC(3, 2) DEFAULT 5.00,
    today_earnings INTEGER DEFAULT 0,
    deliveries_count INTEGER DEFAULT 0,
    points INTEGER DEFAULT 100,
    negative_reviews_count INTEGER DEFAULT 0,
    latitude DOUBLE PRECISION DEFAULT 36.7538,
    longitude DOUBLE PRECISION DEFAULT 3.0588,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Table des Clients Favoris d'un Livreur (Étoiles ⭐ sur la carte)
CREATE TABLE IF NOT EXISTS public.driver_favorite_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    client_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(driver_id, client_profile_id)
);

-- 8. Table Principale des Commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    is_for_someone_else BOOLEAN DEFAULT false,
    recipient_name TEXT,
    recipient_phone TEXT,
    recipient_address TEXT,
    payment_mode payment_mode DEFAULT 'client_cash'::payment_mode,
    house_gift TEXT,
    items_summary_fr TEXT,
    items_summary_ar TEXT,
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER DEFAULT 250,
    total INTEGER NOT NULL,
    status order_status DEFAULT 'pending'::order_status,
    call_confirmed BOOLEAN DEFAULT false,
    estimated_prep_time TEXT DEFAULT '15 min',
    latitude DOUBLE PRECISION DEFAULT 36.7538,
    longitude DOUBLE PRECISION DEFAULT 3.0588,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Table Détail des Éléments de Commande (Items & Customisations Sauces)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    dish_name_fr TEXT NOT NULL,
    dish_name_ar TEXT,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    customizations_summary TEXT,
    drinks_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 📌 PARTIE 3 : POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_favorite_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture profil utilisateur" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Modification de son propre profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insertion profil lors de l'inscription" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Lecture publique config restaurant" ON public.restaurant_config FOR SELECT USING (true);
CREATE POLICY "Lecture publique catégories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Lecture publique menu" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Lecture publique ingrédients stock" ON public.ingredients_stock FOR SELECT USING (true);

CREATE POLICY "Admin modifie menu" ON public.menu_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'anon'
);

CREATE POLICY "Admin modifie ingrédients stock" ON public.ingredients_stock FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'anon'
);

CREATE POLICY "Lecture publique des livreurs actifs" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Inscription nouveau livreur" ON public.drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin gère les statuts livreurs" ON public.drivers FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.uid() = profile_id
    OR auth.role() = 'anon'
);

CREATE POLICY "Lecture commandes" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Création de commande par tout client" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Mise à jour statut commande" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Lecture éléments commande" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Création éléments commande" ON public.order_items FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 📌 PARTIE 4 : TRIGGERS AUTOMATIQUES & DONNÉES INITIALES (SEED)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Client Gourmet'),
        new.raw_user_meta_data->>'avatar_url',
        'client'::user_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Données initiales de base
INSERT INTO public.restaurant_config (name_fr, name_ar, phone, address_fr, address_ar, delivery_fee)
VALUES ('The Engineer Burger', 'المهندس برغر', '05 50 12 34 56', '14 Boulevard Sidi Yahia, Hydra, Alger', '14 شارع سيدي يحيى، حيدرة، الجزائر العاصمة', 250)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name_fr, name_ar, icon, display_order) VALUES
('Burgers', 'برجر', '🍔', 1),
('Menus', 'وجبات كاملة', '🍟', 2),
('Sides', 'مقبلات وبطاطا', '🍗', 3),
('Boissons', 'مشروبات غازية وعصائر', '🥤', 4),
('Desserts', 'تحليات وحلويات', '🍦', 5)
ON CONFLICT DO NOTHING;

INSERT INTO public.ingredients_stock (name_fr, name_ar, icon, is_available, min_gauge, max_gauge, default_gauge, extra_cost) VALUES
('Harissa Algérienne (حار)', 'هريسة حارة جزائرية', '🌶️', true, 0, 15, 6, 0),
('Mayonnaise Onctueuse', 'مايونيز كريمي', '🥫', true, 0, 15, 8, 0),
('Sauce Fromagère Dorée', 'صلصة الجبن الذهبية', '🧀', true, 0, 15, 7, 50),
('Sauce Algérienne Épicée', 'صلصة جزائرية خاصة', '🧅', true, 0, 15, 6, 0),
('Oignons Caramélisés', 'بصل مكرمل', '🧅', true, 0, 15, 7, 0),
('Cornichons Croquants (Pickles)', 'مخلل خيار مقرمش', '🥒', true, 0, 15, 6, 0),
('Sauce Barbecue Fumée', 'صلصة باربيكيو مدخنة', '🥫', true, 0, 15, 5, 0)
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_items (name_fr, name_ar, description_fr, description_ar, price, image_url, prep_time, is_featured) VALUES
('Double Engineer Burger', 'برجر المهندس دبل', 'Double steak pur bœuf algérien, cheddar affiné, sauce secrète, oignons caramélisés.', 'شريحتا لحم بقري طازج، جبن شيدر مزدوج، صلصة المهندس الخاصة وبصل مكرمل.', 950, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', '15 min', true),
('Architect Smash Burger', 'برجر المعماري سماش', 'Steak smashé croustillant, cheddar fondu, pickles maison, sauce algérienne épicée.', 'لحم بقري محمر بطريقة السماش المقرمشة مع جبن ذائب ومخلل وصلصة جزائرية حارة.', 1100, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80', '12 min', true),
('Crispy Master Chicken', 'دجاج كريسبي ماستر', 'Filet de poulet fermier pané aux épices, salade croquante, mayonnaise onctueuse.', 'صدر دجاج مقرمش متبل بخلطة بهارات المهندس مع خس وصلصة مايونيز كريمية.', 900, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80', '14 min', true),
('Frites Maison & Sauces Gourmet', 'بطاطا مقلية وصلصات فاخرة', 'Frites fraîches maison dorées avec sauce fromagère.', 'حصة وفيرة من البطاطا الطازجة المقلية بصلصة الجبن الذهبية.', 350, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80', '8 min', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.drivers (name_fr, name_ar, phone, vehicle_fr, vehicle_ar, status, rating, deliveries_count, photo_url) VALUES
('Karim Benali', 'كريم بن علي', '05 52 11 22 33', 'Moto Yamaha 125', 'دراجة نارية ياماها', 'online'::driver_status, 4.95, 18, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
('Mehdi Meziane', 'مهدي مزيان', '06 61 44 55 66', 'Scooter Sym 150', 'سكوتر سيم 150', 'online'::driver_status, 4.88, 13, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'),
('Sofiane Mansouri', 'سفيان منصوري', '07 70 88 99 00', 'Vélo Électrique', 'دراجة كهربائية', 'pending_approval'::driver_status, 5.00, 0, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80')
ON CONFLICT (phone) DO NOTHING;
