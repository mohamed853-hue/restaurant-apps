-- ==============================================================================
-- 🍔 THE ENGINEER BURGER (برجر المهندس) - CATALOGUE COMPLET DES PLATS (SQL SEED)
-- ==============================================================================
-- Exécutez ce script dans Supabase (SQL Editor) pour insérer tous les plats du menu !
-- ==============================================================================

-- 1. VIDER ET RÉINSÉRER LES CATÉGORIES
TRUNCATE TABLE public.menu_items CASCADE;
TRUNCATE TABLE public.categories CASCADE;

INSERT INTO public.categories (id, name_fr, name_ar, icon, display_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'Burgers Signature', 'برجر المهندس الفاخر', '🍔', 1),
('c2222222-2222-2222-2222-222222222222', 'Smash & Crispy Chicken', 'سماش ودجاج كريسبي', '🍗', 2),
('c3333333-3333-3333-3333-333333333333', 'Menus Complets + Boisson', 'وجبات كاملة مع مشروب', '🍟', 3),
('c4444444-4444-4444-4444-444444444444', 'Sides & Accompagnements', 'مقبلات وبطاطا مقلية', '🧀', 4),
('c5555555-5555-5555-5555-555555555555', 'Boissons Fraîches', 'مشروبات باردة وعصائر', '🥤', 5),
('c6666666-6666-6666-6666-666666666666', 'Desserts & Glaces', 'تحليات وحلويات', '🍦', 6);

-- 2. INSERTION DE TOUS LES PLATS PHARES THE ENGINEER BURGER
INSERT INTO public.menu_items (category_id, name_fr, name_ar, description_fr, description_ar, price, image_url, prep_time, is_featured) VALUES

-- 🍔 CATEGORIE 1 : BURGERS SIGNATURE
(
    'c1111111-1111-1111-1111-111111111111',
    'Double Engineer Burger',
    'برجر المهندس دبل',
    'Double steak haché pur bœuf algérien, double cheddar affiné, sauce secrète de l''ingénieur, oignons caramélisés.',
    'شريحتا لحم بقري طازج، جبن شيدر مزدوج، صلصة المهندس الخاصة وبصل مكرمل.',
    950,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    '15 min',
    true
),
(
    'c1111111-1111-1111-1111-111111111111',
    'Triple Boss Tower Burger',
    'برجر القمة الثلاثي بوس',
    'Trois steaks hachés juteux, triple tranche de gouda fondant, bacon de bœuf halal grillé et sauce barbecue fumée.',
    'ثلاث شرائح لحم مشوية، جبن غودا ذائب، بيف بيكون مدخن وصلصة باربيكيو خاصة.',
    1450,
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    '18 min',
    true
),
(
    'c1111111-1111-1111-1111-111111111111',
    'Gourmet Truffle & Cheese',
    'برجر الترفل الفاخر والجبن',
    'Steak gourmet bœuf sélectionné, crème de truffe noire, fromage emmental suisse et roquette fraîche.',
    'لحم بقري فاخر بصلصة الترفل الأسود وجبن إمنتال سويسري وجرجير طازج.',
    1350,
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    '15 min',
    true
),

-- 🍗 CATEGORIE 2 : SMASH & CRISPY CHICKEN
(
    'c2222222-2222-2222-2222-222222222222',
    'Architect Smash Burger',
    'برجر المعماري سماش',
    'Steak smashé croustillant aux bords dorés, cheddar fondu, pickles maison, sauce algérienne épicée.',
    'لحم بقري محمر بطريقة السماش المقرمشة مع جبن ذائب ومخلل وصلصة جزائرية حارة.',
    1100,
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    '12 min',
    true
),
(
    'c2222222-2222-2222-2222-222222222222',
    'Crispy Master Chicken',
    'دجاج كريسبي ماستر',
    'Filet de poulet fermier extra croustillant pané aux 11 épices, salade croquante, mayonnaise onctueuse.',
    'صدر دجاج مقرمش متبل بخلطة بهارات المهندس مع خس وصلصة مايونيز كريمية.',
    900,
    'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
    '14 min',
    true
),
(
    'c2222222-2222-2222-2222-222222222222',
    'Spicy Volcano Chicken',
    'دجاج البركان الحار',
    'Poulet croustillant nappé de sauce piquante habanero & harissa rouge, jalapeños et fromage pepper jack.',
    'دجاج مقرمش بصلصة الهابانيرو الحارة مع فلفل هالبينو وجبن حار.',
    950,
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80',
    '14 min',
    false
),

