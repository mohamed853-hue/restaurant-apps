const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database for "The Engineer Burger" (برجر المهندس)
let restaurantConfig = {
  name_fr: "The Engineer Burger",
  name_ar: "المهندس برغر",
  tagline_fr: "L'art de l'ingénierie culinaire & smash burgers d'exception",
  tagline_ar: "فن الهندسة الغذائية وأشهى برجر في الجزائر",
  currency_fr: "DA",
  currency_ar: "د.ج",
  deliveryFee: 250,
  phone: "05 50 12 34 56",
  address_fr: "14 Boulevard Sidi Yahia, Hydra, Alger",
  address_ar: "14 شارع سيدي يحيى، حيدرة، الجزائر العاصمة",
  mapsUrl: "https://maps.google.com/?q=Hydra,Alger",
  logoUrl: "/logo.png",
  prepTimeMinutes: 15,
  isOpen: true
};

let stats = {
  todayOrders: 58,
  activeDeliveries: 4,
  newCustomers: 18,
  todayRevenue: 182400, // in DZD (DA)
  onlineDrivers: 6,
  satisfactionRate: "98.5%"
};

let categories = ["Burgers", "Menus", "Boissons", "Sides", "Desserts", "Sauces"];

// Ingredients & Sauces Stock (Dynamic: Add, Delete, Toggle Rupture)
let ingredientsStock = [
  {
    id: "ing-harissa",
    name_fr: "Harissa Algérienne (Piment / حار)",
    name_ar: "هريسة حارة جزائرية",
    isAvailable: true,
    min: 0,
    max: 15,
    defaultVal: 5,
    extraCost: 0,
    unit: "Intensité",
    icon: "🌶️"
  },
  {
    id: "ing-mayo",
    name_fr: "Mayonnaise Onctueuse",
    name_ar: "مايونيز كريمي",
    isAvailable: true,
    min: 0,
    max: 15,
    defaultVal: 8,
    extraCost: 0,
    unit: "Niveau",
    icon: "🥫"
  },
  {
    id: "ing-fromagere",
    name_fr: "Sauce Fromagère Dorée",
    name_ar: "صلصة الجبن الذهبية",
    isAvailable: true,
    min: 0,
    max: 15,
    defaultVal: 7,
    extraCost: 50,
    unit: "Générosité",
    icon: "🧀"
  },
  {
    id: "ing-algerienne",
    name_fr: "Sauce Algérienne Épicée",
    name_ar: "صلصة جزائرية خاصة",
    isAvailable: true,
    min: 0,
    max: 15,
    defaultVal: 6,
    extraCost: 0,
    unit: "Niveau",
    icon: "🧅"
  },
  {
    id: "ing-onions",
    name_fr: "Oignons Caramélisés",
    name_ar: "بصل مكرمل",
    isAvailable: true,
    min: 0,
    max: 15,
    defaultVal: 7,
    extraCost: 0,
    unit: "Quantité",
    icon: "🧅"
  },
  {
    id: "ing-pickles",
    name_fr: "Cornichons Croquants (Pickles)",
    name_ar: "مخلل خيار مقرمش",
    isAvailable: true,
    min: 0,
    max: 15,
    defaultVal: 6,
    extraCost: 0,
    unit: "Quantité",
    icon: "🥒"
  },
  {
    id: "ing-cheddar",
    name_fr: "Fromage Cheddar Fondu",
    name_ar: "جبن شيدر ذائب",
    isAvailable: true,
    min: 0,
    max: 15,
    defaultVal: 8,
    extraCost: 100,
    unit: "Tranches",
    icon: "🧀"
  }
];

let drinksList = [
  {
    id: "drk-1",
    name_fr: "Hamoud Boualem Selecto 33cl",
    name_ar: "حمود بوعلام سيلكتو 33 سل",
    price: 120,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "drk-2",
    name_fr: "Coca-Cola Original Frais 33cl",
    name_ar: "كوكاكولا أصلية 33 سل",
    price: 120,
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "drk-3",
    name_fr: "Fanta Orange Frais 33cl",
    name_ar: "فانتا برتقال 33 سل",
    price: 120,
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "drk-4",
    name_fr: "Eau Minérale Lalla Khedidja 50cl",
    name_ar: "مياه معدنية لالة خديجة 50 سل",
    price: 80,
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "drk-5",
    name_fr: "Jus d'Orange Frais Pressé",
    name_ar: "عصير برتقال طازج",
    price: 180,
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80"
  }
];

