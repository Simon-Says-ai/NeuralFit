# NeuralFit — Local Setup & Deployment Guide

This document outlines the step-by-step instructions to get **NeuralFit** operating on your local machine and deployed to production.

---

## Architecture Overview

NeuralFit is engineered with **React 19**, **Tailwind CSS**, and modern Web APIs:
- **Speech Recognition & Synthesis**: Natural language voice-controlled workout logging and spoken countdown cues directly in modern browsers (Chrome, Edge, Safari, Brave).
- **Web Audio API**: Real-time synthesized acoustic chimes for rest intervals and set completion.
- **Biometric Periodization Engine**: Instant client-side Mifflin-St Jeor TDEE calculation, Epley 1RM estimation, and periodized split generation.
- **Gemini AI Strength & Nutrition Specialist**: Dynamic generative recommendations powered by `@google/genai` (with intelligent offline fallbacks).

---

## 1. Running NeuralFit Locally on Your Machine (3 Steps)

### Step 1: Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```
*(Ensure you have Node.js 18.x, 20.x, or 22.x installed. Verify with `node -v`)*.

### Step 2: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Edit `.env.local` to configure your API keys (optional for basic use, recommended for full AI coaching):
```env
# Optional: Your Google Gemini API Key from https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key"
```

### Step 3: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

> **Microphone Permissions**: When using Voice AI, click the microphone button in the Live Workout Runner or AI Coach modal and click **Allow** on the browser's permission prompt. Browsers permit microphone access on `localhost` without HTTPS.

---

## 2. Converting to Next.js 15 (App Router)

If you prefer to run or deploy NeuralFit inside a Next.js 15 application, follow these simple steps:

### Next.js Dependencies
Create a new Next.js project or update your `package.json`:
```bash
npx create-next-app@latest neuralfit --typescript --tailwind --app --eslint
```
Install the project packages:
```bash
npm install @google/genai lucide-react motion
```

### App Router Setup (`app/page.tsx`)
Because NeuralFit uses browser-native Web Audio and Web Speech APIs, load the application dynamically with SSR disabled to prevent hydration mismatches:

```tsx
// app/page.tsx
'use client';

import dynamic from 'next/dynamic';

const NeuralFitApp = dynamic(() => import('@/src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono text-sm">
      Initializing NeuralFit Engine...
    </div>
  ),
});

export default function Page() {
  return <NeuralFitApp />;
}
```

### Next.js Config (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
```

---

## 3. Production Deployment Options

### Option A: Vercel (Recommended & 1-Click)
Deploying to Vercel provides automatic HTTPS, which is required for microphone/voice features in production:

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial NeuralFit commit"
   git remote add origin https://github.com/your-username/neuralfit.git
   git push -u origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Set Framework Preset to **Vite** (or **Next.js** if using the Next.js setup).
5. Under **Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: `your-gemini-api-key`
6. Click **Deploy**. Your app will be live with a free custom SSL domain in seconds.

### Option B: Netlify
1. Connect your repository on Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `GEMINI_API_KEY` in Site Settings > Environment Variables.

### Option C: Docker / Cloud Run / Linux VPS
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The static production assets will be generated in `/dist`. Serve them using NGINX, Caddy, or `serve`:
   ```bash
   npx serve -s dist -l 3000
   ```

---

## 4. Voice AI Troubleshooting
- **HTTPS Requirement**: On remote domains (`https://your-domain.com`), Web Speech Recognition requires HTTPS. Localhost (`http://localhost:3000`) is exempt.
- **Browser Compatibility**: Best supported in Chromium-based browsers (Google Chrome, Microsoft Edge, Brave, Opera) and Safari. Firefox does not currently support the Web SpeechRecognition API by default.
