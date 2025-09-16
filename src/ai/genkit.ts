import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Função para validar e obter a API key
function getGoogleApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  console.log('Verificando GOOGLE_API_KEY...');
  console.log('Definida:', !!apiKey);
  console.log('Comprimento:', apiKey?.length || 0);
  console.log('Primeiros chars:', apiKey?.substring(0, 15) + '...');
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY não está definida nas variáveis de ambiente');
  }
  
  if (apiKey.length < 20) {
    throw new Error('GOOGLE_API_KEY parece inválida (muito curta)');
  }
  
  return apiKey;
}

console.log('Inicializando Genkit...');

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: getGoogleApiKey(),
    })
  ],
  model: 'googleai/gemini-2.0-flash',
  enableTracingAndMetrics: process.env.NODE_ENV === 'development',
});

console.log('Genkit inicializado com sucesso');