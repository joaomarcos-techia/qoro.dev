
'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteTable } from '@/components/dashboard/crm/QuoteTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuoteForm } from '@/components/dashboard/crm/QuoteForm';

export default function OrcamentosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleQuoteAction = () => {
    setIsModalOpen(false);
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">
            Crie, envie e gerencie propostas comerciais para seus clientes.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-crm-primary text-black px-4 py-2 rounded-xl hover:bg-crm-primary/90 transition-all duration-300 border border-transparent hover:border-crm-primary/50 flex items-center justify-center font-semibold w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 w-5 h-5" />
              Criar orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">Criar novo orçamento</DialogTitle>
              <DialogDescription>
                Selecione o cliente, adicione os itens e defina os termos.
              </DialogDescription>
            </DialogHeader>
            <QuoteForm onQuoteAction={handleQuoteAction} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-2xl border-border">
        <QuoteTable key={refreshCounter} />
      </div>
    </div>
  );
}
