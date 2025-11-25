# Tous_api

API Node.js utilisant Claude via Bytez.js

## Installation

Les dépendances sont déjà installées. Si besoin :

```bash
npm install
```

## Configuration

La clé API Bytez est stockée dans les variables d'environnement :
- `BYTEZ_API_KEY` : Votre clé API Bytez (déjà configurée)

## Utilisation

### Démarrer le serveur

```bash
npm start
```

Le serveur démarre sur le port 5000.

### Endpoint disponible

#### GET /claude

Envoie un message à Claude et retourne la réponse.

**Paramètres requis :**
- `prompt` : Le texte à envoyer à Claude
- `uid` : Identifiant utilisateur

**Exemple :**
```
GET /claude?prompt=bonjour&uid=123
```

**Réponse :**
```json
{
  "uid": "123",
  "prompt": "bonjour",
  "response": "Réponse de Claude..."
}
```

### Route de base

```
GET /
```

Affiche les informations sur l'API et les endpoints disponibles.

## Modèle utilisé

- `anthropic/claude-3-haiku-20240307` via Bytez.js

## Technologies

- Node.js
- Express.js
- Bytez.js
