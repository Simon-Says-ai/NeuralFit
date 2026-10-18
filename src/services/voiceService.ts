// Comprehensive Voice AI Service: Speech Recognition + Speech Synthesis

export interface VoiceCommandResult {
  type: 'log_set' | 'complete_current_set' | 'start_rest' | 'adjust_rest' | 'skip_rest' | 'next_exercise' | 'prev_exercise' | 'read_cues' | 'unknown';
  setNumber?: number;
  weight?: number;
  reps?: number;
  restSeconds?: number;
  adjustSeconds?: number;
  rawText: string;
}

// Speech Synthesis (Text-to-Speech)
let synth: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  synth = window.speechSynthesis;
}

export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }
): boolean {
  if (typeof window === 'undefined' || !synth) return false;

  try {
    synth.cancel(); // Stop any ongoing speech

    // Clean markdown/symbols from text before speaking
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/•/g, ',')
      .replace(/(\d+)kg/gi, '$1 kilograms')
      .replace(/(\d+)lbs/gi, '$1 pounds')
      .replace(/(\d+)kcal/gi, '$1 calories')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate || 1.05; // Slightly athletic brisk tempo
    utterance.pitch = options?.pitch || 1.0;

    // Pick best natural English voice if available
    const voices = synth.getVoices();
    const preferredVoice = voices.find(
      v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    utterance.onerror = () => {
      if (options?.onEnd) options.onEnd();
    };

    currentUtterance = utterance;
    synth.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    return false;
  }
}

export function stopSpeaking() {
  if (synth) {
    try {
      synth.cancel();
    } catch {}
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return synth ? synth.speaking : false;
}

// Speech Recognition (Speech-to-Text)
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

type SpeechRecognitionInstance = any;

export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onEnd: () => void,
  onError: (error: string) => void
): { start: () => void; stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) return null;

  try {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognizer: SpeechRecognitionInstance = new SpeechRec();

    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = 'en-US';

    recognizer.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = (final || interim).trim();
      if (text) {
        onResult(text, !!final);
      }
    };

    recognizer.onerror = (event: any) => {
      onError(event.error || 'Speech recognition encountered an issue');
    };

    recognizer.onend = () => {
      onEnd();
    };

    return {
      start: () => {
        try {
          recognizer.start();
        } catch (e) {
          console.warn('Recognizer already running or could not start', e);
        }
      },
      stop: () => {
        try {
          recognizer.stop();
        } catch {}
      },
    };
  } catch (err) {
    console.warn('Could not initialize SpeechRecognition:', err);
    return null;
  }
}

// Natural voice command parsing for hands-free workout logging
export function parseVoiceWorkoutCommand(rawText: string): VoiceCommandResult {
  const text = rawText.toLowerCase().trim();

  // 1. Skip / Stop Rest
  if (text.includes('skip rest') || text.includes('stop rest') || text.includes('cancel rest')) {
    return { type: 'skip_rest', rawText };
  }

  // 2. Adjust Rest Time
  if (text.includes('add 30') || text.includes('plus 30') || text.includes('more 30')) {
    return { type: 'adjust_rest', adjustSeconds: 30, rawText };
  }
  if (text.includes('add 15') || text.includes('plus 15')) {
    return { type: 'adjust_rest', adjustSeconds: 15, rawText };
  }
  if (text.includes('minus 15') || text.includes('less 15')) {
    return { type: 'adjust_rest', adjustSeconds: -15, rawText };
  }

  // 3. Start Rest Timer
  if (text.includes('start rest') || text.includes('take rest') || text.includes('rest timer')) {
    const matchSeconds = text.match(/(\d+)\s*(seconds|secs|s)/);
    const seconds = matchSeconds ? parseInt(matchSeconds[1]) : 90;
    return { type: 'start_rest', restSeconds: seconds, rawText };
  }

  // 4. Navigation
  if (text.includes('next exercise') || text.includes('next movement') || text.includes('next lift')) {
    return { type: 'next_exercise', rawText };
  }
  if (text.includes('previous exercise') || text.includes('back exercise')) {
    return { type: 'prev_exercise', rawText };
  }

  // 5. Read Cues
  if (text.includes('read cue') || text.includes('form cue') || text.includes('how do i do') || text.includes('form tips')) {
    return { type: 'read_cues', rawText };
  }

  // 6. Complete set without specific numbers ("done", "complete set", "finished set", "set done")
  if (text === 'done' || text === 'finished' || text.includes('complete set') || text.includes('set done') || text.includes('finished set')) {
    return { type: 'complete_current_set', rawText };
  }

  // 7. Full set log command (e.g., "log set 2 80 kg 8 reps" or "80 kilos for 8 reps" or "set 1 100 for 5")
  // Regex to extract weight and reps
  // Pattern A: "set 1 80 kg 8 reps" / "log set 2: 75 kilos 10 reps"
  const setMatch = text.match(/set\s*(\d+)/);
  const setNumber = setMatch ? parseInt(setMatch[1]) : undefined;

  // Weight patterns: "80 kg", "80 kilos", "80 pounds", "80 lbs", "at 80", "with 80"
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilos|pounds|lbs)?\s*(?:for|x|times|\sat|\swith)?\s*(\d+)\s*(?:reps|rep)/)
    || text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilos|pounds|lbs)\s*(\d+)/)
    || text.match(/(\d+)\s*reps\s*(?:at|with)?\s*(\d+(?:\.\d+)?)/);

  if (weightMatch) {
    let weight: number;
    let reps: number;

    // Check if reps came first
    if (text.includes('reps at') || text.includes('reps with')) {
      reps = parseInt(weightMatch[1]);
      weight = parseFloat(weightMatch[2]);
    } else {
      weight = parseFloat(weightMatch[1]);
      reps = parseInt(weightMatch[2]);
    }

    if (!isNaN(weight) && !isNaN(reps)) {
      return {
        type: 'log_set',
        setNumber,
        weight,
        reps,
        rawText,
      };
    }
  }

  // Fallback simple "X reps" e.g., "10 reps" (uses existing weight)
  const onlyRepsMatch = text.match(/(\d+)\s*reps/);
  if (onlyRepsMatch) {
    return {
      type: 'log_set',
      setNumber,
      reps: parseInt(onlyRepsMatch[1]),
      rawText,
    };
  }

  return { type: 'unknown', rawText };
}
