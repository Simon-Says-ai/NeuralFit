import React, { useState } from 'react';
import {
  X,
  Terminal,
  Layers,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Rocket,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'nextjs' | 'deploy'>('local');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickstartCommands = `# 1. Clone or download this project to your machine
cd neuralfit

# 2. Install dependencies using Node.js 18+ or 20+
npm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. (Optional) Add your Gemini API key in .env.local for AI features
# GEMINI_API_KEY="your-gemini-api-key"

# 5. Launch the local development server
npm run dev`;

  const nextjsPackageJson = `{
  "name": "neuralfit",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@google/genai": "^2.4.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0"
  }
}`;

  const nextConfigCode = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;`;

  const nextAppPageCode = `// app/page.tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled prevents any browser SpeechRecognition/AudioContext hydration mismatches
const App = dynamic(() => import('@/src/App'), { ssr: false });

export default function Page() {
  return <App />;
}`;

  const vercelDeploySteps = `# Option A: Deploy with Vercel CLI (Fastest & Free)
npm i -g vercel
vercel

# Option B: Deploy via GitHub
1. Push this repository to GitHub
2. Visit https://vercel.com/new and select your repo
3. Set Framework Preset to "Vite" (or "Next.js")
4. In Environment Variables, add GEMINI_API_KEY
5. Click "Deploy" (instant live URL + HTTPS for Voice AI)`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>NeuralFit Setup & Deployment Center</span>
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono px-1.5 py-0.5 rounded">
                  v3.8 Production
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Run locally on your machine, deploy to Vercel/Cloud, or adapt to Next.js App Router
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
              activeTab === 'local'
                ? 'bg-slate-900 border-slate-700 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Run on Your Machine</span>
          </button>

          <button
            onClick={() => setActiveTab('nextjs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
              activeTab === 'nextjs'
                ? 'bg-slate-900 border-slate-700 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Next.js 15 Integration</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
              activeTab === 'deploy'
                ? 'bg-slate-900 border-slate-700 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deploy to Web (Vercel / Cloud)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {activeTab === 'local' && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>3-Minute Quickstart on Local Machine</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  NeuralFit is built with Node.js and React 19. It runs with zero database configuration needed out of the box because all workouts, periodization plans, nutrition logs, and voice states run on client storage and Web APIs.
                </p>
              </div>

              {/* Code Block */}
              <div className="relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Terminal Commands</span>
                  <button
                    onClick={() => copyToClipboard(quickstartCommands, 'quickstart')}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    {copiedIndex === 'quickstart' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'quickstart' ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                  {quickstartCommands}
                </pre>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] font-mono">
                  Prerequisites & Key Notes:
                </h4>
                <ul className="space-y-2 list-disc list-inside text-slate-400 leading-relaxed">
                  <li>
                    <strong className="text-slate-200">Node.js:</strong> Ensure Node.js version 18.x, 20.x, or 22.x is installed (check with <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400 font-mono">node -v</code>).
                  </li>
                  <li>
                    <strong className="text-slate-200">Local URL:</strong> Open <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400 font-mono">http://localhost:3000</code> in Google Chrome, Microsoft Edge, or Brave.
                  </li>
                  <li>
                    <strong className="text-slate-200">Microphone & Voice AI:</strong> Browsers allow microphone access on <code className="text-blue-400 font-mono">localhost</code> without HTTPS. When clicking the mic button, approve the browser microphone prompt.
                  </li>
                  <li>
                    <strong className="text-slate-200">AI Coach Key:</strong> Get a free Gemini API key at <code className="text-blue-400 font-mono">ai.google.dev</code> and add it to <code className="text-blue-400 font-mono">.env.local</code> as <code className="text-blue-400 font-mono">GEMINI_API_KEY</code>.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'nextjs' && (
            <div className="space-y-5">
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Converting NeuralFit to Next.js 15 App Router</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Because NeuralFit uses real-time Web Audio synthesizers, Web SpeechRecognition, and dynamic periodized client state, in Next.js it runs as a client-side component tree (<code className="text-indigo-300 font-mono">'use client'</code>) with static export or Node server support.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-200 text-xs">Step 1: Next.js package.json</span>
                    <button
                      onClick={() => copyToClipboard(nextjsPackageJson, 'pkg')}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      {copiedIndex === 'pkg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] overflow-x-auto text-slate-300">
                    {nextjsPackageJson}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-200 text-xs">Step 2: next.config.mjs</span>
                    <button
                      onClick={() => copyToClipboard(nextConfigCode, 'cfg')}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      {copiedIndex === 'cfg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] overflow-x-auto text-slate-300">
                    {nextConfigCode}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-200 text-xs">Step 3: app/page.tsx (Client Hydration Safe)</span>
                    <button
                      onClick={() => copyToClipboard(nextAppPageCode, 'page')}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      {copiedIndex === 'page' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] overflow-x-auto text-slate-300">
                    {nextAppPageCode}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Production Cloud Deployment (HTTPS Enabled)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Web browsers enforce that microphone access (Voice AI speech recognition) and audio autoplay require an <strong>HTTPS</strong> connection on production domains. Deploying to Vercel, Netlify, or Cloud Run gives you free automated SSL certificates.
                </p>
              </div>

              {/* Vercel steps */}
              <div className="relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>1-Click Vercel Deployment</span>
                  <button
                    onClick={() => copyToClipboard(vercelDeploySteps, 'vercel')}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    {copiedIndex === 'vercel' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                  {vercelDeploySteps}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <h5 className="font-semibold text-white text-xs">Docker / Cloud Run</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Build with <code className="text-blue-400 font-mono">npm run build</code> and serve the <code className="text-blue-400 font-mono">dist/</code> static files with NGINX or Node.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <h5 className="font-semibold text-white text-xs">Netlify / GitHub Pages</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Set build command to <code className="text-blue-400 font-mono">npm run build</code> and publish directory to <code className="text-blue-400 font-mono">dist</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            NEURALFIT ARCHITECTURE · DUAL COMPATIBLE (VITE + NEXT.JS)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm shadow-blue-600/20"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
