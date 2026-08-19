# 🍔 The Engineer Burger (برجر المهندس) - Ecosystem & Multi-App Platform

Bienvenue dans le dépôt officiel de **The Engineer Burger (برجر المهندس)**, la plateforme complète de commande, livraison et gestion de restaurant gourmet en Algérie (Dinar Algérien - DZD / DA / د.ج).

---

## 🚀 Vue d'Ensemble des Applications (3-en-1 Live Hub)

Le projet intègre un écosystème complet avec synchronisation WebSocket en temps réel et base de données Supabase :

1. **📱 Application Client Mobile (`/client` & `/client/login`)** :
   - Catalogue gourmet de burgers, smash chicken, menus, accompagnements et boissons.
   - **Personnalisation fine des sauces & ingrédients avec jauges interactives de 0 à 15**.
   - Commande pour soi ou pour un proche avec géolocalisation et itinéraire.
   - **Espace Profil Client** : Points de fidélité ⭐ (jauge de progression), date d'inscription, historique des commandes, total dépensé et adresses favorites.
   - **Liaison en 1 Clic avec Compte Google**.

2. **🛵 Application Coursier & Livreur (`/livreur` & `/livreur/login`)** :
   - Missions de livraison en direct avec détails client, téléphone, et calcul automatique de monnaie à rendre.
   - **Carte GPS Leaflet** avec localisation en temps réel et repérage des **Clients Favoris ⭐**.
   - Inscription coursier avec choix du véhicule (Moto, Scooter, Vélo électrique) et **workflow d'approbation administrative**.

3. **💻 Console Direction & Administration (`/admin` & `/admin/login`)** :
   - Tableau de bord en temps réel (Commandes du jour, Livreurs actifs, Recettes en DA).
   - **Base de données clients complète** avec profils détaillés, fidélité et historique.
   - Gestionnaire du stock ingrédients & sauces (activation/désactivation de rupture de stock).
   - Validation, suspension et réactivation des livreurs en 1 clic.
   - **Rapports financiers dynamiques (Chart.js)** avec export en **PDF**, **Excel (.xlsx/.csv)** et **Word (.doc)**.

4. **🐵 Page de Connexion Interactive avec Yéti Animé SVG** :
   - L'avatar interactif suit la saisie du numéro de téléphone avec ses yeux et sa bouche.
   - **Le Yéti se couvre les yeux avec ses mains** dès que vous saisissez le code PIN / mot de passe secret !
   - Animation de burgers flottants qui tombent à l'infini en arrière-plan.

---

## 📁 Structure du Projet

```
restaurant/
├── index.html                                # Hub Simulateur 3-en-1 interactif
├── logo.png                                  # Logo officiel The Engineer Burger
├── README.md                                 # Documentation du projet
├── supabase_schema.sql                       # Schéma global Supabase (RLS, Types, Triggers)
├── supabase_app_users_schema.sql             # Table d'authentification app_users (Phone + PIN 6 chiffres)
├── supabase_menu_seed.sql                    # Catalogue complet des 15+ plats gourmands
└── Projet_Restaurant_Global/
    ├── App_Mobile_Client_Livreur/            # Application Mobile React Native (Expo)
    ├── Dashboard_Admin_Web/                  # Interface Web Admin
    └── Live_Simulation_Hub/                  # Serveur Express + WebSocket + Interfaces dédiées
        ├── server.js                         # Serveur Backend (Port 4000)
        └── public/
            ├── index.html                    # Simulateur 3-en-1 côte-à-côte
            ├── client.html                   # Vue Client Mobile Plein Écran
            ├── livreur.html                  # Vue Livreur Plein Écran
            ├── admin.html                    # Vue Console Admin Plein Écran
            ├── client_login.html             # Connexion & Inscription Client (Yéti + Pluie de Burgers)
            ├── driver_login.html             # Connexion & Inscription Livreur (Yéti + Validation)
            └── admin_login.html              # Connexion Direction Sécurisée
```

---

## ⚡ Démarrage Rapide en Local

```bash
# 1. Cloner le dépôt
git clone https://github.com/mohamed853-hue/restaurant-apps.git
cd restaurant-apps/Projet_Restaurant_Global/Live_Simulation_Hub

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur Live
node server.js
```

Rendez-vous ensuite sur :
- **🔀 Simulateur 3-en-1 Live** : `http://localhost:4000/`
- **📱 Connexion Client** : `http://localhost:4000/client/login`
- **🛵 Connexion Livreur** : `http://localhost:4000/livreur/login`
- **🛡️ Connexion Admin** : `http://localhost:4000/admin/login`
- **📱 Application Client** : `http://localhost:4000/client`
- **🛵 Application Livreur** : `http://localhost:4000/livreur`
- **💻 Console Admin** : `http://localhost:4000/admin`

---

## 🗄️ Base de Données Supabase

Exécutez dans le **SQL Editor** de votre projet Supabase :
1. `supabase_schema.sql` : Création de la structure globale.
2. `supabase_app_users_schema.sql` : Authentification rapide par Téléphone + Code PIN.
3. `supabase_menu_seed.sql` : Insertion automatique de l'ensemble du menu des burgers et accompagnements.

---
*The Engineer Burger © 2026 - Conçu pour l'excellence gastronomique et technologique.*
