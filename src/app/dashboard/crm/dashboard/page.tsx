'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Esta página foi removida funcionalmente.
 * Este componente serve apenas como um redirecionamento para a nova
 * página de entrada do módulo CRM, garantindo que links antigos não quebrem.
 */
export default function CrmDashboardRedirectPage() {
  useEffect(() => {
    redirect('/dashboard/crm/clientes');
  }, []);

  // Renderiza um estado de carregamento para evitar um flash de conteúdo vazio.
  return null;
}