let menuItems = [
  {
    id: "eb-1",
    name_fr: "Double Engineer Burger",
    name_ar: "برجر المهندس دبل",
    description_fr: "Double steak Black Angus 150g, cheddar maturé, oignons caramélisés & sauce secrète 'Blueprint'.",
    description_ar: "شريحتان لحم أنجوس أسود 150 جم، جبن شيدر معتق، بصل مكرمل وصلصة المخطط الهندسية الخاصة.",
    price: 950,
    originalPrice: 1100,
    hasPromo: true,
    promoDiscount: "-15%",
    category: "Burgers",
    prepTime: "12-15 min",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "eb-2",
    name_fr: "Architect Smash Burger Triple",
    name_ar: "برجر المهندس المعماري تريبل سماش",
    description_fr: "Triple smash steak croustillant, bacon de bœuf fumé, pickles maison & sauce barbecue fumée.",
    description_ar: "ثلاث شرائح سماش مقرمشة، لحم بقري مقدد مدخن، مخلل منزلي وصلصة باربيكيو مدخنة.",
    price: 1250,
    originalPrice: 1250,
    hasPromo: false,
    promoDiscount: "",
    category: "Burgers",
    prepTime: "15 min",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "eb-3",
    name_fr: "Crispy Precision Chicken",
    name_ar: "برجر الدجاج المقرمش فائق الدقة",
    description_fr: "Filet de poulet frais mariné au babeurre, panure aux 11 épices secrètes & coleslaw frais.",
    description_ar: "صدر دجاج طازج متبل بالبهارات الخاصة، تغطية مقرمشة وسلطة كول سلو طازجة.",
    price: 850,
    originalPrice: 950,
    hasPromo: true,
    promoDiscount: "-10%",
    category: "Burgers",
    prepTime: "12 min",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "eb-4",
    name_fr: "Frites Maison & Sauce Fromagère Dorée",
    name_ar: "بطاطس مقلية مع صلصة الجبن الذهبية",
    description_fr: "Pommes de terre fraîches coupées à la main, double cuisson, cheddar fondu & oignons frits.",
    description_ar: "بطاطس طازجة مقلية مرتين مع صلصة الجبن الذهبية الغنية والبصل المقرمش.",
    price: 350,
    originalPrice: 350,
    hasPromo: false,
    promoDiscount: "",
    category: "Sides",
    prepTime: "8 min",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "eb-5",
    name_fr: "Menu Box Ingénieur (Burger + Frites + Boisson)",
    name_ar: "وجبة بوكس المهندس (برجر + بطاطس + مشروب)",
    description_fr: "1 Double Engineer Burger + 1 Frites Dorées + 1 Boisson fraîche au choix.",
    description_ar: "1 برجر المهندس دبل + 1 بطاطس ذهبية + 1 مشروب بارد من اختيارك.",
    price: 1350,
    originalPrice: 1550,
    hasPromo: true,
    promoDiscount: "-200 DA",
    category: "Menus",
    prepTime: "15 min",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80"
  }
];

let drivers = [
  {
    id: "drv-1",
    name_fr: "Karim Benali",
    name_ar: "كريم بن علي",
    phone: "05 52 11 22 33",
    vehicle_fr: "Moto Yamaha 125",
    vehicle_ar: "دراجة نارية ياماها",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    icon: "🛵",
    rating: 4.95,
    todayEarnings: 4500,
    deliveriesCount: 18,
    points: 340,
    negativeReviewsCount: 0,
    status: "online",
    currentOrderId: null,
    favoriteClients: ["c-1", "c-2"],
    coordinates: { lat: 36.7538, lng: 3.0588 }
  },
  {
    id: "drv-2",
    name_fr: "Mehdi Meziane",
    name_ar: "مهدي مزيان",
    phone: "06 61 44 55 66",
    vehicle_fr: "Scooter Sym 150",
    vehicle_ar: "سكوتر سيم 150",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    icon: "🛵",
    rating: 4.88,
    todayEarnings: 3250,
    deliveriesCount: 13,
    points: 260,
    negativeReviewsCount: 1,
    status: "busy",
    currentOrderId: "CMD-789",
    favoriteClients: ["c-1"],
    coordinates: { lat: 36.7450, lng: 3.0480 }
  },
  {
    id: "drv-3",
    name_fr: "Sofiane Mansouri",
    name_ar: "سفيان منصوري",
    phone: "07 70 88 99 00",
    vehicle_fr: "Vélo Électrique",
    vehicle_ar: "دراجة كهربائية",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    icon: "🚲",
    rating: 4.92,
    todayEarnings: 2750,
    deliveriesCount: 11,
    points: 210,
    negativeReviewsCount: 0,
    status: "online",
    currentOrderId: null,
    favoriteClients: ["c-3"],
    coordinates: { lat: 36.7600, lng: 3.0650 }
  }
];

