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

// Stockage de l'historique des conversations par uid
const conversationHistory = new Map();

// Fonction pour convertir du texte en Unicode gras
function toBold(text) {
  const boldMap = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
    'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
    'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
    'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
    'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
  };
  
  return text.split('').map(char => boldMap[char] || char).join('');
}

// Route GET /claude
app.get('/claude', async (req, res) => {
  try {
    const { prompt, uid, imageurl, reset } = req.query;

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

    // Réinitialiser l'historique si demandé
    if (reset === 'true' || reset === '1') {
      conversationHistory.delete(uid);
    }

    // Récupérer ou initialiser l'historique de conversation
    if (!conversationHistory.has(uid)) {
      conversationHistory.set(uid, []);
    }
    const history = conversationHistory.get(uid);

    // Choisir le modèle Claude
    const model = sdk.model('anthropic/claude-3-haiku-20240307');

    // Construire le contenu du message utilisateur
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
      // Utiliser format tableau pour le texte simple aussi
      messageContent = [
        {
          type: 'text',
          text: prompt
        }
      ];
    }

    // Ajouter le nouveau message à l'historique
    const userMessage = {
      role: 'user',
      content: messageContent
    };

    // Créer la liste complète des messages (historique + nouveau message)
    const messages = [...history, userMessage];

    // Envoyer l'historique complet au modèle
    console.log(`[${uid}] Envoi de ${messages.length} messages à Claude...`);
    const { error, output } = await model.run(messages);

    if (error) {
      console.error(`[${uid}] Erreur from Claude:`, error);
      return res.status(500).json({
        error: 'Erreur lors de l\'appel à Claude',
        details: error
      });
    }

    // Extraire le contenu de la réponse (output est un objet {role, content})
    const assistantResponse = typeof output === 'string' ? output : output.content;
    console.log(`[${uid}] Réponse reçue de Claude (${assistantResponse.length} chars)`);

    // Ajouter le message utilisateur et la réponse à l'historique
    history.push(userMessage);
    history.push({
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: assistantResponse
        }
      ]
    });

    // Retourner la réponse avec formatage amélioré
    const response = {
      [`✅ ${toBold('Statut')}`]: 'Réponse générée avec succès',
      [`👤 ${toBold('Utilisateur')}`]: uid,
      [`📝 ${toBold('Votre question')}`]: prompt,
      [`🤖 ${toBold('Reponse de Claude')}`]: assistantResponse,
      [`💬 ${toBold('Messages dans la conversation')}`]: `${history.length} messages (${history.length / 2} échanges)`,
      [`⏱️ ${toBold('Timestamp')}`]: new Date().toISOString()
    };
    
    if (imageurl) {
      response[`🖼️ ${toBold('Image analysee')}`] = imageurl;
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

// Route pour réinitialiser une conversation
app.get('/reset', (req, res) => {
  const { uid } = req.query;
  
  if (!uid) {
    return res.status(400).json({
      error: 'Le paramètre "uid" est requis'
    });
  }

  conversationHistory.delete(uid);
  
  res.json({
    [`✅ ${toBold('Succes')}`]: 'Conversation réinitialisée avec succès',
    [`👤 ${toBold('Utilisateur')}`]: uid,
    [`🔄 ${toBold('Action')}`]: 'Historique effacé - Vous pouvez démarrer une nouvelle conversation',
    [`💡 ${toBold('Prochaine etape')}`]: `Utilisez /claude?prompt=votre_message&uid=${uid}`
  });
});

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  const activeConvs = conversationHistory.size;
  
  res.json({
    [`🤖 ${toBold('API Tous_api')}`]: `${toBold('Claude AI')} via Bytez - Analyse d'images et conversations`,
    
    [`✨ ${toBold('Fonctionnalites')}`]: {
      '🧠 IA': `${toBold('Claude 3 Haiku')} - Modèle rapide et intelligent`,
      '🖼️ Images': `${toBold('Analyse visuelle')} - Compréhension et description d'images`,
      '💬 Conversations': `${toBold('Historique contextuel')} - Discussions continues par utilisateur`,
      '⚡ Rapidite': `${toBold('Reponses en temps reel')} - Traitement instantané`
    },
    
    [`📡 ${toBold('ENDPOINT PRINCIPAL')} - /claude`]: {
      [`🎯 ${toBold('Methode')}`]: 'GET',
      
      [`📝 ${toBold('Parametres REQUIS')}`]: {
        '🔤 prompt': `${toBold('Votre question ou instruction')} - Le texte à envoyer à Claude`,
        '👤 uid': `${toBold('Identifiant utilisateur unique')} - Pour gérer les conversations`
      },
      
      [`🎨 ${toBold('Parametres OPTIONNELS')}`]: {
        '🖼️ imageurl': `${toBold('URL de l\'image')} - Pour analyse visuelle`,
        '🔄 reset': `${toBold('true/1')} - Réinitialiser la conversation`
      },
      
      [`💡 ${toBold('Exemples d\'utilisation')}`]: {
        [`1️⃣ ${toBold('Message simple')}`]: '/claude?prompt=bonjour&uid=123',
        [`2️⃣ ${toBold('Analyser une image')}`]: '/claude?prompt=Décrivez cette photo&uid=123&imageurl=https://example.com/image.jpg',
        [`3️⃣ ${toBold('Question de suivi')}`]: '/claude?prompt=Quelle était la couleur?&uid=123',
        [`4️⃣ ${toBold('Nouvelle conversation')}`]: '/claude?prompt=nouveau sujet&uid=123&reset=true'
      },
      
      [`📤 ${toBold('Format de reponse')}`]: {
        'uid': 'Identifiant utilisateur',
        'prompt': 'Votre question',
        'response': `${toBold('Reponse de Claude')} ⭐`,
        'conversation_length': 'Nombre de messages dans l\'historique',
        'imageurl': 'URL de l\'image (si fournie)'
      }
    },
    
    [`🔄 ${toBold('ENDPOINT RESET')} - /reset`]: {
      [`🎯 ${toBold('Methode')}`]: 'GET',
      [`📝 ${toBold('Parametre')}`]: {
        '👤 uid': `${toBold('Identifiant utilisateur')} - Pour réinitialiser sa conversation`
      },
      [`💡 ${toBold('Exemple')}`]: '/reset?uid=123'
    },
    
    [`📊 ${toBold('STATISTIQUES EN DIRECT')}`]: {
      [`💬 ${toBold('Conversations actives')}`]: `${toBold(activeConvs.toString())} utilisateur${activeConvs !== 1 ? 's' : ''}`,
      [`⏱️ ${toBold('Temps de reponse moyen')}`]: `${toBold('1-3 secondes')} (texte) / ${toBold('2-5 secondes')} (image)`,
      [`🌐 ${toBold('Statut du serveur')}`]: `${toBold('OPERATIONNEL')} ✅`
    },
    
    [`🎯 ${toBold('COMMENT UTILISER L\'HISTORIQUE')}`]: {
      [`1️⃣ ${toBold('Premiere requete')}`]: 'Envoyez votre message avec une image',
      [`2️⃣ ${toBold('Questions suivantes')}`]: 'Utilisez le même uid sans répéter l\'image',
      [`3️⃣ ${toBold('Claude se souvient')}`]: 'Le contexte et les images précédentes',
      [`4️⃣ ${toBold('Reinitialiser')}`]: 'Utilisez reset=true ou /reset pour recommencer'
    },
    
    [`⚠️ ${toBold('NOTES IMPORTANTES')}`]: [
      `${toBold('Stockage')} 💾 - L'historique est en mémoire (perdu au redémarrage)`,
      `${toBold('Securite')} 🔒 - Les clés API sont sécurisées côté serveur`,
      `${toBold('Images')} 🖼️ - URLs publiques uniquement (HTTPS recommandé)`,
      `${toBold('Performance')} ⚡ - Optimisé pour des réponses rapides`
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur API démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📡 Route disponible: GET /claude?prompt=votre_message&uid=votre_id`);
});
