
'use client';

import { useEffect } from 'react';

// Este componente é um workaround para suprimir avisos de depreciação específicos
// gerados pela biblioteca 'recharts' em relação ao uso de 'defaultProps' em
// componentes funcionais, como XAxis e YAxis. O React planeja remover o suporte
// a defaultProps em uma futura versão principal, e a 'recharts' ainda não
// atualizou seu código. Este wrapper intercepta e silencia esses avisos específicos
// para manter o console limpo, sem suprimir outros erros potencialmente importantes.

export const SuppressRechartsWarning = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args) => {
      if (typeof args[0] === 'string' && /defaultProps/.test(args[0])) {
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return <>{children}</>;
};
