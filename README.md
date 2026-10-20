# SignBridge

A clean, modern web app that shows live webcam hand tracking and turns recognized signs into captions and speech.

## Features
- Real‑time hand tracking with MediaPipe
- Mock sign recognizer (keyboard shortcuts) – replaceable with a real model later
- Azure OpenAI‑driven gloss‑to‑sentence smoothing (fallback to browser TTS/STT)
- Dataset recorder for building your own model
- Privacy‑first: all video processing runs **on‑device**

## Tech Stack
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, lucide‑react, Framer Motion
- **Hand tracking**: `@mediapipe/tasks-vision`
- **Backend**: Node.js + Express, dotenv, cors, express‑rate‑limit
- **Azure**: OpenAI (gloss → sentence) and Speech (TTS / STT)

## Getting Started
```bash
# Clone and enter the repo
git clone <repo‑url>
cd signbridge

# Install dependencies (client & server)
npm install   # installs both workspace packages

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your Azure keys (optional)

# Run the development servers
npm run dev   # starts Vite (client) on http://localhost:5173
npm run server # starts Express API on http://localhost:3001
```

The app works out‑of‑the‑box without Azure keys – it falls back to the browser’s
`speechSynthesis` and `webkitSpeechRecognition` APIs.

## Mock Mode
Press number keys **1‑9** to emit sample signs (HELLO, ME, …). This is provided
by `src/lib/recognizer.ts` and can be swapped for a real `OnnxRecognizer`
implementation later without touching the UI.

## Project Structure
```
signbridge/
├─ client/          # React app
│  ├─ src/
│  │  ├─ pages/        # Home, Interpreter, Recorder, About
│  │  ├─ components/   # UI primitives, SettingsDrawer, CaptionPanel, etc.
│  │  ├─ lib/          # recognizer, landmarks, preprocess, buffer, postprocess
│  │  └─ hooks/       # custom React hooks
│  ├─ public/
│  └─ index.html
├─ server/          # Express API
│  ├─ routes/
│  │  ├─ smooth.js
│  │  └─ speech-token.js
│  ├─ index.js
│  └─ .env.example
├─ .gitignore
└─ README.md
```

---

The repository is now scaffolded. I’ll continue adding the client configuration files,
the core library, pages, and the minimal backend.

*Next step:* create `package.json`, Vite, Tailwind, and TypeScript configs.
