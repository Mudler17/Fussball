// Backend-Proxy für die Philosophical Tactics Board App.
// Hält den Gemini-API-Key serverseitig und serviert das gebuildete Frontend.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Modality } from '@google/genai';
import { rateLimit } from 'express-rate-limit';

// --- Pfad-Setup für ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// --- Konfiguration ---
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY ist nicht gesetzt. API-Endpoints werden 500 liefern.');
}

// --- Rate-Limit-Konfiguration (via Env-Variablen in Coolify überschreibbar) ---
// RATE_LIMIT_WINDOW_MINUTES: Zeitfenster in Minuten (Default: 60)
// RATE_LIMIT_MAX_REQUESTS:   Max. Gemini-Requests pro IP pro Fenster (Default: 15)
const RATE_WINDOW_MINUTES = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '60', 10);
const RATE_MAX_REQUESTS   = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS   || '15', 10);

console.log(`📊 Rate-Limit: max. ${RATE_MAX_REQUESTS} Requests pro IP pro ${RATE_WINDOW_MINUTES} Minuten`);

const apiLimiter = rateLimit({
  windowMs: RATE_WINDOW_MINUTES * 60 * 1000,
  max: RATE_MAX_REQUESTS,
  standardHeaders: true,    // RateLimit-* Header an den Client senden
  legacyHeaders: false,
  validate: { trustProxy: false }, // Coolify/Traefik setzt X-Forwarded-For korrekt
  skip: (req) => req.path === '/api/health' || req.path === '/api/debug',
  handler: (req, res, _next, _options) => {
    const resetTime = req.rateLimit?.resetTime;
    const resetIn = resetTime
      ? Math.ceil((resetTime.getTime() - Date.now()) / 60000)
      : RATE_WINDOW_MINUTES;
    console.warn(`🚫 Rate-Limit: IP ${req.ip}, Pfad ${req.path}`);
    res.status(429).json({
      error: `Zu viele Anfragen von deiner IP. Bitte warte noch ${resetIn} Minute(n).`,
      retryAfterMinutes: resetIn,
    });
  },
});

// Ein einziger Client pro Prozess – wiederverwenden statt pro Request neu erstellen
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// --- Hilfsfunktionen ---
const getResponseText = (response) => {
  if (response?.text) return response.text;
  return response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Antwort erhalten.';
};

const ensureAi = (res) => {
  if (!ai) {
    res.status(500).json({ error: 'Server ist nicht konfiguriert: GEMINI_API_KEY fehlt.' });
    return false;
  }
  return true;
};

// --- Express-App ---
const app = express();
app.use(express.json({ limit: '2mb' }));

// Rate-Limiter auf alle /api/-Endpoints anwenden (außer health + debug, s.o.)
app.use('/api/', apiLimiter);

// Healthcheck für Coolify/Docker
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(API_KEY),
    keyLength: API_KEY ? API_KEY.length : 0,
    rateLimit: { windowMinutes: RATE_WINDOW_MINUTES, maxRequests: RATE_MAX_REQUESTS },
    models: {
      analyze:    process.env.MODEL_ANALYZE    || 'gemini-2.5-pro',
      commentary: process.env.MODEL_COMMENTARY || 'gemini-2.5-flash',
      lockerRoom: process.env.MODEL_LOCKER_ROOM || 'gemini-2.5-flash',
      tts:        process.env.MODEL_TTS        || 'gemini-2.5-flash-preview-tts',
    },
  });
});

// Debug-Endpoint: echter Mini-Call gegen Gemini zur Verbindungsprüfung
app.get('/api/debug', async (_req, res) => {
  if (!ai) return res.status(500).json({ ok: false, error: 'Kein API-Key auf dem Server.' });
  try {
    const model = process.env.MODEL_ANALYZE || 'gemini-2.5-pro';
    const response = await ai.models.generateContent({
      model,
      contents: 'Antworte nur mit dem Wort: OK',
    });
    const text = getResponseText(response);
    res.json({ ok: true, model, text: text.substring(0, 100) });
  } catch (err) {
    res.status(502).json({
      ok: false,
      error: err?.message || String(err),
      name: err?.name,
      status: err?.status,
      stack: err?.stack?.split('\n').slice(0, 5),
    });
  }
});

