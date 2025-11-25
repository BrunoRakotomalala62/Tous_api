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

### Endpoints disponibles

#### GET /claude

Envoie un message à Claude et retourne la réponse. **Garde l'historique de conversation par utilisateur** pour permettre des discussions continues. Supporte l'analyse d'images via URL.

**Paramètres requis :**
- `prompt` : Le texte à envoyer à Claude
- `uid` : Identifiant utilisateur

**Paramètres optionnels :**
- `imageurl` : URL de l'image à analyser
- `reset` : Réinitialiser la conversation (true ou 1)

**Exemples :**

1. Message texte simple :
```
GET /claude?prompt=bonjour&uid=123
```

2. Analyse d'image :
```
GET /claude?prompt=Décrivez bien cette photo&uid=123&imageurl=https://example.com/photo.jpg
```

3. Continuer la discussion sur l'image :
```
GET /claude?prompt=Quelle était la couleur principale?&uid=123
```

4. Nouvelle conversation :
```
GET /claude?prompt=bonjour&uid=123&reset=true
```

**Réponse :**
```json
{
  "uid": "123",
  "prompt": "bonjour",
  "response": "Réponse de Claude...",
  "conversation_length": 2,
  "imageurl": "https://example.com/photo.jpg"
}
```

#### GET /reset

Réinitialise l'historique de conversation pour un utilisateur.

**Paramètres requis :**
- `uid` : Identifiant utilisateur

**Exemple :**
```
GET /reset?uid=123
```

#### GET /

Affiche les informations sur l'API et les endpoints disponibles.

## Historique de conversation

L'API garde automatiquement l'historique des conversations par `uid`. Cela permet :

- De continuer une discussion sans répéter le contexte
- De poser des questions sur une image partagée précédemment
- D'avoir des conversations naturelles avec Claude

**Note :** L'historique est stocké en mémoire et sera perdu lors du redémarrage du serveur.

## Modèle utilisé

- `anthropic/claude-3-haiku-20240307` via Bytez.js

## Technologies

- Node.js
- Express.js
- Bytez.js
