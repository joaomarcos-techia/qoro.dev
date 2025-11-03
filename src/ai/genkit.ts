// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn(
    'AVISO: A variável de ambiente GEMINI_API_KEY ou GOOGLE_API_KEY não está definida. A comunicação com a Google AI API falhará.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  enableTracingAndMetrics: false, // Desabilita telemetria para evitar warnings de build
});

export { googleAI };
