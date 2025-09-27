
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Usaremos um hook simples para "buscar" o conteúdo do markdown.
const useMarkdownContent = (filePath: string) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(filePath)
      .then(response => response.text())
      .then(text => {
        // Simula a conversão de markdown para HTML (simplificada)
        const html = text
          .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>')
          .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-4">$1</h2>')
          .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-5 mb-3">$1</h3>')
          .replace(/\n/g, '<br />'); // Substituição simples para parágrafos
        setContent(html);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching markdown file:", error);
        setContent('<p>Não foi possível carregar o documento.</p>');
        setLoading(false);
      });
  }, [filePath]);

  return { content, loading };
};


export default function PrivacyPolicyPage() {
    const { content, loading } = useMarkdownContent('/politica.md');

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
            <Link href="/" className="inline-flex items-center text-primary hover:text-primary/90 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para a página inicial
            </Link>
        </div>
        <article className="prose prose-invert prose-lg max-w-none">
            {loading ? (
                <p>Carregando...</p>
            ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
        </article>
      </div>
    </div>
  );
}
