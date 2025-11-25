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
├── server.js          # Serveur Express avec route /claude
├── package.json       # Dépendances Node.js
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

## Endpoints

### GET /
Affiche les informations sur l'API et les endpoints disponibles.

### GET /claude
Endpoint principal qui envoie un prompt à Claude et retourne la réponse. Supporte l'analyse d'images.

**Paramètres requis :**
- `prompt` : Texte à envoyer à Claude
- `uid` : Identifiant utilisateur

**Paramètres optionnels :**
- `imageurl` : URL de l'image à analyser

**Exemples d'utilisation :**

1. Message texte simple :
```
GET /claude?prompt=bonjour&uid=123
```

2. Analyse d'image avec description :
```
GET /claude?prompt=Décrivez bien cette photo&uid=123&imageurl=https://example.com/photo.jpg
```

**Réponse type (texte simple) :**
```json
{
  "uid": "123",
  "prompt": "bonjour",
  "response": "Bonjour ! Comment puis-je vous aider aujourd'hui ?"
}
```

**Réponse type (avec image) :**
```json
{
  "uid": "123",
  "prompt": "Décrivez bien cette photo",
  "imageurl": "https://example.com/photo.jpg",
  "response": "Cette photo montre..."
}
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
