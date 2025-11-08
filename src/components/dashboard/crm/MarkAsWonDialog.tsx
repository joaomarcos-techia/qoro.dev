
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { QuoteProfile } from '@/ai/schemas';
import { markQuoteAsWon } from '@/ai/flows/crm-management';

interface MarkAsWonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  quote: QuoteProfile;
  actorUid: string;
  onSuccess: () => void;
}

export function MarkAsWonDialog({ isOpen, onOpenChange, quote, actorUid, onSuccess }: MarkAsWonDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // The accountId is now part of the quote object, so we don't need to select it here.
      await markQuoteAsWon({
        quoteId: quote.id,
        actor: actorUid,
        accountId: quote.accountId,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha ao converter o orçamento em transação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar orçamento ganho?</DialogTitle>
          <DialogDescription>
            Isto irá marcar o orçamento como 'Ganho' e criar a transação de recebimento na conta financeira associada. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className='p-4 bg-secondary rounded-lg border border-border'>
            <p className='text-sm text-muted-foreground'>Orçamento: <span className='font-bold text-foreground'>{quote.number}</span></p>
            <p className='text-sm text-muted-foreground'>Cliente: <span className='font-bold text-foreground'>{quote.customerName}</span></p>
            <p className='text-sm text-muted-foreground'>Valor: <span className='font-bold text-foreground'>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total)}</span></p>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-center text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar e criar transação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
