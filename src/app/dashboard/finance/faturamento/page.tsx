
import type { Metadata } from 'next';
import { Receipt } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QoroFinance | Faturamento',
};

export default function FaturamentoPage() {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-black">Faturamento</h1>
                <p className="text-gray-600">
                  Crie, envie e gerencie suas faturas e notas fiscais de forma simples.
                </p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
            <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed">
                <Receipt className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-black">Gestão de Faturamento em Breve</h3>
                <p className="text-gray-500 mt-2">Emita e controle faturas de forma integrada aos seus orçamentos e clientes.</p>
            </div>
        </div>
      </div>
    );
  }
