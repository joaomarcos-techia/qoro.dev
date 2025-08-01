
import type { Metadata } from 'next';
import { LayoutGrid } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QoroTask | Projetos',
};

export default function ProjetosPage() {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                 <h1 className="text-3xl font-bold text-black">Projetos</h1>
                <p className="text-gray-600">
                Crie e gerencie projetos, definindo milestones e acompanhando o progresso.
                </p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
            <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed">
                <LayoutGrid className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-black">Gestão de Projetos em Breve</h3>
                <p className="text-gray-500 mt-2">Organize suas tarefas em projetos com milestones e acompanhamento de progresso.</p>
            </div>
        </div>
      </div>
    );
  }
