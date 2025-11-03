
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface LegalPopupProps {
  content: 'terms' | 'policy' | null;
  onOpenChange: (isOpen: boolean) => void;
}

const documents = {
  terms: {
    title: 'Termos e Condições de Uso',
    description: 'Leia nossos termos e condições de uso para entender seus direitos e obrigações.',
    filePath: '/terms.md',
  },
  policy: {
    title: 'Política de Privacidade',
    description: 'Entenda como coletamos, usamos e protegemos seus dados pessoais.',
    filePath: '/politica.md',
  },
};

const useMarkdownContent = (filePath: string) => {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filePath) return;
    setLoading(true);
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Falha ao carregar o documento.');
        }
        return response.text();
      })
      .then(text => {
        const lines = text.split('\n');
        let htmlContent = '';
        let inList = false;

        lines.forEach(line => {
          line = line.trim();
          
          if (line.startsWith('### ')) {
            if (inList) { htmlContent += '</ul>'; inList = false; }
            htmlContent += `<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-200">${line.substring(4)}</h3>`;
          } else if (line.startsWith('## ')) {
            if (inList) { htmlContent += '</ul>'; inList = false; }
            htmlContent += `<h2 class="text-xl font-bold mt-5 mb-3 text-gray-100">${line.substring(3)}</h2>`;
          } else if (line.startsWith('# ')) {
            if (inList) { htmlContent += '</ul>'; inList = false; }
            htmlContent += `<h1 class="text-2xl font-bold mt-6 mb-4 text-white">${line.substring(2)}</h1>`;
          } else if (line.startsWith('* ')) {
            if (!inList) { htmlContent += '<ul class="space-y-2 my-4 list-disc pl-5">'; inList = true; }
            htmlContent += `<li>${line.substring(2)}</li>`;
          } else if (line === '') {
            if (inList) { htmlContent += '</ul>'; inList = false; }
          } else {
            if (inList) { htmlContent += '</ul>'; inList = false; }
            htmlContent += `<p class="text-gray-400 leading-relaxed my-4">${line}</p>`;
          }
        });

        if (inList) {
          htmlContent += '</ul>';
        }
        
        setHtml(htmlContent);
      })
      .catch(error => {
        console.error("Error fetching markdown file:", error);
        setHtml('<p class="text-destructive">Não foi possível carregar o documento.</p>');
      })
      .finally(() => setLoading(false));
  }, [filePath]);

  return { html, loading };
};


export function LegalPopup({ content, onOpenChange }: LegalPopupProps) {
  const docInfo = content ? documents[content] : null;
  const { html, loading } = useMarkdownContent(docInfo?.filePath || '');
  
  return (
    <Dialog open={!!content} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">{docInfo?.title || 'Carregando...'}</DialogTitle>
           {docInfo?.description && (
             <DialogDescription>{docInfo.description}</DialogDescription>
           )}
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
