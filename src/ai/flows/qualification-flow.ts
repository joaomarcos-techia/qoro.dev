'use server';
/**
 * @fileOverview Flow for handling the qualification form submission and sending an email.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as nodemailer from 'nodemailer';

// Define the schema for the form data
const QualificationFormSchema = z.record(z.any());

function formatAnswersToHtml(answers: Record<string, any>): string {
    let html = `
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            h1 { color: #8A2BE2; }
            h2 { color: #4F4F4F; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;}
            p { margin: 5px 0; }
            strong { color: #555; }
        </style>
        <div class="container">
            <h1>🚀 Novo Lead Qualificado Recebido!</h1>
            <p>Um novo lead preencheu o formulário de qualificação. Aqui estão os detalhes:</p>
    `;

    const questionMap: Record<string, string> = {
        fullName: "Nome Completo",
        role: "Cargo",
        email: "E-mail de Contato",
        companySize: "Tamanho da empresa",
        inefficientProcesses: "Processos que consomem tempo",
        currentTools: "Ferramentas atuais",
        urgency: "Nível de prioridade",
        interestedServices: "Serviços de interesse",
        investmentRange: "Faixa de investimento",
        desiredOutcome: "O que gostaria de alcançar",
    };

    for (const key in questionMap) {
        if (answers[key]) {
            const label = questionMap[key];
            let value = answers[key];
            
            html += `<h2>${label}</h2>`;

            if (typeof value === 'object' && !Array.isArray(value)) {
                 let servicesHtml = '<ul>';
                 for (const category in value) {
                     if (value[category].length > 0) {
                        servicesHtml += `<li><strong>${category}:</strong> ${value[category].join(', ')}</li>`;
                     }
                 }
                 servicesHtml += '</ul>';
                 html += servicesHtml;
            } else {
                html += `<p>${value}</p>`;
            }
        }
    }

    html += `</div>`;
    return html;
}

const qualificationFlow = ai.defineFlow(
  {
    name: 'qualificationFlow',
    inputSchema: QualificationFormSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (answers) => {
    const { SMTP_USER, SMTP_PASS, QUALIFICATION_FORM_RECIPIENT_EMAIL } = process.env;

    if (!SMTP_USER || !SMTP_PASS || !QUALIFICATION_FORM_RECIPIENT_EMAIL) {
      console.error("Credenciais SMTP ou e-mail do destinatário não configurados nas variáveis de ambiente.");
      throw new Error("Erro de configuração do servidor. Não foi possível enviar o e-mail.");
    }
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const emailHtml = formatAnswersToHtml(answers);
    const leadName = answers.fullName || 'Novo Lead';

    const mailOptions = {
      from: `"Qoro Leads" <${SMTP_USER}>`,
      to: QUALIFICATION_FORM_RECIPIENT_EMAIL,
      subject: `🚀 Novo Lead Qualificado: ${leadName}`,
      html: emailHtml,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, message: 'E-mail enviado com sucesso!' };
    } catch (error) {
      console.error("Erro ao enviar e-mail com nodemailer:", error);
      throw new Error("Falha ao enviar o e-mail de qualificação.");
    }
  }
);

export async function submitQualificationForm(
  input: z.infer<typeof QualificationFormSchema>
): Promise<{ success: boolean; message: string }> {
  return qualificationFlow(input);
}