-- 🍟 CATEGORIE 3 : MENUS COMPLETS (AVEC FRITES ET BOISSON)
(
    'c3333333-3333-3333-3333-333333333333',
    'Menu Maxi Engineer Burger + Frites + Boisson',
    'وجبة ماكسي المهندس + بطاطا + مشروب',
    'Double Engineer Burger + Grande portion de frites maison dorées + 1 Boisson 33cl au choix.',
    'برجر المهندس دبل مع حصة بطاطا مقلية عائلية ومشروب بارد من اختيارك.',
    1350,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    '15 min',
    true
),
(
    'c3333333-3333-3333-3333-333333333333',
    'Menu Duo Architect Lovers (2 Personnes)',
    'وجبة العشاق لشخصين',
    '2 Burgers au choix (Bœuf ou Poulet) + 2 Frites fraîches + 2 Boissons fraîches 33cl.',
    'برجرين من اختيارك مع حصتين بطاطا ومشروبين غازيين.',
    2400,
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    '20 min',
    false
),

-- 🧀 CATEGORIE 4 : SIDES & ACCOMPAGNEMENTS
(
    'c4444444-4444-4444-4444-444444444444',
    'Frites Maison & Sauce Fromagère Dorée',
    'بطاطا طازجة مع صلصة الجبن الذهبية',
    'Portion de frites fraîches maison croustillantes nappées de notre sauce fromagère chaude.',
    'بطاطا طازجة مقرمشة مغطاة بصلصة الجبن الذائبة الساخنة.',
    350,
    'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    '8 min',
    false
),
(
    'c4444444-4444-4444-4444-444444444444',
    'Mozzarella Sticks Fondants (6 pcs)',
    'أصابع جبن الموزاريلا المقرمشة (6 قطع)',
    'Bâtonnets de mozzarella panés croustillants servis avec sauce barbecue fumée.',
    'أصابع موزاريلا مقلية مع صلصة باربيكيو خاصة.',
    450,
    'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=600&q=80',
    '7 min',
    false
),
(
    'c4444444-4444-4444-4444-444444444444',
    'Tenders Poulet Croustillant (4 pcs)',
    'قطع تندر دجاج كريسبي (4 قطع)',
    'Aiguillettes de poulet 100% filet panées aux herbes et épices.',
    'قطع دجاج تندر مقرمشة شهية.',
    500,
    'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    '9 min',
    false
),

-- 🥤 CATEGORIE 5 : BOISSONS FRAÎCHES
(
    'c5555555-5555-5555-5555-555555555555',
    'Hamoud Boualem Selecto Canette 33cl',
    'حمود بوعلام سيلكتو 33 مل',
    'La boisson mythique algérienne au goût caramel unique.',
    'المشروب الغازي الجزائري الأصيل بنكهة الكراميل المميزة.',
    120,
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    '1 min',
    false
),
(
    'c5555555-5555-5555-5555-555555555555',
    'Hamoud Boualem Gazouz Blanche 33cl',
    'حمود بوعلام بيضاء بالليمون 33 مل',
    'Boisson gazeuse rafraîchissante au citron.',
    'مشروب غازي منعش بالليمون الطبيعي.',
    120,
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    '1 min',
    false
),
(
    'c5555555-5555-5555-5555-555555555555',
    'Coca-Cola Frais 33cl',
    'كوكاكولا باردة 33 مل',
    'Canette fraîche originale Coca-Cola.',
    'كوكاكولا أصلية باردة.',
    140,
    'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=600&q=80',
    '1 min',
    false
),
(
    'c5555555-5555-5555-5555-555555555555',
    'Eau Minérale Ifri 50cl',
    'مياه معدنية إفرو 50 مل',
    'Bouteille d''eau minérale naturelle.',
    'مياه معدنية طبيعية نقية.',
    60,
    'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    '1 min',
    false
),

-- 🍦 CATEGORIE 6 : DESSERTS & GLACES
(
    'c6666666-6666-6666-6666-666666666666',
    'Fondant au Chocolat & Cœur Coulant',
    'فوندان الشوكولاتة الذائبة',
    'Délicieux gâteau au chocolat noir avec cœur chaud fondant.',
    'كعكة الشوكولاتة الساخنة بقلب ذائب وشهي.',
    450,
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    '5 min',
    false
),
(
    'c6666666-6666-6666-6666-666666666666',
    'Cheesecake Spéculoos & Caramel Beurre Salé',
    'تشيز كيك سبيكولوس بالكراميل',
    'Cheesecake crémeux sur lit de biscuits spéculoos croquants.',
    'تشيز كيك كريمي فاخر بصوص الكراميل.',
    550,
    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
    '3 min',
    false
);
