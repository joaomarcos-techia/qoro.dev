
'use client';
import { BarChart, DollarSign, ArrowUp, ArrowDown, Landmark, LineChart, PieChart } from 'lucide-react';
import type { Metadata } from 'next';

const MetricCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType, color: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-100 flex items-center">
        <div className={`p-3 rounded-xl text-white mr-4 shadow-neumorphism ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-black">{value}</p>
        </div>
    </div>
);


export default function VisaoGeralPage() {
    return (
      <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">Visão Geral Financeira</h1>
            <p className="text-gray-600">
                Acompanhe as métricas e a saúde financeira do seu negócio em tempo real.
            </p>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Receita Total (Mês)" value="R$ 0,00" icon={ArrowUp} color="bg-green-500" />
            <MetricCard title="Despesa Total (Mês)" value="R$ 0,00" icon={ArrowDown} color="bg-red-500" />
            <MetricCard title="Lucro Líquido (Mês)" value="R$ 0,00" icon={DollarSign} color="bg-blue-500" />
            <MetricCard title="Saldo em Contas" value="R$ 0,00" icon={Landmark} color="bg-yellow-500" />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-100">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center"><LineChart className="w-5 h-5 mr-3 text-primary"/>Fluxo de Caixa Mensal</h3>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
                    <p className="text-gray-400">Componente de Gráfico - Em breve</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-100">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center"><PieChart className="w-5 h-5 mr-3 text-primary"/>Composição de Despesas</h3>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
                    <p className="text-gray-400">Componente de Gráfico - Em breve</p>
                </div>
            </div>
        </div>

      </div>
    );
  }
