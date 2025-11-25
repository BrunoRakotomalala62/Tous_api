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
    const { prompt, uid } = req.query;

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

    // Envoyer le prompt au modèle
    const { error, output } = await model.run([
      {
        role: 'user',
        content: prompt
      }
    ]);

    if (error) {
      return res.status(500).json({
        error: 'Erreur lors de l\'appel à Claude',
        details: error
      });
    }

    // Retourner la réponse
    res.json({
      uid,
      prompt,
      response: output
    });

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
          uid: 'Identifiant utilisateur (requis)'
        },
        example: '/claude?prompt=bonjour&uid=123'
      }
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur API démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📡 Route disponible: GET /claude?prompt=votre_message&uid=votre_id`);
});
