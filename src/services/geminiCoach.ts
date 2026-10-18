import { GoogleGenAI } from '@google/genai';
import { UserProfile, WorkoutPlan } from '../types/fitness';

export async function askGeminiFitnessCoach(
  userPrompt: string,
  profile: UserProfile,
  currentPlan?: WorkoutPlan
): Promise<string> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
                 '';

  const systemPrompt = `You are the Head Strength & Conditioning Specialist and Sports Nutritionist for NeuralFit.
User Profile:
- Name: ${profile.name}
- Age: ${profile.age}, Gender: ${profile.gender}
- Current Weight: ${profile.weightKg}kg, Target Weight: ${profile.targetWeightKg}kg, Height: ${profile.heightCm}cm
- Fitness Level: ${profile.fitnessLevel}
- Primary Goal: ${profile.primaryGoal}
- Available Equipment: ${profile.availableEquipment}
- Dietary Preference: ${profile.dietaryPreference}
- Target Daily Calories: ${profile.targetCalories} kcal (Protein: ${profile.targetProteinG}g, Carbs: ${profile.targetCarbsG}g, Fat: ${profile.targetFatG}g)
${currentPlan ? `Current Training Split: ${currentPlan.splitType}` : ''}

Provide concise, evidence-based, actionable guidance. Use clean plain text formatting with bullet points. Avoid generic fluff or medical disclaimers; give high-impact fitness execution cues and nutrient advice.`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userPrompt}` }] }
        ]
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call error, falling back to smart fitness engine:', err);
    }
  }

  // Smart domain-tailored fallback when offline or no API key is set
  return generateLocalCoachResponse(userPrompt, profile);
}

function generateLocalCoachResponse(prompt: string, profile: UserProfile): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('sore') || lower.includes('shoulder') || lower.includes('pain') || lower.includes('injury')) {
    return `Specialist Protocol for Recovery & Joint Health:
• Swap overhead barbell pressing for Neutral-Grip Dumbbell Floor Presses or High-Incline Low-Angle Presses to alleviate acromial impingement.
• Add 3 sets of 15 reps on Cable Face Pulls or Band Pull-Aparts before pressing to activate the lower traps and rotator cuff.
• Ensure eccentric control (3 seconds down) and avoid letting elbows flare past 45-60 degrees.
• Nutrition Note: Keep daily hydration above ${profile.waterTargetMl}ml and ensure adequate protein (${profile.targetProteinG}g) to support tendon and soft-tissue repair.`;
  }

  if (lower.includes('time') || lower.includes('short') || lower.includes('busy') || lower.includes('30 min')) {
    return `30-Minute High-Density Workout Protocol:
• Superset Structure: Pair opposing compound movements with minimal transition (e.g., Incline Dumbbell Press immediately into Chest-Supported Dumbbell Rows).
• Set Count: Execute 3 high-intensity working sets taken to 1-2 Reps in Reserve (RIR).
• Rest Intervals: Limit rest between superset pairs to 60-75 seconds.
• Warm-up: 3 minutes of dynamic movement (hip sweeps + push-up plus), then go directly to your first ramp-up set.`;
  }

  if (lower.includes('snack') || lower.includes('meal') || lower.includes('recipe') || lower.includes('food') || lower.includes('protein')) {
    return `Tailored Nutrition Recommendation (${profile.dietaryPreference.toUpperCase()}):
• High-Protein Option: 200g Greek Yogurt (0% fat) mixed with 1 scoop Whey/Plant Isolate, 50g fresh blueberries, and 15g crushed walnuts. (320 kcal | 42g Protein | 18g Carbs | 8g Fat).
• Pre-Workout Fuel (60-90m prior): 40g cream of rice or oatmeal with sliced banana and cinnamon. Provides rapid glycogen replenishment without GI distress.
• Daily Target Progress: Target ${Math.round(profile.targetProteinG / 4)}g protein distributed evenly across 4 daily meals to maximize muscle protein synthesis (MPS).`;
  }

  return `Adaptive Training Guidance for ${profile.name}:
• Progressive Overload Focus: Aim to add either 1 rep per set or 1.25kg - 2.5kg to your primary compound lifts every 1-2 weeks.
• Recovery Optimization: Sleep 7.5 to 8.5 hours in a cool, dark room. High-intensity strength training requires CNS restoration.
• Current Caloric Balance: You are targeted at ${profile.targetCalories} kcal/day with ${profile.targetProteinG}g protein. Consistency with daily weigh-ins (first thing in morning) will confirm whether your rate of progress matches your ${profile.primaryGoal.replace('_', ' ')} goal.`;
}
