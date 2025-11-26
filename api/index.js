import express from 'express';
import Bytez from 'bytez.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;

if (!BYTEZ_API_KEY) {
  console.error('BYTEZ_API_KEY manquante dans les variables d\'environnement');
}

const sdk = BYTEZ_API_KEY ? new Bytez(BYTEZ_API_KEY) : null;

app.use(express.static(path.join(__dirname, '../public')));

const conversationHistory = new Map();

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

app.get('/claude', async (req, res) => {
  try {
    if (!sdk) {
      return res.status(500).json({ error: 'API non configurée' });
    }

    const { prompt, uid, imageurl, reset } = req.query;

    if (!prompt) {
      return res.status(400).json({ error: 'Le paramètre "prompt" est requis' });
    }

    if (!uid) {
      return res.status(400).json({ error: 'Le paramètre "uid" est requis' });
    }

    if (reset === 'true' || reset === '1') {
      conversationHistory.delete(uid);
    }

    if (!conversationHistory.has(uid)) {
      conversationHistory.set(uid, []);
    }
    const history = conversationHistory.get(uid);

    const model = sdk.model('anthropic/claude-3-haiku-20240307');

    let messageContent;
    if (imageurl) {
      messageContent = [
        { type: 'image', source: { type: 'url', url: imageurl } },
        { type: 'text', text: prompt }
      ];
    } else {
      messageContent = [{ type: 'text', text: prompt }];
    }

    const userMessage = { role: 'user', content: messageContent };
    const messages = [...history, userMessage];

    const { error, output } = await model.run(messages);

    if (error) {
      return res.status(500).json({ error: 'Erreur lors de l\'appel à Claude', details: error });
    }

    const assistantResponse = typeof output === 'string' ? output : output.content;

    history.push(userMessage);
    history.push({ role: 'assistant', content: [{ type: 'text', text: assistantResponse }] });

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
    res.status(500).json({ error: 'Erreur interne du serveur', message: err.message });
  }
});

app.get('/reset', (req, res) => {
  const { uid } = req.query;
  
  if (!uid) {
    return res.status(400).json({ error: 'Le paramètre "uid" est requis' });
  }

  conversationHistory.delete(uid);
  
  res.json({
    [`✅ ${toBold('Succes')}`]: 'Conversation réinitialisée avec succès',
    [`👤 ${toBold('Utilisateur')}`]: uid,
    [`🔄 ${toBold('Action')}`]: 'Historique effacé - Vous pouvez démarrer une nouvelle conversation',
    [`💡 ${toBold('Prochaine etape')}`]: `Utilisez /claude?prompt=votre_message&uid=${uid}`
  });
});

app.get('/minilm', async (req, res) => {
  try {
    if (!sdk) {
      return res.status(500).json({ error: 'API non configurée' });
    }

    const { prompt, uid } = req.query;

    if (!prompt) {
      return res.status(400).json({ error: 'Le paramètre "prompt" est requis' });
    }

    if (!uid) {
      return res.status(400).json({ error: 'Le paramètre "uid" est requis' });
    }

    const model = sdk.model('sentence-transformers/all-MiniLM-L6-v2');
    const { error, output } = await model.run(prompt);

    if (error) {
      return res.status(500).json({ error: 'Erreur lors de l\'appel à MiniLM', details: error });
    }

    const response = {
      [`✅ ${toBold('Statut')}`]: 'Embedding généré avec succès',
      [`👤 ${toBold('Utilisateur')}`]: uid,
      [`📝 ${toBold('Votre texte')}`]: prompt,
      [`🤖 ${toBold('Modele')}`]: 'all-MiniLM-L6-v2 (Sentence Transformers)',
      [`📊 ${toBold('Output')}`]: output,
      [`⏱️ ${toBold('Timestamp')}`]: new Date().toISOString()
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne du serveur', message: err.message });
  }
});

app.get('/api-info', (req, res) => {
  res.json({
    api: 'Tous_api - Claude AI via Bytez',
    endpoints: ['/claude', '/minilm', '/reset'],
    status: 'online'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

export default app;
