
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Esta página foi unificada com a página de Relatórios.
 * Este componente serve apenas como um redirecionamento para a nova
 * página de entrada do módulo Financeiro, garantindo que links antigos não quebrem.
 */
export default function VisaoGeralRedirectPage() {
  useEffect(() => {
    redirect('/dashboard/finance/relatorios');
  }, []);

  // Renderiza um estado de carregamento para evitar um flash de conteúdo vazio.
  return null;
}