let orders = [
  {
    id: "CMD-789",
    customer_fr: "Amine Bouzid",
    customer_ar: "أمين بوزيد",
    phone: "05 54 88 77 66",
    address_fr: "14 Boulevard Sidi Yahia, Hydra, Alger",
    address_ar: "14 شارع سيدي يحيى، حيدرة، الجزائر العاصمة",
    isForSomeoneElse: true,
    recipientName: "Sarah Bouzid (Épouse)",
    recipientPhone: "05 50 99 88 77",
    recipientAddress: "Cité 106 Logements, Bat B, Hydra, Alger",
    payerType: "recipient_cash",
    items_fr: "Double Engineer Burger (Plat #1) + Selecto",
    items_ar: "برجر المهندس دبل (رقم 1) + سيلكتو",
    itemsList: [
      {
        id: "eb-1",
        name_fr: "Double Engineer Burger (Plat #1)",
        name_ar: "برجر المهندس دبل (رقم 1)",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        quantity: 1,
        price: 950,
        customizations: "Harissa: 12/15 (Piquant 🔥), Mayonnaise: 10/15",
        drinks: [{ name: "Hamoud Boualem Selecto 33cl", quantity: 1, price: 120 }]
      }
    ],
    houseGift: "🎁 1x Canette Selecto Offerte",
    subtotal: 1070,
    deliveryFee: 250,
    total: 1320,
    status: "preparing",
    status_fr: "En préparation en cuisine",
    status_ar: "قيد التحضير في المطبخ",
    estimatedPrepTime: "15 min",
    time: "14:15",
    driverId: "drv-2",
    driver_fr: "Mehdi Meziane (Scooter Sym)",
    driver_ar: "مهدي مزيان (سكوتر سيم)",
    driverPhone: "06 61 44 55 66",
    callConfirmed: true
  },
  {
    id: "CMD-788",
    customer_fr: "Yasmine Khelil",
    customer_ar: "ياسمين خليل",
    phone: "07 72 33 44 55",
    address_fr: "28 Rue Didouche Mourad, Alger Centre",
    address_ar: "28 شارع ديدوش مراد، الجزائر الوسطى",
    isForSomeoneElse: false,
    recipientName: null,
    recipientPhone: null,
    recipientAddress: null,
    payerType: "client_cash",
    items_fr: "1x Architect Smash Burger + 1x Coca-Cola",
    items_ar: "1x برجر المهندس المعماري + 1x كوكاكولا",
    itemsList: [
      {
        id: "eb-2",
        name_fr: "Architect Smash Burger Triple",
        name_ar: "برجر المهندس المعماري تريبل سماش",
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
        quantity: 1,
        price: 1250,
        customizations: "Fromage Cheddar: 15/15 MAX",
        drinks: [{ name: "Coca-Cola Original Frais 33cl", quantity: 1, price: 120 }]
      }
    ],
    houseGift: null,
    subtotal: 1370,
    deliveryFee: 250,
    total: 1620,
    status: "out_for_delivery",
    status_fr: "En cours de livraison 🛵",
    status_ar: "في الطريق مع السائق 🛵",
    estimatedPrepTime: "12 min",
    time: "14:02",
    driverId: "drv-1",
    driver_fr: "Karim Benali (Moto Yamaha)",
    driver_ar: "كريم بن علي (دراجة ياماها)",
    driverPhone: "05 52 11 22 33",
    callConfirmed: true
  }
];