// --- Endpoint 1: Philosophische Analyse ---
app.post('/api/analyze', async (req, res) => {
  if (!ensureAi(res)) return;

  const { question, selectedPlayers, tactic, opponent, previousContext } = req.body || {};

  if (!question || !Array.isArray(selectedPlayers)) {
    return res.status(400).json({ error: 'Ungültige Anfrage: question und selectedPlayers[] erforderlich.' });
  }

  if (selectedPlayers.length === 0) {
    return res.json({ text: 'Bitte wähle mindestens einen Spieler aus, um das Spiel zu beginnen.' });
  }

  let tacticInstruction = '';
  switch (tactic) {
    case 'Offensives Pressing':        tacticInstruction = 'SPIELTAKTIK: OFFENSIVES PRESSING. Sei radikal, mutig und spekulativ.'; break;
    case 'Catenaccio (Abwehrriegel)':  tacticInstruction = 'SPIELTAKTIK: CATENACCIO. Sei extrem skeptisch, kritisch und vorsichtig.'; break;
    case 'Ballbesitz (Tiki-Taka)':     tacticInstruction = 'SPIELTAKTIK: BALLBESITZ. Präzise Definitionen. Langsames Tempo.'; break;
    case 'Dialektischer Konter':       tacticInstruction = 'SPIELTAKTIK: KONTER. Dialektische Umschläge. Suche das Gegenteil.'; break;
    default:                           tacticInstruction = 'SPIELTAKTIK: AUSGEGLICHEN.'; break;
  }

  let opponentContext = '';
  if (opponent && opponent.name) {
    opponentContext = `
    ⚠️ ACHTUNG: Das Spiel findet gegen einen Gegner statt!
    GEGNER: ${opponent.name}
    BESCHREIBUNG: ${opponent.description}
    SPIELWEISE DES GEGNERS: ${opponent.style}

    Deine Mannschaft muss nicht nur das Thema bearbeiten, sondern explizit gegen die Angriffe von ${opponent.name} verteidigen und Lücken in deren Deckung finden.
    `;
  }

  let playersContext = '';
  for (const player of selectedPlayers) {
    let formNote = '';
    if (player.form === 'peak')  formNote = '🔥 DIESER SPIELER IST IN TOPFORM! Er spielt besonders brillant, dominant und überzeugend.';
    if (player.form === 'slump') formNote = '❄️ DIESER SPIELER HAT EINE FORMKRISE. Er ist zögerlich, macht Fehler oder wird von den anderen korrigiert.';
    playersContext += `\n\n### Spieler: ${player.name} (${player.role})\nInstruktion: ${player.promptInstruction}\n${formNote}`;
  }

  let prompt = `
    Du bist der 'Philosophical Team Manager'.
    Analysiere die folgende Eingabe (Frage/Problem/Thema) NUR durch die Linsen der ausgewählten Philosophen.

    DAS THEMA: "${question}"
    ${tacticInstruction}
    ${opponentContext}

    WICHTIG - DAS PASSSPIEL:
    Philosophie ist ein Mannschaftssport. Die Denker sollen aufeinander reagieren.
    Wenn ein Gedanke von einem zum anderen führt, schreibe explizit: "⚽ [Pass zu Name]".
    Zeige die Anknüpfungspunkte (Passwege) zwischen den Theorien auf.

    Gehe Schritt für Schritt vor. Jeder ausgewählte Philosoph gibt seinen spezifischen Input.

    Formatierung:
    - Nutze Markdown.
    - Verwende 3️⃣ Emojis passend zum Inhalt.
    - Strukturiere den Text klar in Spielzüge.

    Die Mannschaft:
    ${playersContext}
  `;

  if (previousContext) {
    prompt += `\n\n--- VERTIEFUNG (2. HALBZEIT) ---\nVerlauf bisher:\n${previousContext}\n\nAUFGABE: Gehe nun in die Tiefe. Erläutere die Pässe genauer.`;
  } else {
    prompt += `\n\nFasse am Ende kurz zusammen: Was ist das Ergebnis dieses Spielzugs?`;
  }

  try {
    const response = await ai.models.generateContent({
      model: process.env.MODEL_ANALYZE || 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: -1 },
      },
    });
    res.json({ text: getResponseText(response) });
  } catch (err) {
    console.error('Analyse-Fehler:', err?.message || err);
    res.status(502).json({
      error: 'Gemini-Fehler bei der Analyse.',
      detail: err?.message || String(err),
      model: process.env.MODEL_ANALYZE || 'gemini-2.5-pro',
    });
  }
});

