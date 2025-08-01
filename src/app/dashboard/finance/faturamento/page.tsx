
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QoroFinance | Faturamento',
};

export default function FaturamentoPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-black mb-4">Faturamento</h1>
        <p className="text-gray-600">
          Crie, envie e gerencie suas faturas e notas fiscais de forma simples.
        </p>
      </div>
    );
  }
