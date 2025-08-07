'use client';
import { useEffect, useMemo, useState } from 'react';
import { KanbanBoard } from '@/components/dashboard/crm/KanbanBoard';
import { CustomerProfile } from '@/ai/schemas';
import { listCustomers } from '@/ai/flows/crm-management';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, ServerCrash } from 'lucide-react';

export default function FunilPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
        setCustomers([]);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      setError(null);
      listCustomers({ actor: currentUser.uid })
        .then(setCustomers)
        .catch((err) => {
          console.error(err);
          setError('Não foi possível carregar os clientes do funil.');
        })
        .finally(() => setIsLoading(false));
    } else if (!auth.currentUser) {
      setIsLoading(false);
    }
  }, [currentUser]);

  const columns = useMemo(() => {
    const stageOrder: CustomerProfile['status'][] = [
      'new',
      'initial_contact',
      'qualification',
      'proposal',
      'negotiation',
      'won',
      'lost'
    ];
    
    const stageNames: Record<string, string> = {
        new: 'Novo / Lead Recebido',
        initial_contact: 'Contato Inicial',
        qualification: 'Qualificação / Diagnóstico',
        proposal: 'Apresentação / Proposta',
        negotiation: 'Negociação',
        won: 'Ganho (Fechamento)',
        lost: 'Perdido'
    };

    const columns = stageOrder.map((stage) => ({
      id: stage,
      title: stageNames[stage],
      customers: customers.filter((customer) => customer.status === stage),
    }));

    return columns;
  }, [customers]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="mt-4 text-gray-600">Carregando funil de clientes...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg p-8 text-center">
          <ServerCrash className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-700">Ocorreu um erro</h3>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      );
    }

    return <KanbanBoard columns={columns} />;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Funil de Clientes</h1>
          <p className="text-gray-600">
            Visualize e gerencie a jornada dos seus clientes pelas fases de negociação.
          </p>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