let customers = [
  { 
    id: "c-1", 
    name: "Amine Bouzid", 
    phone: "05 54 88 77 66", 
    age: 26,
    registeredAt: "15 Janvier 2026",
    address: "14 Bd Sidi Yahia, Hydra, Alger", 
    addresses: [
      { label: "Maison", address: "14 Bd Sidi Yahia, Hydra, Alger", icon: "🏠" },
      { label: "Bureau", address: "28 Rue Didouche Mourad, Alger Centre", icon: "🏢" }
    ],
    favoriteItems: ["Double Engineer Burger", "Frites Maison & Sauce Fromagère"],
    totalOrders: 19, 
    totalSpent: 45000, 
    loyaltyPoints: 450, 
    membershipTier: "VIP Gourmet ⭐",
    lat: 36.7538, 
    lng: 3.0588 
  },
  { 
    id: "c-2", 
    name: "Yasmine Khelil", 
    phone: "07 72 33 44 55", 
    age: 23,
    registeredAt: "02 Février 2026",
    address: "28 Rue Didouche Mourad, Alger Centre", 
    addresses: [
      { label: "Maison", address: "28 Rue Didouche Mourad, Alger Centre", icon: "🏠" }
    ],
    favoriteItems: ["Architect Smash Burger", "Selecto 33cl"],
    totalOrders: 11, 
    totalSpent: 26800, 
    loyaltyPoints: 260, 
    membershipTier: "Membre Gold 🥇",
    lat: 36.7750, 
    lng: 3.0590 
  },
  { 
    id: "c-3", 
    name: "Nabil Cherif", 
    phone: "06 63 99 11 22", 
    age: 31,
    registeredAt: "28 Décembre 2025",
    address: "5 Cité El Biar, Alger", 
    addresses: [
      { label: "Maison", address: "5 Cité El Biar, Alger", icon: "🏠" }
    ],
    favoriteItems: ["Crispy Master Chicken"],
    totalOrders: 9, 
    totalSpent: 31000, 
    loyaltyPoints: 310, 
    membershipTier: "Membre Gold 🥇",
    lat: 36.7620, 
    lng: 3.0310 
  },
  { 
    id: "c-4", 
    name: "Ryad Mahrez", 
    phone: "05 50 99 88 77", 
    age: 33,
    registeredAt: "10 Novembre 2025",
    address: "Boulevard Principal, Chéraga, Alger", 
    addresses: [
      { label: "Maison", address: "Boulevard Principal, Chéraga, Alger", icon: "🏠" }
    ],
    favoriteItems: ["Double Engineer Burger", "Tacos Master Chef"],
    totalOrders: 24, 
    totalSpent: 68400, 
    loyaltyPoints: 680, 
    membershipTier: "Platine VIP 👑",
    lat: 36.7710, 
    lng: 2.9550 
  }
];

function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: {
      restaurantConfig,
      stats,
      categories,
      ingredientsStock,
      drinksList,
      menuItems,
      orders,
      drivers,
      customers
    }
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleClientMessage(data, ws);
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });
});

