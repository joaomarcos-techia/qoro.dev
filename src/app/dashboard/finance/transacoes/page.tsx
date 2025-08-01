'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionTable } from '@/components/dashboard/finance/TransactionTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TransactionForm } from '@/components/dashboard/finance/TransactionForm';

export default function TransacoesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);

    const handleTransactionCreated = () => {
      setIsModalOpen(false);
      setRefreshCounter(prev => prev + 1);
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                 <h1 className="text-3xl font-bold text-black">Transações</h1>
                <p className="text-gray-600">
                  Gerencie suas contas a pagar e a receber e mantenha tudo organizado.
                </p>
            </div>
             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button 
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover flex items-center justify-center font-semibold"
                    >
                    <PlusCircle className="mr-2 w-5 h-5" />
                    Adicionar Transação
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-black">Registrar Nova Transação</DialogTitle>
                        <DialogDescription>
                            Preencha as informações para registrar uma nova movimentação financeira.
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionForm onTransactionCreated={handleTransactionCreated} />
                </DialogContent>
            </Dialog>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
            <TransactionTable key={refreshCounter} />
        </div>
      </div>
    );
  }
