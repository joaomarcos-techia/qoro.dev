
'use client';

import { CustomerProfile } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { User, Building, ChevronLeft, ChevronRight } from 'lucide-react';

interface KanbanCardProps {
  customer: CustomerProfile;
  stageIds: string[];
  onMove: (customerId: string, newStatus: CustomerProfile['status']) => void;
}

export function CustomerKanbanCard({ customer, stageIds, onMove }: KanbanCardProps) {
  
  const currentStageIndex = stageIds.findIndex(id => id === customer.status);

  const handleMove = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' ? currentStageIndex + 1 : currentStageIndex - 1;
    if (newIndex >= 0 && newIndex < stageIds.length) {
        onMove(customer.id, stageIds[newIndex] as CustomerProfile['status']);
    }
  };

  const isTerminalStage = customer.status === 'won' || customer.status === 'lost' || customer.status === 'archived';

  return (
    <div className="bg-card rounded-xl p-4 transition-shadow duration-300 border border-border hover:border-primary/50">
      <h3 className="font-bold text-foreground text-base mb-3 break-words">{customer.name}</h3>
      
      <div className="space-y-2 text-sm text-muted-foreground min-h-[2rem]">
        {customer.company && (
            <div className="flex items-center">
                <Building className="w-4 h-4 mr-2 text-muted-foreground/70 flex-shrink-0" />
                <span className="truncate">{customer.company}</span>
            </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove('prev')} disabled={currentStageIndex <= 0 || isTerminalStage}>
            <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove('next')} disabled={currentStageIndex >= stageIds.length - 1 || isTerminalStage}>
            <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
