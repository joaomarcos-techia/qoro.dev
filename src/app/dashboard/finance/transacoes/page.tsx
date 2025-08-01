
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QoroFinance | Transações',
};

export default function TransacoesPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-black mb-4">Transações</h1>
        <p className="text-gray-600">
          Gerencie suas contas a pagar e a receber e mantenha tudo organizado.
        </p>
      </div>
    );
  }
