
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QoroFinance | Visão Geral',
};

export default function VisaoGeralPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-black mb-4">Visão Geral</h1>
        <p className="text-gray-600">
          Acompanhe as métricas e a saúde financeira do seu negócio em tempo real.
        </p>
      </div>
    );
  }
