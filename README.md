# Philosophical Tactics Board ⚽🧠

Ein interaktives Taktik-Board für philosophische Analysen. Stelle deine Mannschaft aus großen Denkern zusammen (Kant im Tor, Popper in der Abwehr, Peirce im Sturm), wähle Taktik und Gegner – und lass sie ein Thema im 4-3-3 bearbeiten.

---

## 🔒 Sicherheits-Architektur

Dieses Repository nutzt einen **Backend-Proxy**. Der Gemini-API-Key lebt ausschließlich serverseitig in einer Environment-Variable und verlässt **niemals** den Container.

```
Browser (React)  ──►  /api/analyze        ──►  Node-Server  ──►  Gemini API
                      /api/commentary                ▲
                      /api/locker-room        GEMINI_API_KEY (nur hier!)
```

**Analogie:** Der Key ist eine Kreditkarte. Der Browser ist der Gast im Café – er sieht nie die Karte. Das Backend ist die Kellnerin, die die Bestellung zur Gemini-Theke trägt und das Ergebnis zurückbringt.

Deshalb: **Niemals** `.env` committen. Der Key wird in Coolify als Environment-Variable gesetzt.

---

## 🏗️ Technik-Stack

- **Frontend:** React 19 + TypeScript + Vite, Tailwind (CDN), lucide-react, react-markdown
- **Backend:** Node.js 22 + Express, `@google/genai`
- **Deployment:** Single Docker-Container (Multi-Stage-Build), gehostet über Coolify

---

## 💻 Lokale Entwicklung

### Voraussetzungen
- Node.js ≥ 20 (empfohlen: 22)
- Ein Gemini-API-Key von https://aistudio.google.com/apikey

### Setup

```bash
# 1. Dependencies installieren
npm install

# 2. Environment-Datei anlegen
cp .env.example .env
# Dann .env öffnen und GEMINI_API_KEY eintragen

# 3. Backend starten (Terminal 1)
npm run dev:server

# 4. Frontend starten (Terminal 2)
npm run dev
```

Frontend läuft auf `http://localhost:5173`, Backend auf `:3000`. Vite leitet `/api/*`-Anfragen automatisch an das Backend weiter.

### Lokaler Production-Test

```bash
npm run build          # Baut das Frontend in /dist
npm run start          # Startet den Node-Server, der /dist ausliefert
# → http://localhost:3000
```

---

## 🐳 Docker-Test (optional, lokal)

```bash
# Image bauen
docker build -t philosophy-board .

# Container starten (Key als Env-Variable übergeben)
docker run --rm -p 3000:3000 -e GEMINI_API_KEY=dein-key philosophy-board
# → http://localhost:3000
```

---

## 🚀 Deployment via Coolify auf deinem Hetzner-Server

### Schritt 1: Code auf GitHub pushen

```bash
git init
git add .
git commit -m "Initial commit: Philosophical Tactics Board"
git branch -M main
git remote add origin git@github.com:DEIN-USER/philosophical-tactics-board.git
git push -u origin main
```

⚠️ **Doppelt prüfen, bevor du pushst:**
```bash
git status              # .env darf NICHT auftauchen
grep -r "GEMINI_API_KEY=" . --exclude-dir=node_modules --exclude-dir=.git
# Einziger Treffer sollte .env.example sein (mit Platzhalter)
```

### Schritt 2: In Coolify neuen Service anlegen

1. **Coolify-Dashboard** → deinen Server (Hetzner) auswählen
2. **New Resource** → **Public Repository** (oder Private, je nach Repo-Sichtbarkeit)
3. **Repository URL** eintragen, Branch: `main`
4. **Build Pack: Dockerfile** (Coolify erkennt unser `Dockerfile` automatisch)
5. **Port:** `3000`

### Schritt 3: Environment-Variablen setzen

Im Service-Tab **Environment Variables**:

| Key | Value | Is Build Variable? |
|---|---|---|
| `GEMINI_API_KEY` | dein echter Key | ❌ (Runtime) |
| `NODE_ENV` | `production` | ❌ |

