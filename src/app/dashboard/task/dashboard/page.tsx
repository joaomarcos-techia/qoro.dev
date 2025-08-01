
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getDashboardMetrics } from '@/ai/flows/task-management';
import { BarChart, CheckCircle, Clock, List, Loader2, ServerCrash } from 'lucide-react';

interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

const MetricCard = ({ title, value, icon: Icon, isLoading, color }: { title: string, value: number, icon: React.ElementType, isLoading: boolean, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-100 flex items-center">
    <div className={`p-3 rounded-xl text-white mr-4 shadow-neumorphism ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      {isLoading ? (
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin mt-1" />
      ) : (
        <p className="text-3xl font-bold text-black">{value}</p>
      )}
    </div>
  </div>
);

export default function DashboardTaskPage() {
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      setError(null);
      getDashboardMetrics({ actor: currentUser.uid })
        .then(setMetrics)
        .catch(err => {
          console.error(err);
          setError('Não foi possível carregar as métricas de tarefas.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentUser]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg p-8 text-center">
          <ServerCrash className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-700">Ocorreu um erro</h3>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total de Tarefas" value={metrics?.totalTasks ?? 0} icon={List} isLoading={isLoading} color="bg-blue-500" />
          <MetricCard title="Concluídas" value={metrics?.completedTasks ?? 0} icon={CheckCircle} isLoading={isLoading} color="bg-green-500" />
          <MetricCard title="Em Progresso" value={metrics?.inProgressTasks ?? 0} icon={Clock} isLoading={isLoading} color="bg-yellow-500" />
          <MetricCard title="Pendentes" value={metrics?.pendingTasks ?? 0} icon={Loader2} isLoading={isLoading} color="bg-gray-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Gráfico de Tarefas */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-100">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center"><BarChart className="w-5 h-5 mr-3 text-primary"/>Distribuição de Tarefas por Status</h3>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
                    <p className="text-gray-400">Componente de Gráfico - Em breve</p>
                </div>
            </div>

            {/* Atividades Recentes */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-100">
                <h3 className="text-lg font-bold text-black mb-4">Atividades Recentes</h3>
                 <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
                    <p className="text-gray-400">Feed de Atividades - Em breve</p>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Dashboard de Tarefas</h1>
        <p className="text-gray-600">
          Acompanhe a produtividade da sua equipe e o andamento dos projetos.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
