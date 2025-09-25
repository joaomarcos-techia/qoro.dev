'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as qualificationService from '@/services/qualificationService';
import { QualificationLeadSchema } from '@/ai/schemas';

const questions = [
  { key: 'companySize', title: 'Qual o tamanho da sua empresa?' },
  { key: 'inefficientProcesses', title: 'Quais processos internos hoje consomem mais tempo da sua equipe?' },
  { key: 'currentTools', title: 'Quais ferramentas ou softwares vocês já utilizam no dia a dia?' },
  { key: 'urgency', title: 'Qual o nível de prioridade que você dá para resolver esse problema?' },
  { key: 'interestedServices', title: 'Em quais serviços você tem mais interesse?' },
  { key: 'investmentRange', title: 'Em qual faixa de investimento você estaria confortável para este projeto?' },
  { key: 'desiredOutcome', title: 'O que você gostaria de alcançar com essa solução?' },
];

const contactFields = [
    { key: 'fullName', title: 'Nome Completo' },
    { key: 'role', title: 'Cargo' },
    { key: 'email', title: 'E-mail' },
];

const qualificationFlow = ai.defineFlow(
  {
    name: 'qualificationFlow',
    inputSchema: QualificationLeadSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (answers) => {
    try {
      const formattedAnswers = questions.map(q => {
        let answer = (answers as any)[q.key];
        
        // Formata a resposta de serviços de interesse para ser mais legível
        if (q.key === 'interestedServices' && typeof answer === 'object' && answer !== null) {
          answer = Object.values(answer).flat().join(', ');
        }
        
        return {
          pergunta: q.title,
          resposta: answer || 'Não informado',
        };
      }).filter(item => item.resposta !== 'Não informado');

      const contactInfo: Record<string, any> = {};
      contactFields.forEach(field => {
        const answer = (answers as any)[field.key];
        if (answer) {
            contactInfo[field.title] = answer;
        }
      });
      
      const dataToSave = {
          respostas: formattedAnswers,
          contato: contactInfo
      };

      await qualificationService.createQualificationLead(dataToSave);
      return { success: true, message: 'Lead salvo com sucesso no Firestore!' };
    } catch (error: any) {
      console.error("❌ Erro ao salvar lead no Firestore:", error);
      return { success: false, message: "Falha ao salvar as informações do formulário." };
    }
  }
);

export async function submitQualificationForm(
  input: z.infer<typeof QualificationLeadSchema>
): Promise<{ success: boolean; message: string }> {
  return qualificationFlow(input);
}