Die optionalen Modell-Overrides (`MODEL_ANALYZE` etc.) nur setzen, wenn du bewusst andere Modelle willst.

### Schritt 4: Domain & SSL

1. Im Tab **Domains**: Subdomain hinzufügen, z. B. `fc-philosophy.ki-kernel.de`
2. Coolify legt automatisch ein Let's-Encrypt-Zertifikat an (via Cloudflare-DNS)
3. Cloudflare-DNS: A-Record auf deine Hetzner-IP (Proxy-Modus „DNS only" – Coolify/Traefik handhabt TLS selbst)

### Schritt 5: Deploy

Klick auf **Deploy**. Coolify:
1. Pullt das Repo
2. Baut das Docker-Image (Stage 1 baut Vite, Stage 2 packt Runtime)
3. Startet den Container mit der Environment-Variable
4. Routet die Domain auf Port 3000

Nach ca. 2–3 Minuten erreichbar unter deiner Domain.

---

## 🔄 Updates

```bash
# Lokal Änderungen machen, dann:
git add .
git commit -m "..."
git push
```

In Coolify kannst du **Auto-Deploy on Git Push** aktivieren (Webhook) – oder den Deploy-Button manuell drücken.

---

## 🎛️ Modell-Konfiguration

Die App nutzt diese Modelle (alle überschreibbar via Env-Variable):

| Aufgabe | Default | Env-Variable |
|---|---|---|
| Hauptanalyse (lang, "Thinking") | `gemini-2.5-pro` | `MODEL_ANALYZE` |
| Audio-Kommentar (Text) | `gemini-2.5-flash` | `MODEL_COMMENTARY` |
| Kabinen-Dialog | `gemini-2.5-flash` | `MODEL_LOCKER_ROOM` |
| Text-to-Speech | `gemini-2.5-flash-preview-tts` | `MODEL_TTS` |

Die Originalversion der App von AI Studio referenzierte `gemini-3-pro-preview` und `gemini-3-flash-preview`. Wenn du Zugang zu Gemini 3 hast und die Preview-Modelle nutzen willst, setz z. B. `MODEL_ANALYZE=gemini-3-pro-preview` in Coolify.

---

## 🧩 Projektstruktur

```
.
├── Dockerfile                  # Multi-Stage (Build + Runtime)
├── .dockerignore
├── .gitignore                  # schützt .env
├── .env.example                # Vorlage ohne echten Key
├── index.html                  # Vite-Entry
├── package.json
├── tsconfig.json
├── vite.config.ts              # KEIN API-Key-Inject mehr!
├── server/
│   └── index.js                # Express-Proxy, hält den Key
└── src/
    ├── main.tsx                # React-Entry
    ├── App.tsx                 # Hauptlayout
    ├── types.ts
    ├── constants.ts            # Die Mannschaft + Gegner-Teams
    ├── components/
    │   ├── TacticalBoard.tsx
    │   ├── PlayerNode.tsx
    │   ├── ControlPanel.tsx
    │   ├── HistorySidebar.tsx
    │   ├── FeatureModals.tsx
    │   └── LockerRoomModal.tsx
    └── services/
        └── geminiService.ts    # fetch() auf /api/*, KEIN direktes Gemini-SDK
```

---

## 🛡️ Security-Checkliste vor dem ersten Deploy

- [ ] `.env` ist in `.gitignore` (ist sie)
- [ ] `git status` zeigt keine `.env` an
- [ ] Im gebauten Frontend (`npm run build && grep -r "AIza" dist/`) findet sich **kein** echter Key
- [ ] In Coolify ist `GEMINI_API_KEY` als **Runtime**-Env gesetzt (nicht als Build-Arg)
- [ ] Die GitHub-Repo-History enthält keine alte `.env` mit echtem Key
  (falls doch: Key rotieren, `git filter-branch` oder `bfg-repo-cleaner` ausführen)

---

## 📜 Lizenz & Ursprung

Die ursprüngliche App wurde über Google AI Studio erzeugt. Diese Version ist eine komplette Überarbeitung mit selbst-gehostetem Backend-Proxy, statt direkt aus dem Browser gegen Gemini zu sprechen.
