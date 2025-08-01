import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QoroCRM | Produtos',
};

export default function ProdutosPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-black mb-4">Produtos</h1>
        <p className="text-gray-600">
          Cadastre e gerencie os produtos que sua empresa vende.
        </p>
      </div>
    );
  }
