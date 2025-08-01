
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QoroFinance | Contas',
};

export default function ContasPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-black mb-4">Contas</h1>
        <p className="text-gray-600">
          Gerencie suas contas bancárias e veja o balanço de cada uma.
        </p>
      </div>
    );
  }
