
'use client';

import React, { useMemo } from 'react';

// Função para escapar HTML especial em blocos de código
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Função principal para converter Markdown para HTML
const toHtml = (markdown: string): string => {
  if (!markdown) return '';
  let html = `\n${markdown}\n`;

  // 1. Processar blocos de código ```...```
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]+?)\n```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    const langClass = lang ? `language-${lang}` : '';
    const escapedCode = escapeHtml(code);
    codeBlocks.push(`<pre><code class="code-block${langClass}">${escapedCode}</code></pre>`);
    return `\n__CODE_BLOCK_${index}__\n`;
  });

  // 2. Processar código inline `...`
  const inlineCodeBlocks: string[] = [];
  html = html.replace(/`([^`]+?)`/g, (match, code) => {
    const index = inlineCodeBlocks.length;
    const escapedCode = escapeHtml(code);
    inlineCodeBlocks.push(`<code class="inline-code">${escapedCode}</code>`);
    return `__INLINE_CODE_${index}__`;
  });
  
  // 3. Processar cabeçalhos
  html = html
    .replace(/^\s*#### (.*$)/gim, '<h4 class="text-base font-semibold mt-4 mb-2 text-gray-200">$1</h4>')
    .replace(/^\s*### (.*$)/gim, '<h3 class="text-lg font-semibold mt-5 mb-3 text-gray-100">$1</h3>')
    .replace(/^\s*## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-4 text-white">$1</h2>')
    .replace(/^\s*# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6 text-white border-b border-gray-600 pb-2">$1</h1>');
  
  // 4. Processar Blockquotes
  html = html.replace(/^\s*> (.*$)/gim, '<blockquote class="border-l-4 border-gray-500 pl-4 py-2 my-4 bg-secondary/30 text-gray-300 italic">$1</blockquote>');

  // 5. Processar listas
  html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="flex items-start"><span class="mr-2 mt-1 text-primary">&#8226;</span><span>$1</span></li>');
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="flex items-start"><span class="mr-2 font-semibold text-primary">$S.</span><span>$1</span></li>');

  // Agrupar itens de lista
  html = html.replace(/(<li class="flex items-start"><span class="mr-2 font-semibold text-primary">\$S.<\/span><span>.*?<\/span><\/li>\s*)+/g, (match) => {
      let counter = 1;
      return `<ol class="list-inside space-y-2 my-4 ml-4">${match.replace(/<span class="mr-2 font-semibold text-primary">\$S\.<\/span>/g, () => `<span class="mr-2 font-semibold text-primary">${counter++}.</span>`)}</ol>`;
  });
  html = html.replace(/(<li class="flex items-start"><span class="mr-2 mt-1 text-primary">&#8226;<\/span><span>.*?<\/span><\/li>\s*)+/g, (match) => `<ul class="list-inside space-y-2 my-4 ml-4">${match}</ul>`);

  // 6. Processar linhas horizontais
  html = html.replace(/^\s*---*\s*$/gm, '<hr class="border-border my-6" />');

  // 7. Processar negrito e itálico
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
    .replace(/_(.*?)_/g, '<em class="italic text-gray-300">$1</em>');

  // 8. Envolver o restante em parágrafos
  html = html.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (/^<\/?(h[1-4]|ul|ol|li|blockquote|pre|hr)/.test(trimmed)) {
          return trimmed; // Não envolver tags de bloco em <p>
      }
      return `<p>${trimmed}</p>`;
  }).join('');

  // 9. Restaurar blocos de código
  codeBlocks.forEach((block, index) => {
    html = html.replace(`<p>__CODE_BLOCK_${index}__</p>`, block);
  });
  inlineCodeBlocks.forEach((block, index) => {
    html = html.replace(`__INLINE_CODE_${index}__`, block);
  });

  return html.trim().replace(/<p><\/p>/g, ''); // Limpeza final
};

const useMarkdownHtml = (content: string): string => {
  return useMemo(() => toHtml(content), [content]);
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const htmlContent = useMarkdownHtml(content);

  return (
    <div
      className={`markdown-content prose prose-invert max-w-none ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        '--inline-code-bg': 'hsl(var(--secondary))',
        '--inline-code-color': 'hsl(var(--primary))',
        '--inline-code-padding': '0.125rem 0.375rem',
        '--inline-code-radius': '0.375rem',
        '--code-block-bg': 'hsl(var(--secondary) / 0.5)',
        '--code-block-border': 'hsl(var(--border))',
        '--code-block-padding': '1rem',
        '--code-block-radius': '0.5rem',
      } as React.CSSProperties}
    />
  );
};
