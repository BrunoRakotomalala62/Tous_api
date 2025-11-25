import express from 'express';
import Bytez from 'bytez.js';

const app = express();
const PORT = 5000;

// Récupérer la clé API depuis les variables d'environnement
const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;

if (!BYTEZ_API_KEY) {
  console.error('❌ BYTEZ_API_KEY manquante dans les variables d\'environnement');
  process.exit(1);
}

const sdk = new Bytez(BYTEZ_API_KEY);

// Route GET /claude
app.get('/claude', async (req, res) => {
  try {
    const { prompt, uid, imageurl } = req.query;

    // Vérifier que les paramètres sont présents
    if (!prompt) {
      return res.status(400).json({
        error: 'Le paramètre "prompt" est requis'
      });
    }

    if (!uid) {
      return res.status(400).json({
        error: 'Le paramètre "uid" est requis'
      });
    }

    // Choisir le modèle Claude
    const model = sdk.model('anthropic/claude-3-haiku-20240307');

    // Construire le contenu du message
    let messageContent;
    
    if (imageurl) {
      // Si une URL d'image est fournie, créer un contenu multimodal
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'url',
            url: imageurl
          }
        },
        {
          type: 'text',
          text: prompt
        }
      ];
    } else {
      // Sinon, utiliser juste le texte
      messageContent = prompt;
    }

    // Envoyer le prompt au modèle
    const { error, output } = await model.run([
      {
        role: 'user',
        content: messageContent
      }
    ]);

    if (error) {
      return res.status(500).json({
        error: 'Erreur lors de l\'appel à Claude',
        details: error
      });
    }

    // Retourner la réponse
    const response = {
      uid,
      prompt,
      response: output
    };
    
    if (imageurl) {
      response.imageurl = imageurl;
    }

    res.json(response);

  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: err.message
    });
  }
});

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({
    message: 'API Tous_api - Claude via Bytez',
    endpoints: [
      {
        method: 'GET',
        path: '/claude',
        params: {
          prompt: 'Texte à envoyer à Claude (requis)',
          uid: 'Identifiant utilisateur (requis)',
          imageurl: 'URL de l\'image à analyser (optionnel)'
        },
        examples: [
          '/claude?prompt=bonjour&uid=123',
          '/claude?prompt=Décrivez cette photo&uid=123&imageurl=https://example.com/image.jpg'
        ]
      }
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur API démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📡 Route disponible: GET /claude?prompt=votre_message&uid=votre_id`);
});
