
'use client';

import { useState } from 'react';
import { PlusCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaleLeadTable } from '@/components/dashboard/crm/SaleLeadTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SaleLeadForm } from '@/components/dashboard/crm/SaleLeadForm';
import { SaleLeadProfile } from '@/ai/schemas';

export default function OportunidadesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<SaleLeadProfile | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const triggerRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
        setSelectedLead(null);
    }
  }

  const handleAction = () => {
    handleModalOpenChange(false);
    triggerRefresh();
  };
  
  const handleEdit = (lead: SaleLeadProfile) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Oportunidades de Venda</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas negociações em andamento.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleAdd}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-300 border border-transparent hover:border-primary/50 flex items-center justify-center font-semibold"
            >
              <PlusCircle className="mr-2 w-5 h-5" />
              Criar Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">{selectedLead ? 'Editar Oportunidade' : 'Criar Nova Oportunidade'}</DialogTitle>
              <DialogDescription>
                 {selectedLead ? 'Altere as informações da negociação abaixo.' : 'Preencha as informações da negociação para acompanhá-la no funil.'}
              </DialogDescription>
            </DialogHeader>
            <SaleLeadForm onAction={handleAction} saleLead={selectedLead}/>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card p-6 rounded-2xl border-border">
        <SaleLeadTable key={refreshCounter} onEdit={handleEdit} onRefresh={triggerRefresh} />
      </div>
    </div>
  );
}
