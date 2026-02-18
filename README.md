# INSIGHTBALL - Frontend

Interface utilisateur React pour la plateforme INSIGHTBALL.

## 🚀 Installation

```bash
# Installe les dépendances
npm install

# Copie le fichier d'environnement
cp .env.example .env

# Lance le serveur de développement
npm run dev
```

Le serveur démarre sur http://localhost:3000

## 📦 Technologies

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP requests

## 🏗️ Structure

```
src/
├── components/     # Composants réutilisables
├── pages/          # Pages principales
├── hooks/          # Custom hooks
├── store/          # State management (Zustand)
├── utils/          # Fonctions utilitaires
├── services/       # API calls
└── App.jsx         # Composant racine
```

## 🔧 Scripts

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## 📝 Variables d'environnement

Copie `.env.example` vers `.env` et remplis :

- `VITE_API_URL` - URL de l'API backend
- `VITE_STRIPE_PUBLIC_KEY` - Clé publique Stripe (test)

## 👨‍💻 Développement

Code par Claude + Tchitcha
Version 1.0 - Février 2026