function handleClientMessage(data, ws) {
  const { type, payload } = data;

  switch (type) {
    case 'CREATE_ORDER': {
      const newId = `CMD-${Math.floor(790 + Math.random() * 100)}`;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newOrder = {
        id: newId,
        customer_fr: payload.customer_fr || "Client Mobile",
        customer_ar: payload.customer_ar || "عميل التطبيق",
        phone: payload.phone || "05 50 12 34 56",
        address_fr: payload.address_fr || "Hydra, Alger",
        address_ar: payload.address_ar || "حيدرة، الجزائر العاصمة",
        isForSomeoneElse: Boolean(payload.isForSomeoneElse),
        recipientName: payload.recipientName || null,
        recipientPhone: payload.recipientPhone || null,
        recipientAddress: payload.recipientAddress || null,
        payerType: payload.payerType || "client_cash",
        items_fr: payload.items_fr || "Double Engineer Burger",
        items_ar: payload.items_ar || "برجر المهندس دبل",
        itemsList: payload.itemsList || [],
        houseGift: payload.houseGift || null,
        subtotal: payload.subtotal || 950,
        deliveryFee: restaurantConfig.deliveryFee,
        total: payload.total || (payload.subtotal + restaurantConfig.deliveryFee),
        status: "pending",
        status_fr: "En attente de confirmation",
        status_ar: "في انتظار تأكيد المطعم",
        estimatedPrepTime: `${restaurantConfig.prepTimeMinutes || 15} min`,
        time: timeStr,
        driverId: null,
        driver_fr: "Non assigné",
        driver_ar: "غير معين",
        driverPhone: "-",
        callConfirmed: false
      };

      orders.unshift(newOrder);
      stats.todayOrders += 1;
      stats.todayRevenue += newOrder.total;

      broadcast('ORDER_CREATED', { order: newOrder, stats, orders });
      break;
    }

    case 'CONFIRM_ORDER_AVAILABILITY': {
      const { orderId, isAvailable, houseGift } = payload;
      const order = orders.find(o => o.id === orderId);
      if (order) {
        if (isAvailable) {
          order.status = "preparing";
          order.status_fr = "En préparation en cuisine";
          order.status_ar = "قيد التحضير في المطبخ";
          order.callConfirmed = true;
          if (houseGift) order.houseGift = houseGift;
        } else {
          order.status = "cancelled";
          order.status_fr = "Non disponible / Annulée";
          order.status_ar = "غير متوفر / ملغي";
        }
        broadcast('ORDER_UPDATED', { order, orders, stats });
      }
      break;
    }

    case 'ASSIGN_DRIVER': {
      const { orderId, driverId } = payload;
      const order = orders.find(o => o.id === orderId);
      const driver = drivers.find(d => d.id === driverId);

      if (order && driver) {
        order.driverId = driver.id;
        order.driver_fr = `${driver.name_fr} (${driver.vehicle_fr})`;
        order.driver_ar = `${driver.name_ar} (${driver.vehicle_ar})`;
        order.driverPhone = driver.phone;
        order.status = "out_for_delivery";
        order.status_fr = "En cours de livraison 🛵";
        order.status_ar = "في الطريق مع السائق 🛵";

        driver.status = "busy";
        driver.currentOrderId = order.id;

        broadcast('ORDER_ASSIGNED_DRIVER', { order, driver, drivers, orders });
      }
      break;
    }

    case 'MARK_DELIVERED': {
      const { orderId } = payload;
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = "delivered";
        order.status_fr = "Livrée avec succès 🎉";
        order.status_ar = "تم التوصيل بنجاح 🎉";

        if (order.driverId) {
          const drv = drivers.find(d => d.id === order.driverId);
          if (drv) {
            drv.status = "online";
            drv.currentOrderId = null;
            drv.todayEarnings += 250;
            drv.deliveriesCount += 1;
            drv.points += 20;
          }
        }
        broadcast('ORDER_DELIVERED', { order, drivers, orders });
      }
      break;
    }

    // 1. ADD NEW INGREDIENT / SAUCE
    case 'ADD_INGREDIENT': {
      const newIng = {
        id: `ing-${Date.now()}`,
        name_fr: payload.name_fr,
        name_ar: payload.name_ar || payload.name_fr,
        isAvailable: true,
        min: 0,
        max: Number(payload.max) || 15,
        defaultVal: Number(payload.defaultVal) || 6,
        extraCost: Number(payload.extraCost) || 0,
        unit: payload.unit || "Niveau",
        icon: payload.icon || "🥫"
      };
      ingredientsStock.push(newIng);
      broadcast('INGREDIENTS_UPDATED', ingredientsStock);
      break;
    }

    // 2. DELETE INGREDIENT COMPLETELY
    case 'DELETE_INGREDIENT': {
      const { id } = payload;
      ingredientsStock = ingredientsStock.filter(i => i.id !== id);
      broadcast('INGREDIENTS_UPDATED', ingredientsStock);
      break;
    }

    // 3. TOGGLE INGREDIENT RUPTURE / DISPO
    case 'TOGGLE_INGREDIENT': {
      const { id, isAvailable } = payload;
      const ing = ingredientsStock.find(i => i.id === id);
      if (ing) {
        ing.isAvailable = isAvailable;
        broadcast('INGREDIENTS_UPDATED', ingredientsStock);
      }
      break;
    }

    // 5. ADD MENU ITEM (DISH)
    case 'ADD_MENU_ITEM': {
      const newItem = {
        id: `dish-${Date.now()}`,
        name_fr: payload.name_fr,
        name_ar: payload.name_ar || payload.name_fr,
        description_fr: payload.description_fr || "Délicieuse création gourmande The Engineer Burger",
        description_ar: payload.description_ar || "إبداع مميز من المهندس برغر",
        price: Number(payload.price) || 850,
        category: payload.category || "Burgers",
        image: payload.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        prepTime: payload.prepTime || "15 min",
        isAvailable: true
      };
      menuItems.unshift(newItem);
      broadcast('MENU_UPDATED', { menuItems, categories });
      break;
    }

    // 6. DRIVER ACCOUNT CREATION & ADMIN APPROVAL / SUSPENSION WORKFLOW
    case 'REGISTER_DRIVER': {
      const newDriver = {
        id: `drv-${Date.now()}`,
        name_fr: payload.name_fr,
        name_ar: payload.name_ar || payload.name_fr,
        phone: payload.phone,
        vehicle_fr: payload.vehicle_fr || "Moto Yamaha 125",
        vehicle_ar: payload.vehicle_ar || "دراجة نارية",
        photoUrl: payload.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        icon: "🛵",
        rating: 5.0,
        todayEarnings: 0,
        deliveriesCount: 0,
        points: 100,
        negativeReviewsCount: 0,
        status: "pending_approval", // 🟡 En attente de validation par l'Admin
        currentOrderId: null,
        favoriteClients: [],
        coordinates: { lat: 36.7538, lng: 3.0588 }
      };
      drivers.push(newDriver);
      broadcast('DRIVERS_UPDATED', drivers);
      break;
    }

    case 'APPROVE_DRIVER': {
      const { driverId } = payload;
      const drv = drivers.find(d => d.id === driverId);
      if (drv) {
        drv.status = "online";
        broadcast('DRIVERS_UPDATED', drivers);
      }
      break;
    }

    case 'REJECT_DRIVER': {
      const { driverId } = payload;
      drivers = drivers.filter(d => d.id !== driverId);
      broadcast('DRIVERS_UPDATED', drivers);
      break;
    }

    case 'SUSPEND_DRIVER': {
      const { driverId } = payload;
      const drv = drivers.find(d => d.id === driverId);
      if (drv) {
        drv.status = "suspended";
        drv.currentOrderId = null;
        broadcast('DRIVERS_UPDATED', drivers);
      }
      break;
    }

    case 'REACTIVATE_DRIVER': {
      const { driverId } = payload;
      const drv = drivers.find(d => d.id === driverId);
      if (drv) {
        drv.status = "online";
        broadcast('DRIVERS_UPDATED', drivers);
      }
      break;
    }

    case 'UPDATE_DRIVER_PROFILE': {
      const { driverId, name_fr, name_ar, phone, vehicle_fr, photoUrl } = payload;
      const drv = drivers.find(d => d.id === (driverId || 'drv-1'));
      if (drv) {
        if (name_fr) drv.name_fr = name_fr;
        if (name_ar) drv.name_ar = name_ar || name_fr;
        if (phone) drv.phone = phone;
        if (vehicle_fr) drv.vehicle_fr = vehicle_fr;
        if (photoUrl) drv.photoUrl = photoUrl;
        broadcast('DRIVERS_UPDATED', drivers);
      }
      break;
    }

    case 'TOGGLE_DRIVER_FAVORITE_CLIENT': {
      const { driverId, clientId } = payload;
      const drv = drivers.find(d => d.id === (driverId || 'drv-1'));
      if (drv) {
        if (!drv.favoriteClients) drv.favoriteClients = [];
        if (drv.favoriteClients.includes(clientId)) {
          drv.favoriteClients = drv.favoriteClients.filter(id => id !== clientId);
        } else {
          drv.favoriteClients.push(clientId);
        }
        broadcast('DRIVERS_UPDATED', drivers);
      }
      break;
    }

    default:
      break;
  }
}

