import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Loader2, Volume2, VolumeX, Mic, MicOff, Volume1, Square } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { askGeminiFitnessCoach } from '../services/geminiCoach';
import { createSpeechRecognizer, isSpeechRecognitionSupported, speakText, stopSpeaking } from '../services/voiceService';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  'Sore shoulders: suggest safe pressing substitutes',
  'Compress today into a 30-min superset protocol',
  'High-protein post-workout snack under 350 kcal',
  'How to break a plateau on Barbell Bench Press?',
  'Optimal hydration & electrolytes for heavy leg days',
];

export const AICoachModal: React.FC<AICoachModalProps> = ({ isOpen, onClose }) => {
  const { profile, workoutPlan } = useFitness();
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(true);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState<number | null>(null);

  const recognizerRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Hello ${profile.name}. I'm your NeuralFit Conditioning & Nutrition Specialist. Your current target is ${profile.targetCalories} kcal with ${profile.targetProteinG}g protein for ${profile.primaryGoal.replace('_', ' ')}. You can type or tap the microphone to talk with me!`,
    },
  ]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      recognizerRef.current?.stop();
    };
  }, []);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() || loading) return;

    if (isDictating) {
      recognizerRef.current?.stop();
      setIsDictating(false);
    }

    const userMessage = textToSend.trim();
    setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setPrompt('');
    setLoading(true);

    try {
      const answer = await askGeminiFitnessCoach(userMessage, profile, workoutPlan);
      const newHistory = [...history, { role: 'user' as const, text: userMessage }, { role: 'assistant' as const, text: answer }];
      setHistory(newHistory);

      if (autoSpeakEnabled) {
        setActiveSpeakingIdx(newHistory.length - 1);
        speakText(answer, {
          onEnd: () => setActiveSpeakingIdx(null),
        });
      }
    } catch {
      const fallback = 'Focus on progressive overload, 2.0g protein/kg, and consistent sleep quality to sustain your athletic progression.';
      setHistory(prev => [...prev, { role: 'assistant', text: fallback }]);
      if (autoSpeakEnabled) {
        speakText(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDictation = () => {
    if (isDictating) {
      recognizerRef.current?.stop();
      setIsDictating(false);
    } else {
      if (!isSpeechRecognitionSupported()) {
        alert('Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      recognizerRef.current = createSpeechRecognizer(
        (text, isFinal) => {
          setPrompt(text);
          if (isFinal) {
            setIsDictating(false);
          }
        },
        () => setIsDictating(false),
        (err) => {
          console.warn('Voice dictation error:', err);
          setIsDictating(false);
        }
      );

      recognizerRef.current?.start();
      setIsDictating(true);
    }
  };

  const handleSpeakMessage = (idx: number, text: string) => {
    if (activeSpeakingIdx === idx) {
      stopSpeaking();
      setActiveSpeakingIdx(null);
    } else {
      setActiveSpeakingIdx(idx);
      speakText(text, {
        onEnd: () => setActiveSpeakingIdx(null),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full h-[600px] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>NeuralFit AI Strength & Nutrition Coach</span>
                <span className="text-[10px] text-blue-400 font-mono">[Voice AI Enabled]</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Grounded in your {profile.fitnessLevel} profile · {profile.primaryGoal.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Speak toggle */}
            <button
              onClick={() => {
                setAutoSpeakEnabled(!autoSpeakEnabled);
                if (autoSpeakEnabled) stopSpeaking();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition-colors ${
                autoSpeakEnabled
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={autoSpeakEnabled ? 'Voice Readout: ON' : 'Voice Readout: OFF'}
            >
              {autoSpeakEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Voice Out</span>
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3.5 text-xs leading-relaxed whitespace-pre-line relative group ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                {msg.text}

                {/* Speak button on assistant answers */}
                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={() => handleSpeakMessage(idx, msg.text)}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {activeSpeakingIdx === idx ? (
                        <>
                          <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
                          <span className="text-rose-400">Stop Speaking</span>
                        </>
                      ) : (
                        <>
                          <Volume1 className="w-3 h-3" />
                          <span>Listen Aloud</span>
                        </>
                      )}
                    </button>
                    <span className="font-mono text-[10px] text-slate-500">Coach AI</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 border border-slate-800 p-3 rounded-lg w-max">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Analyzing bio-parameters & formulating response...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-6 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-300 rounded text-[11px] whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Dictation Banner */}
        {isDictating && (
          <div className="px-6 py-1.5 bg-rose-950/40 border-t border-rose-900/50 text-xs text-rose-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Listening to your voice... Speak your question now.</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          {/* Microphone push-to-talk button */}
          <button
            type="button"
            onClick={toggleDictation}
            className={`p-2.5 rounded transition-all ${
              isDictating
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
            }`}
            title={isDictating ? 'Stop microphone dictation' : 'Click to speak your question'}
          >
            {isDictating ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Type or click the microphone to speak with your coach..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />

          <button
            type="button"
            disabled={!prompt.trim() || loading}
            onClick={() => handleSend()}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
