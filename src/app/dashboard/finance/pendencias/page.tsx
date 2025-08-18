
'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BillTable } from '@/components/dashboard/finance/BillTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BillForm } from '@/components/dashboard/finance/BillForm';
import { BillProfile } from '@/ai/schemas';

export default function PendenciasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBill, setSelectedBill] = useState<BillProfile | null>(null);

  const handleAction = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleEditBill = (bill: BillProfile) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };
  
  const handleAddBill = () => {
    setSelectedBill(null);
    setIsModalOpen(true);
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Pendências</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas a pagar e a receber.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
                onClick={handleAddBill}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-300 border border-transparent hover:border-primary/50 flex items-center justify-center font-semibold"
            >
              <PlusCircle className="mr-2 w-5 h-5" />
              Adicionar Pendência
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">{selectedBill ? 'Editar Pendência' : 'Adicionar Nova Pendência'}</DialogTitle>
              <DialogDescription>
                Preencha as informações para registrar uma nova pendência financeira.
              </DialogDescription>
            </DialogHeader>
            <BillForm onAction={handleAction} bill={selectedBill} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card p-6 rounded-2xl border-border">
        <BillTable key={refreshKey} onEdit={handleEditBill} />
      </div>
    </div>
  );
}
