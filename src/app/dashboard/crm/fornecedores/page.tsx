
'use client';

import { useState } from 'react';
import { PlusCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupplierTable } from '@/components/dashboard/crm/SupplierTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SupplierForm } from '@/components/dashboard/crm/SupplierForm';

export default function FornecedoresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleSupplierCreated = () => {
    setIsModalOpen(false);
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie sua base de fornecedores e parceiros de negócio.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-300 border border-transparent hover:border-primary/50 flex items-center justify-center font-semibold"
            >
              <PlusCircle className="mr-2 w-5 h-5" />
              Adicionar Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">Adicionar Novo Fornecedor</DialogTitle>
              <DialogDescription>
                Preencha as informações para cadastrar um novo fornecedor.
              </DialogDescription>
            </DialogHeader>
            <SupplierForm onSupplierCreated={handleSupplierCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card p-6 rounded-2xl border-border">
        <SupplierTable key={refreshCounter} />
      </div>
    </div>
  );
}