app.get('/api/state', (req, res) => {
  res.json({ restaurantConfig, stats, categories, ingredientsStock, drinksList, menuItems, orders, drivers, customers });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

app.get('/livreur', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'livreur.html'));
});

app.get('/client/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client_login.html'));
});
app.get('/login-client', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client_login.html'));
});

app.get('/livreur/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'driver_login.html'));
});
app.get('/driver/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'driver_login.html'));
});
app.get('/login-livreur', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'driver_login.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_login.html'));
});
app.get('/login-admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_login.html'));
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🍔 THE ENGINEER BURGER - MULTI-THEME DUAL BILINGUAL HUB`);
  console.log(`🌍 Currency : Dinar Algérien (DZD / DA / د.ج)`);
  console.log(`🚀 Live Hub : http://localhost:${PORT}`);
  console.log(`📱 Connexion Client  : http://localhost:${PORT}/client/login`);
  console.log(`🛵 Connexion Livreur : http://localhost:${PORT}/livreur/login`);
  console.log(`🛡️ Connexion Admin   : http://localhost:${PORT}/admin/login`);
  console.log(`📱 App Client        : http://localhost:${PORT}/client`);
  console.log(`🛵 App Livreur       : http://localhost:${PORT}/livreur`);
  console.log(`💻 Console Admin     : http://localhost:${PORT}/admin`);
  console.log(`=======================================================`);
});
