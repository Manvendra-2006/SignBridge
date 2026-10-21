# SignBridge

**Real-time sign language interpretation in your browser.**

SignBridge watches a signer's webcam, recognizes signs on the device, turns them into natural sentences, and speaks them aloud. It also works the other way: a hearing person's speech becomes live captions for the signer.

Built for the **Microsoft Agentic AI Hackathon** (Rungta) with GitHub Copilot, ONNX Runtime Web, Azure OpenAI and Azure AI Speech.

---

## The problem

Deaf and hard-of-hearing people who sign struggle to be understood in video calls, since most people don't know sign language and interpreters are costly or unavailable.

## The solution

A web app that:

1. Tracks the signer's hands with MediaPipe, in the browser.
2. Recognizes signs from a starter vocabulary with an on-device model.
3. Smooths the recognized words into a natural English sentence.
4. Shows captions and speaks the sentence.
5. Turns the hearing person's speech into live captions for the signer.

**Privacy first:** video and the model stay on the device. Only short text goes to the cloud.

---

## How it works

```
Webcam -> MediaPipe landmarks -> Preprocess -> 30-frame buffer
       -> ONNX model (browser) -> Debounce -> Gloss words
       -> Azure OpenAI (sentence) -> Captions + Azure Speech (voice)

Hearing person speaks -> Speech-to-text -> Captions for the signer
```

| Stage | Technology | Runs |
|---|---|---|
| Capture | `getUserMedia` | Browser |
| Hand landmarks | MediaPipe HandLandmarker | Browser |
| Preprocessing | TypeScript (`src/lib/preprocess.ts`) | Browser |
| Sign recognition | ONNX model via ONNX Runtime Web | Browser |
| Post-processing | Confidence threshold, debounce, phrase end | Browser |
| Sentence smoothing | Azure OpenAI (via backend) | Cloud, text only |
| Voice and speech-to-text | Azure AI Speech | Cloud |

---

## Tech stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Framer Motion, lucide-react
- **Hand tracking:** MediaPipe Tasks (HandLandmarker)
- **Model:** GRU/LSTM sequence model trained in Python, exported to ONNX
- **Inference:** ONNX Runtime Web
- **Backend:** Node.js, Express, dotenv, cors, express-rate-limit
- **AI services:** Azure OpenAI, Azure AI Speech
- **Dev tool:** GitHub Copilot

---

## Features

- Live webcam with hand skeleton overlay
- Raw signs and smoothed sentence, with a confidence bar
- Speak, Clear, Download transcript, Large text
- **Listen** mode: hearing person's speech to live captions
- **Dataset Recorder** page to record labelled sign samples
- Settings: skeleton toggle, confidence threshold, mock mode, voice
- Fallbacks when Azure is not configured: browser speech and raw gloss text

---

## Project structure

```
signbridge/
  client/
    public/model/        model.onnx and labels.json
    src/
      pages/             Home, Interpreter, Recorder, About
      components/
      lib/
        landmarks.ts     MediaPipe hand tracking
        preprocess.ts    landmarks -> 126-number vector per frame
        buffer.ts        ring buffer of the last 30 frames
        recognizer.ts    ONNX model (or mock) -> label + confidence
        postprocess.ts   threshold, debounce, phrase detection
  server/
    index.js             Express API
    .env.example
  README.md
```

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- A modern browser (Chrome or Edge) with a webcam

### 1. Install

```bash
# client
cd client
npm install

# server
cd ../server
npm install
```

### 2. Configure the server (optional)

Copy `server/.env.example` to `server/.env` and fill in your Azure values:

```dotenv
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_KEY=your-openai-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name

AZURE_SPEECH_KEY=your-speech-key
AZURE_SPEECH_REGION=your-speech-region
```

Without these keys the app still works: it shows raw gloss words and uses the browser's built-in voice and speech recognition.

**Never commit `.env`.** It is listed in `.gitignore`.

### 3. Run

```bash
# terminal 1: backend
cd server
npm start

# terminal 2: frontend
cd client
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) and allow camera access.

---

## The sign model

The trained model lives in `client/public/model/`:

| File | Purpose |
|---|---|
| `model.onnx` | Trained sign classifier |
| `labels.json` | Array of sign names, includes `IDLE` |

**Model contract**

| Item | Value |
|---|---|
| Input name | `input` |
| Input shape | `[1, 30, 126]`, float32 |
| Output name | `output` (a score per label) |

**Input vector:** 2 hands x 21 landmarks x (x, y, z) = 126 numbers per frame, 30 frames per window.

**Preprocessing (must match Python training exactly):**

1. Order hands as Left then Right, with zeros for a missing hand.
2. For each present hand, subtract the wrist landmark.
3. Divide by that hand's maximum absolute coordinate.

See `src/lib/preprocess.ts` for the reference implementation.

**Vocabulary:** `<N>` signs plus `IDLE` (fill in your signs).
**Test accuracy:** `<__%>`  |  **Live accuracy:** `<__%>`  |  **Latency per prediction:** `<__ ms>`

### Mock mode

Turn on **Mock mode** in Settings (or remove `model.onnx`) to test the full flow without the model. Number keys `1` to `9` emit sample signs.

### Recording new data

1. Open the **Recorder** page.
2. Enter a label, press **Space**, and sign.
3. Record 30 to 50 samples per sign, plus an `IDLE` label (hands down, no sign).
4. Click **Export JSON** and use the file to retrain the model.

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/smooth` | Body `{ "gloss": ["HELLO","ME","NAME","RAHUL"] }`, returns `{ "sentence": "Hello, my name is Rahul." }`. Falls back to joined words with `fallback: true`. |
| `GET` | `/api/speech-token` | Short-lived Azure Speech token and region. Keys never reach the browser. |

---

## Microsoft technologies

| Technology | Role |
|---|---|
| GitHub Copilot | Helped write the pipeline, preprocessing, training scripts, API wrapper and UI |
| ONNX Runtime Web | Runs the sign model in the browser, so video never leaves the device |
| Azure OpenAI | Turns sign words into a natural sentence |
| Azure AI Speech (TTS) | Speaks the sentence for hearing participants |
| Azure AI Speech (STT) | Turns a hearing person's speech into captions for the signer |

MediaPipe (Google) is used for hand landmark detection.

---

## Limitations

- Recognizes a small starter vocabulary, not full sign language.
- Accuracy depends on lighting, camera angle and background.
- Facial expressions and sign grammar are not captured yet.
- A support tool, not a replacement for human interpreters.
- Needs validation with real signers before real-world use.

## Roadmap

- Larger vocabulary and Indian Sign Language (ISL)
- Continuous signing
- Chrome and Edge extension (Manifest V3) with caption overlay on meeting sites
- Personalization from user corrections
- Transcript history (SQLite or Azure Cosmos DB)

---

## Team

- `<Name>`: Developer (frontend, backend, Azure integration)
- `<Name>`: ML (dataset, model training, ONNX export)

## License

`<Add a license, for example MIT>`
