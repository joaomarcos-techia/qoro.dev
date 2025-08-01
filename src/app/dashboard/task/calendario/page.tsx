
import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QoroTask | Calendário',
};

export default function CalendarioPage() {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-black">Calendário</h1>
                <p className="text-gray-600">
                Visualize as datas de entrega de tarefas e projetos em um único lugar.
                </p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
            <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed">
                <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-black">Visualização em Calendário em Breve</h3>
                <p className="text-gray-500 mt-2">Acompanhe seus prazos de forma visual e integrada.</p>
            </div>
        </div>
      </div>
    );
  }
