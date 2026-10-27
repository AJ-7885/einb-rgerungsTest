# Einbürgerungstest Plus 🇩🇪

An interactive, multilingual trainer for the official German naturalization exam (**Einbürgerungstest** / **Leben in Deutschland**), featuring all **460 official BAMF questions** (300 federal questions + 160 state-specific questions for all 16 *Bundesländer*).

---

## ✨ Key Features

- **Complete 460-Question Official Catalog**:
  - **300 Federal Questions** (*Politik in der Demokratie*, *Geschichte & Verantwortung*, *Mensch & Gesellschaft*)
  - **160 State Questions** (10 questions for each of the 16 German federal states / *Bundesländer*)
- **Flexible Translation Modes (`Nur DE` · `EN + فا` · `EN` · `فارسی`)**:
  - Practice in **German only (`Nur DE`)**, or view complete **English (`EN`)** and **Persian (`فارسی`)** translations for every question, answer option, and explanation.
- **Natural German Pronunciation (TTS)**:
  - Defaults to **Anna (`de-DE`)** with automatic German abbreviation expansion (`z. B.`, `bzw.`, `Art.`, `§`, etc.) and clean pitch-preserved playback.
  - Interactive word-by-word pronunciation and syllable breakdown popups (`Grund·ge·setz`, `Rechts·staat`, etc.).
  - Optional **Google Neural Deutsch (WaveNet KI)** voice when running locally, with automatic fallback to `Anna` on static hosts or offline.
- **Official Exam Simulator (33 Questions · 60 Minutes)**:
  - Generates a realistic 33-question exam (30 federal + 3 state questions for your selected *Bundesland*) with a 60-minute timer and pass threshold of **17 / 33**.
- **Smart Mistake & Bookmark Tracking**:
  - Automatically adds wrongly answered questions to your **Mistakes (*Fehler*)** list and removes them once answered correctly.
- **Interactive 3D Civic Visualizers & Glossary**:
  - Explore interactive 3D models of Germany's constitutional organs (*Gewaltenteilung*, *Föderalismus*, *Wahlsystem*) and a searchable trilingual civic glossary.
- **100% Offline-Ready PWA**:
  - Installable as a Progressive Web App on desktop and mobile; all progress is saved locally in `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS 4 + Lucide Icons
- **3D & Animations**: Three.js + Canvas Confetti
- **Offline / PWA**: `vite-plugin-pwa` (Workbox service worker)
- **Package Manager**: `pnpm`

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v20+ or v22+ recommended)
- **pnpm** (`npm install -g pnpm` or `corepack enable`)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start the Development Server
```bash
pnpm dev
```
Then open **`http://localhost:3000/`** (or the port shown in your terminal, e.g., `http://localhost:3001/`) in your browser.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start the local Vite development server |
| `pnpm build` | Build the production static bundle into `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run TypeScript type-checking (`tsc --noEmit`) |
| `pnpm clean` | Remove the `dist/` build output |

---

## 🌐 Deploying to GitHub Pages

This project is pre-configured for **GitHub Pages** with relative asset paths (`base: './'` in [`vite.config.ts`](vite.config.ts)) and an automated **pnpm** GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. **Push the repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Einbürgerungstest Plus"
   git branch -M main
   git remote add origin https://github.com/AJ-7885/einb-rgerungsTest.git
   git push -u origin main
   ```
2. **Enable GitHub Pages**:
   - In your GitHub repository, navigate to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every push to `main` will automatically run `pnpm install` and `pnpm run build` and publish the `dist/` directory to `https://aj-7885.github.io/einb-rgerungsTest/`.

---

## 📁 Project Structure

```text
├── .github/workflows/deploy.yml   # GitHub Pages automated deployment (pnpm)
├── public/                        # Static PWA icon
├── src/
│   ├── assets/images/             # Bundled hero & UI images
│   ├── components/                # UI components (QuestionCard, ExamSimulator, ThreeDVisualizer, etc.)
│   ├── data/
│   │   ├── glossary.ts            # Trilingual civic glossary with syllable splits
│   │   ├── questions.ts           # Typed export of all 460 questions
│   │   ├── states.ts              # All 16 German Bundesländer metadata
│   │   └── questions/
│   │       └── allQuestions.json  # Complete 460-question DE/EN/FA dataset
│   ├── hooks/                     # Progress persistence (localStorage) & PWA install hooks
│   ├── services/speechService.ts  # German TTS engine (Anna default + abbreviation normalizer)
│   ├── types/                     # TypeScript interfaces
│   ├── App.tsx                    # Main application layout & navigation
│   └── main.tsx                   # Application entry point
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── vite.config.ts
```
