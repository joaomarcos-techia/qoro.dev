
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBill, updateBill } from '@/ai/flows/bill-management';
import { listCustomers } from '@/ai/flows/crm-management';
import { listSuppliers } from '@/ai/flows/supplier-management';
import { BillSchema, CustomerProfile, SupplierProfile, BillProfile } from '@/ai/schemas';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, AlertCircle, CalendarIcon, Users, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

type BillFormProps = {
  onAction: () => void;
  bill?: BillProfile | null;
};

const FormSchema = BillSchema.extend({
  dueDate: z.date(),
  paymentDate: z.date().optional().nullable(),
});
type FormValues = z.infer<typeof FormSchema>;

export function BillForm({ onAction, bill }: BillFormProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [isContactPopoverOpen, setIsContactPopoverOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  const isEditMode = !!bill;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });
  
  const billType = watch('type');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchContacts = async () => {
        try {
          const [customersData, suppliersData] = await Promise.all([
            listCustomers({ actor: currentUser.uid }),
            listSuppliers({ actor: currentUser.uid }),
          ]);
          setCustomers(customersData);
          setSuppliers(suppliersData);
        } catch (err) {
          console.error('Failed to load contacts:', err);
          setError('Não foi possível carregar os contatos (clientes/fornecedores).');
        }
      };
      fetchContacts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (bill) {
      reset({
        ...bill,
        dueDate: parseISO(bill.dueDate as unknown as string),
        paymentDate: bill.paymentDate ? parseISO(bill.paymentDate as unknown as string) : null,
      });
    } else {
      reset({
        description: '',
        amount: 0,
        type: 'payable',
        status: 'pending',
        dueDate: new Date(),
        paymentDate: null,
        contactId: undefined,
        contactType: undefined,
      });
    }
  }, [bill, reset]);
  
  const getContactList = () => {
    const list = billType === 'receivable' ? customers : suppliers;
    return list.filter(c => c.name.toLowerCase().includes(contactSearch.toLowerCase()));
  }
  
  const getContactName = (id?: string, type?: 'customer' | 'supplier') => {
      if (!id || !type) return 'Selecione o contato';
      const list = type === 'customer' ? customers : suppliers;
      return list.find(c => c.id === id)?.name || 'Contato não encontrado';
  }

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) return setError('Você precisa estar autenticado.');
    setIsLoading(true);
    setError(null);
    try {
      const submissionData = {
        ...data,
        dueDate: data.dueDate.toISOString(),
        paymentDate: data.paymentDate ? data.paymentDate.toISOString() : null,
      };
      if (isEditMode) {
        await updateBill({ ...submissionData, id: bill.id, actor: currentUser.uid });
      } else {
        await createBill({ ...submissionData, actor: currentUser.uid });
      }
      onAction();
    } catch (err) {
      console.error(err);
      setError(`Falha ao ${isEditMode ? 'atualizar' : 'salvar'} a conta.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição*</Label>
          <Input id="description" {...register('description')} />
          {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Tipo de Conta*</Label>
          <Controller name="type" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="payable">A Pagar</SelectItem>
                <SelectItem value="receivable">A Receber</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)*</Label>
          <Input id="amount" type="number" step="0.01" {...register('amount')} />
          {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
        </div>
        
        <div className="space-y-2">
           <Label>Contato (Opcional)</Label>
            <Popover open={isContactPopoverOpen} onOpenChange={setIsContactPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                        {getContactName(watch('contactId'), watch('contactType'))}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <div className="p-2 border-b">
                        <Input 
                            placeholder={`Buscar ${billType === 'receivable' ? 'cliente' : 'fornecedor'}...`}
                            value={contactSearch}
                            onChange={(e) => setContactSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                        {getContactList().map(contact => (
                            <div key={contact.id} onClick={() => {
                                setValue('contactId', contact.id);
                                setValue('contactType', billType === 'receivable' ? 'customer' : 'supplier');
                                setIsContactPopoverOpen(false);
                            }} className="p-2 hover:bg-accent cursor-pointer text-sm">
                                {contact.name}
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>


        <div className="space-y-2">
          <Label>Status*</Label>
          <Controller name="status" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Paga</SelectItem>
                <SelectItem value="overdue">Atrasada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </div>

        <div className="space-y-2">
          <Label>Data de Vencimento*</Label>
          <Controller name="dueDate" control={control} render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
            </Popover>
          )} />
        </div>
        
        <div className="space-y-2">
          <Label>Data de Pagamento</Label>
          <Controller name="paymentDate" control={control} render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} /></PopoverContent>
            </Popover>
          )} />
        </div>

      </div>
      {error && <div className="bg-destructive/20 text-destructive-foreground p-4 rounded-lg flex items-center mt-4"><AlertCircle className="w-5 h-5 mr-3" /><span className="text-sm">{error}</span></div>}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 border border-transparent hover:border-primary/50 flex items-center justify-center font-semibold disabled:opacity-75 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : null}
          {isLoading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Conta')}
        </Button>
      </div>
    </form>
  );
}
