
import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QoroCRM | Relatórios',
};

export default function RelatoriosPage() {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-black">Relatórios do CRM</h1>
                <p className="text-gray-600">
                Analise o desempenho de suas vendas, clientes e atividades.
                </p>
            </div>
        </div>
         <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
            <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed">
                <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-black">Relatórios Avançados em Breve</h3>
                <p className="text-gray-500 mt-2">Estamos preparando visualizações detalhadas para seus dados.</p>
            </div>
        </div>
      </div>
    );
  }
