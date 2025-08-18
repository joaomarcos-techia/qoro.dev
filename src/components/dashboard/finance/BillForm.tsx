
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
import { createBill, updateBill } from '@/ai/flows/finance-management';
import { listCustomers } from '@/ai/flows/crm-management';
import { listSuppliers } from '@/ai/flows/supplier-management';
import { BillSchema, BillProfile, CustomerProfile, SupplierProfile } from '@/ai/schemas';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, AlertCircle, CalendarIcon, User, Truck } from 'lucide-react';
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
    // When bill type changes, clear the contactId field
    setValue('contactId', '');
  }, [billType, setValue]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchDependencies = useCallback(async (user: FirebaseUser) => {
    try {
        const [customersData, suppliersData] = await Promise.all([
            listCustomers({ actor: user.uid }),
            listSuppliers({ actor: user.uid })
        ]);
        setCustomers(customersData);
        setSuppliers(suppliersData);
    } catch (err) {
         console.error("Failed to load customers or suppliers", err);
         setError("Não foi possível carregar os dados necessários. Tente novamente.");
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
        fetchDependencies(currentUser);
    }
  }, [currentUser, fetchDependencies]);

  useEffect(() => {
    if (bill) {
        reset({ 
            ...bill, 
            dueDate: parseISO(bill.dueDate as unknown as string),
            paymentDate: bill.paymentDate ? parseISO(bill.paymentDate as unknown as string) : null,
        });
    } else {
        reset({
            type: 'payable',
            status: 'pending',
            dueDate: new Date(),
            description: '',
            amount: 0,
            contactId: '',
        });
    }
  }, [bill, reset]);


  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      setError('Você precisa estar autenticado para executar esta ação.');
      return;
    }
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
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} a pendência. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const contactList = billType === 'receivable' ? customers : suppliers;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição*</Label>
          <Input id="description" {...register('description')} placeholder="Ex: Pagamento de aluguel, Venda de serviço" />
          {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
            <Label>Tipo de Pendência*</Label>
            <Controller name="type" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="payable">A Pagar</SelectItem>
                        <SelectItem value="receivable">A Receber</SelectItem>
                    </SelectContent>
                </Select>
            )}/>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)*</Label>
          <Input id="amount" type="number" step="0.01" {...register('amount')} placeholder="0.00" />
          {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
            <Label>{billType === 'receivable' ? 'Cliente' : 'Fornecedor'}*</Label>
             <Controller
                name="contactId"
                control={control}
                render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder={`Selecione um ${billType === 'receivable' ? 'cliente' : 'fornecedor'}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {contactList.map(contact => (
                            <SelectItem key={contact.id} value={contact.id}>
                                <span className='flex items-center'>
                                    {billType === 'receivable' ? <User className="w-4 h-4 mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                                    {contact.name}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                )}
            />
             {errors.contactId && <p className="text-destructive text-sm">{errors.contactId.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dueDate">Data de Vencimento*</Label>
          <Controller name="dueDate" control={control} render={({ field }) => (
            <Popover>
                <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} initialFocus /></PopoverContent>
            </Popover>
          )}/>
           {errors.dueDate && <p className="text-destructive text-sm">{errors.dueDate.message}</p>}
        </div>

         <div className="space-y-2">
          <Label>Status*</Label>
          <Controller name="status" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
            </Select>
          )}/>
        </div>
      </div>

       {error && (
            <div className="bg-destructive/20 text-destructive-foreground p-4 rounded-lg flex items-center mt-4">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span className="text-sm">{error}</span>
            </div>
        )}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 border border-transparent hover:border-primary/50 flex items-center justify-center font-semibold disabled:opacity-75 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : null}
          {isLoading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Pendência')}
        </Button>
      </div>
    </form>
  );
}
