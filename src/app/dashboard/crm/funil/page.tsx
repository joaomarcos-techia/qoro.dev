import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QoroCRM | Funil de Vendas',
};

export default function FunilPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-black mb-4">Funil de Vendas</h1>
        <p className="text-gray-600">
          Visualize e gerencie seu funil de vendas no estilo Kanban.
        </p>
      </div>
    );
  }
