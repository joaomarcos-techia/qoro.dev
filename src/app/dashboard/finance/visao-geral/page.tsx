
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Esta página foi unificada com a página de Relatórios e posteriormente removida.
 * Este componente serve apenas como um redirecionamento para a nova
 * página de entrada do módulo Financeiro (Transações), garantindo que links antigos não quebrem.
 */
export default function VisaoGeralRedirectPage() {
  useEffect(() => {
    redirect('/dashboard/finance/transacoes');
  }, []);

  // Renderiza um estado de carregamento para evitar um flash de conteúdo vazio.
  return (
    <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
