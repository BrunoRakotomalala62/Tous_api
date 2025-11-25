# Tous_api - Replit Project

## Overview
API Node.js qui utilise Claude (via Bytez.js) pour traiter des requêtes textuelles.

## Current State
- **Date de configuration** : 25 novembre 2025
- **Langage** : Node.js 20
- **Framework** : Express.js
- **API externe** : Bytez.js pour accéder à Claude (Anthropic)

## Architecture

### Structure du projet
```
.
├── server.js          # Serveur Express avec routes API
├── package.json       # Dépendances Node.js
├── vercel.json        # Configuration pour déploiement Vercel
├── public/
│   ├── index.html     # Page d'accueil HTML dynamique
│   └── styles.css     # Styles CSS avec animations
├── .gitignore         # Fichiers à exclure de Git
└── README.md          # Documentation
```

### Technologies utilisées
- **Runtime** : Node.js 20
- **Framework web** : Express.js
- **SDK IA** : Bytez.js
- **Modèle IA** : Claude 3 Haiku (Anthropic)

## Configuration

### Variables d'environnement
- `BYTEZ_API_KEY` : Clé API Bytez (stockée en tant que variable d'environnement partagée)

### Port
- Le serveur écoute sur le port **5000** (0.0.0.0:5000)

## Fonctionnalités

### Historique de conversation (Claude)
- L'API garde l'historique des conversations par `uid`
- Permet des discussions continues avec contexte
- Claude se souvient des images et messages précédents dans la conversation
- Stockage en mémoire (Map JavaScript)
- L'historique persiste pendant l'exécution du serveur

### Analyse d'images (Claude)
- Support des images via URL
- Claude peut analyser et discuter des images
- Le contexte de l'image est conservé dans la conversation

### Embeddings (MiniLM)
- Génération de vecteurs d'embeddings pour du texte
- Utilise le modèle sentence-transformers/all-MiniLM-L6-v2
- Utile pour la recherche sémantique et la similarité de texte

## Endpoints

### GET /
Affiche la page d'accueil HTML avec design dynamique et coloré (public/index.html).

### GET /api-info
Affiche les informations sur l'API et les endpoints disponibles en format JSON.

### GET /claude
Endpoint principal qui envoie un prompt à Claude et retourne la réponse. **Garde l'historique de conversation**.

**Paramètres requis :**
- `prompt` : Texte à envoyer à Claude
- `uid` : Identifiant utilisateur

**Paramètres optionnels :**
- `imageurl` : URL de l'image à analyser
- `reset` : Réinitialiser la conversation (true/1)

### GET /minilm
Endpoint pour générer des embeddings avec le modèle all-MiniLM-L6-v2 (Sentence Transformers).

**Paramètres requis :**
- `prompt` : Texte à convertir en embedding
- `uid` : Identifiant utilisateur

**Exemple :**
```
GET /minilm?prompt=Hello World&uid=123
```

**Exemples d'utilisation :**

1. Démarrer une conversation :
```
GET /claude?prompt=bonjour&uid=123
```

2. Analyser une image :
```
GET /claude?prompt=Décrivez bien cette photo&uid=123&imageurl=https://example.com/photo.jpg
```

3. Continuer la discussion sur l'image :
```
GET /claude?prompt=Quelle était la couleur dominante dans cette photo?&uid=123
```

4. Réinitialiser et démarrer une nouvelle conversation :
```
GET /claude?prompt=bonjour&uid=123&reset=true
```

**Réponse type :**
```json
{
  "uid": "123",
  "prompt": "Quelle était la couleur dominante?",
  "response": "La couleur dominante dans la photo était le bleu...",
  "conversation_length": 4,
  "imageurl": "https://example.com/photo.jpg"
}
```

### GET /reset
Réinitialise l'historique de conversation pour un utilisateur spécifique.

**Paramètres requis :**
- `uid` : Identifiant utilisateur

**Exemple :**
```
GET /reset?uid=123
```

## Workflow Replit
- **Nom** : API Server
- **Commande** : `npm start`
- **Type de sortie** : webview
- **Port** : 5000

## Notes de développement
- Le serveur utilise ESM (type: "module" dans package.json)
- Les erreurs sont gérées et retournent des codes HTTP appropriés
- La clé API est sécurisée via les variables d'environnement
