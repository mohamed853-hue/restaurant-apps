-- ==============================================================================
-- 🍔 THE ENGINEER BURGER (برجر المهندس) - TABLE APP_USERS & AUTHENTIFICATION RAPIDE
-- ==============================================================================
-- Table simplifiée et ultra-rapide pour la connexion par Numéro de Téléphone
-- + Code PIN à 6 chiffres + Option de liaison avec compte Google !
-- ==============================================================================

-- 1. CRÉATION DE LA TABLE APP_USERS
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,                       -- Numéro de téléphone algérien (05/06/07 xx xx xx)
    pin_code TEXT NOT NULL,                           -- Code secret / PIN à 6 chiffres (ex: 123456)
    full_name TEXT NOT NULL,                          -- Nom et prénom
    age INTEGER CHECK (age >= 5 AND age <= 120),      -- Âge du client / livreur
    role TEXT NOT NULL DEFAULT 'client'               -- 'client', 'driver', 'admin'
        CHECK (role IN ('client', 'driver', 'admin')),
    status TEXT NOT NULL DEFAULT 'active'             -- 'active', 'pending_approval', 'suspended'
        CHECK (status IN ('active', 'pending_approval', 'suspended')),
    vehicle TEXT,                                     -- Type de véhicule pour les livreurs (Moto Yamaha 125, Scooter Sym, etc.)
    loyalty_points INTEGER DEFAULT 0,                 -- Points de fidélité ⭐ pour les clients
    google_id TEXT,                                   -- ID du compte Google lié
    google_email TEXT,                                -- Email Google lié
    avatar_url TEXT,                                  -- Photo de profil
    default_address TEXT,                             -- Adresse principale (ex: Hydra, Alger)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour recherche instantanée sur le numéro de téléphone et le rôle
CREATE INDEX IF NOT EXISTS idx_app_users_phone ON public.app_users(phone);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON public.app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_users_status ON public.app_users(status);

-- 2. ACTIVATION DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Lecture publique pour authentification" ON public.app_users
    FOR SELECT USING (true);

CREATE POLICY "Inscription nouvel utilisateur" ON public.app_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Mise a jour de son compte ou par admin" ON public.app_users
    FOR UPDATE USING (true);

-- 3. INSERTION DES UTILISATEURS DE DÉPART (SEED)
-- Admin
INSERT INTO public.app_users (phone, pin_code, full_name, role, status, default_address)
VALUES ('0550123456', '1234', 'Directeur Restaurant', 'admin', 'active', '14 Boulevard Sidi Yahia, Hydra, Alger')
ON CONFLICT (phone) DO UPDATE SET pin_code = '1234', role = 'admin', status = 'active';

-- Clients types
INSERT INTO public.app_users (phone, pin_code, full_name, age, role, status, loyalty_points, default_address)
VALUES 
('0554887766', '123456', 'Amine Bouzid', 26, 'client', 'active', 450, '14 Bd Sidi Yahia, Hydra, Alger'),
('0772334455', '123456', 'Yasmine Khelil', 23, 'client', 'active', 260, '28 Rue Didouche Mourad, Alger Centre'),
('0663991122', '123456', 'Nabil Cherif', 31, 'client', 'active', 310, '5 Cité El Biar, Alger')
ON CONFLICT (phone) DO NOTHING;

-- Livreurs (1 Actif et 1 en Attente de validation)
INSERT INTO public.app_users (phone, pin_code, full_name, age, role, status, vehicle, default_address)
VALUES 
('0552112233', '123456', 'Karim Benali', 28, 'driver', 'active', 'Moto Yamaha 125', 'Hydra, Alger'),
('0661445566', '123456', 'Mehdi Meziane', 25, 'driver', 'active', 'Scooter Sym 150', 'Alger Centre'),
('0770889900', '123456', 'Sofiane Mansouri', 22, 'driver', 'pending_approval', 'Vélo Électrique', 'El Biar, Alger')
ON CONFLICT (phone) DO NOTHING;
