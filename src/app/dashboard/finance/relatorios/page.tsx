
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getFinanceDashboardMetrics } from '@/ai/flows/finance-management';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, BarChart, Bar } from '@/components/ui/chart';
import CustomXAxis from '@/components/utils/CustomXAxis';
import CustomYAxis from '@/components/utils/CustomYAxis';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Loader2, ServerCrash, Scale } from 'lucide-react';
import { DateRangePicker } from '@/components/utils/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';

interface FinanceMetrics {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
}

const formatCurrency = (value: number) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const MetricCard = ({ title, value, icon: Icon, isLoading, colorClass }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean, colorClass?: string }) => (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`w-5 h-5 ${colorClass || 'text-finance-primary'}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="w-7 h-7 text-muted-foreground animate-spin mt-1" />
        ) : (
          <div className="text-3xl font-bold text-foreground">{value}</div>
        )}
      </CardContent>
    </Card>
);

export default function RelatoriosFinanceirosPage() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setInitialLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
        setIsLoading(true);
        setError(null);
        getFinanceDashboardMetrics({ 
            actor: currentUser.uid,
            dateRange: {
                from: dateRange?.from?.toISOString(),
                to: dateRange?.to?.toISOString()
            }
        })
            .then(setMetrics)
            .catch((err) => {
                console.error("Erro ao buscar métricas financeiras:", err);
                setError('Não foi possível carregar os dados dos relatórios.');
            })
            .finally(() => {
              setIsLoading(false);
              setInitialLoading(false);
            });
    }
  }, [currentUser, dateRange]);

  const chartData = [
    { name: 'Receitas', value: metrics?.totalIncome ?? 0, fill: 'hsl(var(--crm-primary))' },
    { name: 'Despesas', value: metrics?.totalExpense ?? 0, fill: 'hsl(var(--destructive))' },
  ];

  const renderContent = () => {
    if (initialLoading) { // Full page loader only on initial load
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
            <Loader2 className="w-12 h-12 text-finance-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Gerando seus relatórios financeiros...</p>
          </div>
        );
    }  
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-destructive/10 rounded-lg p-8 text-center border border-destructive">
          <ServerCrash className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-destructive">Ocorreu um erro</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      );
    }
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Saldo Total em Contas" value={formatCurrency(metrics?.totalBalance ?? 0)} icon={Wallet} isLoading={isLoading} />
                <MetricCard title="Receitas no Período" value={formatCurrency(metrics?.totalIncome ?? 0)} icon={TrendingUp} isLoading={isLoading} colorClass="text-green-400"/>
                <MetricCard title="Despesas no Período" value={formatCurrency(metrics?.totalExpense ?? 0)} icon={TrendingDown} isLoading={isLoading} colorClass="text-red-400"/>
                <MetricCard title="Lucro/Prejuízo" value={formatCurrency(metrics?.netProfit ?? 0)} icon={Scale} isLoading={isLoading} colorClass={ (metrics?.netProfit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400' }/>
            </div>
            
            <Card className="bg-card p-6 rounded-2xl border-border">
                <CardHeader>
                    <CardTitle>Receitas vs. Despesas</CardTitle>
                    <CardDescription>Comparativo do total de entradas e saídas no período selecionado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[300px] w-full">
                        <BarChart data={chartData} accessibilityLayer>
                            <CustomXAxis dataKey="name" />
                            <CustomYAxis tickFormatter={(value) => formatCurrency(value)} />
                             <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent 
                                    formatter={(value) => formatCurrency(value as number)} 
                                    hideLabel 
                                />}
                            />
                            <Bar dataKey="value" radius={8} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
                <p className="text-muted-foreground">
                    Analise a saúde financeira do seu negócio.
                </p>
            </div>
             <div className="flex items-center gap-4">
                {isLoading && !initialLoading && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin"/>}
                <DateRangePicker date={dateRange} setDate={setDateRange} />
             </div>
        </div>
        {renderContent()}
    </div>
  );
}
