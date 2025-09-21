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
  let html = markdown;

  // Preservar blocos de código antes de outras transformações
  const codeBlocks: string[] = [];
  const inlineCodeBlocks: string[] = [];
  
  // Blocos de código com ``` (com detecção opcional de linguagem)
  html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    const langClass = lang ? ` language-${lang}` : '';
    codeBlocks.push(`<pre><code class="code-block${langClass}">${escapeHtml(code.trim())}</code></pre>`);
    return `__CODE_BLOCK_${index}__`;
  });

  // Código inline com `
  html = html.replace(/`([^`\n]+)`/g, (match, code) => {
    const index = inlineCodeBlocks.length;
    inlineCodeBlocks.push(`<code class="inline-code">${escapeHtml(code)}</code>`);
    return `__INLINE_CODE_${index}__`;
  });

  // Headers com hierarquia adequada para IA conversacional
  // H1: Títulos principais de seções importantes
  // H2: Subtítulos de seções 
  // H3: Subsecções
  // H4: Detalhes específicos
  html = html
    .replace(/^#### (.*$)/gim, '<h4 class="text-base font-semibold mt-4 mb-2 text-gray-200">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-5 mb-3 text-gray-100">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-4 text-white">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6 text-white border-b border-gray-600 pb-2">$1</h1>');

  // Formatação de texto (ordem específica para evitar conflitos)
  // Negrito (**texto** ou __texto__)
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="font-semibold text-white">$1</strong>');
  
  // Itálico (*texto* ou _texto_) - regex mais precisa para evitar conflitos
  html = html
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic text-gray-300">$1</em>')
    .replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em class="italic text-gray-300">$1</em>');

  // Texto riscado (~~texto~~)
  html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-gray-400">$1</del>');

  // Listas ordenadas (1. item)
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<oli data-number="$1">$2</oli>');
  
  // Listas não ordenadas (- item, * item, + item)
  html = html.replace(/^\s*[\*\-\+]\s+(.*$)/gim, '<uli>$1</uli>');

  // Agrupar listas ordenadas
  html = html.replace(/(<oli.*?>.*?<\/oli>(\n|$))+/g, (match) => {
    const items = match.match(/<oli.*?>(.*?)<\/oli>/g) || [];
    const listItems = items.map(item => {
      const content = item.replace(/<oli.*?>(.*?)<\/oli>/, '$1');
      return `<li class="mb-1 text-gray-300">${content.trim()}</li>`;
    }).join('');
    return `<ol class="list-decimal list-inside space-y-1 my-4 ml-4 text-gray-300">${listItems}</ol>`;
  });

  // Agrupar listas não ordenadas
  html = html.replace(/(<uli>.*?<\/uli>(\n|$))+/g, (match) => {
    const items = match.match(/<uli>(.*?)<\/uli>/g) || [];
    const listItems = items.map(item => {
      const content = item.replace(/<uli>(.*?)<\/uli>/, '$1');
      return `<li class="mb-1 text-gray-300">${content.trim()}</li>`;
    }).join('');
    return `<ul class="list-disc list-inside space-y-1 my-4 ml-4 text-gray-300">${listItems}</ul>`;
  });

  // Blockquotes para citações (> texto)
  html = html.replace(/^>\s+(.*$)/gim, '<bquote>$1</bquote>');
  html = html.replace(/(<bquote>.*?<\/bquote>(\n|$))+/g, (match) => {
    const content = match.replace(/<\/?bquote>/g, '').trim();
    return `<blockquote class="border-l-4 border-gray-500 pl-4 py-2 my-4 bg-gray-800/30 text-gray-300 italic">${content}</blockquote>`;
  });

  // Linha horizontal (---)
  html = html.replace(/^---+$/gim, '<hr class="border-gray-600 my-6" />');

  // Processar parágrafos
  const sections = html.split(/\n\s*\n/);
  html = sections.map(section => {
    const trimmed = section.trim();
    
    // Não envolver em <p> se já é um elemento de bloco
    if (trimmed.match(/^<(h[1-4]|ul|ol|blockquote|pre|hr)/)) {
      return trimmed;
    }
    
    // Não processar seções vazias
    if (!trimmed) {
      return '';
    }
    
    return `<p class="mb-4 text-gray-300 leading-relaxed">${trimmed}</p>`;
  }).filter(section => section).join('\n\n');

  // Converter quebras de linha simples em <br> apenas dentro de parágrafos
  html = html.replace(/<p class="[^"]*">(.*?)<\/p>/gs, (match, content) => {
    const processedContent = content.replace(/\n/g, '<br />');
    return match.replace(content, processedContent);
  });

  // Restaurar blocos de código
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block);
  });
  
  inlineCodeBlocks.forEach((block, index) => {
    html = html.replace(`__INLINE_CODE_${index}__`, block);
  });

  return html;
};

// Hook personalizado para memoização
const useMarkdownHtml = (content: string): string => {
  return useMemo(() => toHtml(content), [content]);
};

// Componente React principal
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = ""
}) => {
  const htmlContent = useMarkdownHtml(content);

  return (
    <div
      className={`markdown-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        // Estilos CSS personalizados para elementos que precisam de estilização especial
        // Código inline
        '--inline-code-bg': 'rgb(55, 65, 81)',
        '--inline-code-color': 'rgb(251, 191, 36)',
        '--inline-code-padding': '0.125rem 0.375rem',
        '--inline-code-radius': '0.25rem',
        '--inline-code-font': 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
        
        // Blocos de código
        '--code-block-bg': 'rgb(17, 24, 39)',
        '--code-block-border': 'rgb(55, 65, 81)',
        '--code-block-padding': '1rem',
        '--code-block-radius': '0.5rem',
      } as React.CSSProperties}
    />
  );
};

// CSS adicional que pode ser incluído globalmente
export const markdownStyles = `
.markdown-content .inline-code {
  background-color: var(--inline-code-bg);
  color: var(--inline-code-color);
  padding: var(--inline-code-padding);
  border-radius: var(--inline-code-radius);
  font-family: var(--inline-code-font);
  font-size: 0.875em;
  font-weight: 500;
}

.markdown-content .code-block {
  background-color: var(--code-block-bg);
  border: 1px solid var(--code-block-border);
  padding: var(--code-block-padding);
  border-radius: var(--code-block-radius);
  font-family: var(--code-block-font);
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgb(229, 231, 235);
  overflow-x: auto;
  white-space: pre;
}

.markdown-content pre {
  margin: 1.5rem 0;
  background-color: var(--code-block-bg);
  border-radius: var(--code-block-radius);
  border: 1px solid var(--code-block-border);
}
`;

// Export da função para uso independente
export { toHtml, useMarkdownHtml };
