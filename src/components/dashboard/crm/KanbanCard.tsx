'use client';

import { CustomerProfile } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Mail, Phone, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface KanbanCardProps {
  customer: CustomerProfile;
}

export function KanbanCard({ customer }: KanbanCardProps) {
  
  const handleMove = (direction: 'prev' | 'next') => {
    // Placeholder for moving logic
    alert(`Mover ${customer.name} para ${direction === 'next' ? 'próxima' : 'anterior'} fase.`);
  };

  const handleDelete = () => {
    // Placeholder for delete logic
    alert(`Remover ${customer.name} do funil.`);
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-neumorphism hover:shadow-neumorphism-hover transition-shadow duration-300 border border-gray-100">
      <h3 className="font-bold text-black text-base mb-3 break-words">{customer.name}</h3>
      
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
        </div>
         {customer.phone && (
            <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{customer.phone}</span>
            </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove('prev')}>
                <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove('next')}>
            <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
