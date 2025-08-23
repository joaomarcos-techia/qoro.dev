
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Esta página foi unificada com a página de Progresso (Kanban).
 * Este componente serve apenas como um redirecionamento para a nova
 * página de entrada do módulo Task, garantindo que links antigos não quebrem.
 */
export default function MinhaListaRedirectPage() {
  useEffect(() => {
    redirect('/dashboard/task/tarefas');
  }, []);

  // Renderiza um estado de carregamento para evitar um flash de conteúdo vazio.
  return null;
}