// --- Endpoint 2: Audio-Kommentar ---
app.post('/api/commentary', async (req, res) => {
  if (!ensureAi(res)) return;

  const { analysisText, topic } = req.body || {};
  if (!analysisText || !topic) {
    return res.status(400).json({ error: 'analysisText und topic erforderlich.' });
  }

  const prompt = `
    Du bist ein leidenschaftlicher Sportkommentator.
    Das Spielthema heute war: "${topic}".
    Fasse den folgenden philosophischen Spielbericht als emotionalen Live-Kommentar zusammen.

    Anweisungen:
    - Starte mit einer dramatischen Nennung des Themas.
    - Halte es kurz (maximal 40-50 Sekunden Sprechzeit).
    - Sei emotional und dynamisch.
    - Nutze Fußballmetaphern ("Kants Grätsche saß!", "Tooor für den Idealismus!").
    - Sprich Deutsch.
    - WICHTIG: Gib NUR den reinen Sprechtext zurück.

    Der Bericht:
    ${String(analysisText).substring(0, 5000)}
  `;

  try {
    const textResponse = await ai.models.generateContent({
      model: process.env.MODEL_COMMENTARY || 'gemini-2.5-flash',
      contents: prompt,
    });
    const commentaryText = getResponseText(textResponse);
    if (!commentaryText) return res.status(502).json({ error: 'Kein Kommentartext generiert.' });

    const ttsResponse = await ai.models.generateContent({
      model: process.env.MODEL_TTS || 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: commentaryText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = ttsResponse?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return res.status(502).json({ error: 'Keine Audio-Daten erhalten.' });

    res.json({ audioBase64: base64Audio, sampleRate: 24000, commentaryText });
  } catch (err) {
    console.error('Kommentar-Fehler:', err?.message || err);
    res.status(502).json({ error: 'Audio-Generierung fehlgeschlagen.', detail: err?.message || String(err) });
  }
});

// --- Endpoint 3: Kabinen-Dialog ---
app.post('/api/locker-room', async (req, res) => {
  if (!ensureAi(res)) return;

  const { matchReport, participants, coachMessage } = req.body || {};
  if (!matchReport || !Array.isArray(participants)) {
    return res.status(400).json({ error: 'matchReport und participants[] erforderlich.' });
  }

  const participantsList = participants.map((p) => `${p.name} (${p.description})`).join(', ');

  const prompt = `
    SZENE: Die Umkleidekabine nach dem philosophischen Spiel.

    SPIELBERICHT:
    ${String(matchReport).substring(0, 8000)}

    CHARAKTERE:
    ${participantsList}

    DER TRAINER SAGT: "${coachMessage || ''}"

    Generiere einen kurzen Dialog (Drehbuch-Format).
    Die Philosophen reagieren auf den Trainer und kommentieren ihre Aktionen im Spiel.
    Tonfall: Mischung aus hoher Philosophie und verschwitzter Sportler-Sprache.

    Format:
    **Name**: [Aussage]
    *Regieanweisung in kursiv*
  `;

  try {
    const response = await ai.models.generateContent({
      model: process.env.MODEL_LOCKER_ROOM || 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ text: getResponseText(response) });
  } catch (err) {
    console.error('Kabinen-Fehler:', err?.message || err);
    res.status(502).json({ error: 'Kabinen-Dialog fehlgeschlagen.', detail: err?.message || String(err) });
  }
});

// --- Statische Auslieferung des gebauten Frontends ---
app.use(express.static(distDir));

// SPA-Fallback
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
  console.log(`   Key gesetzt: ${Boolean(API_KEY)}`);
  console.log(`   Rate-Limit:  ${RATE_MAX_REQUESTS} Req/${RATE_WINDOW_MINUTES}min pro IP`);
});
