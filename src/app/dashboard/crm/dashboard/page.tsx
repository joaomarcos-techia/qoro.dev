
'use client';
import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getDashboardMetrics } from '@/ai/flows/crm-management';
import { CustomerProfile, SaleLeadProfile } from '@/ai/schemas';
import { Bar, BarChart as BarChartPrimitive, CartesianGrid } from 'recharts';
import CustomXAxis from '@/components/utils/CustomXAxis';
import CustomYAxis from '@/components/utils/CustomYAxis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Users, TrendingUp, Percent, DollarSign, Loader2, ServerCrash } from 'lucide-react';
import { subMonths, format, startOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CrmMetrics {
  totalCustomers: number;
  totalLeads: number;
  conversionRate: number;
  totalRevenueWon: number;
  leadStages: {
    new: number;
    initial_contact: number;
    qualified: number;
    proposal: number;
    negotiation: number;
  };
  newCustomersPerMonth: { month: string; customers: number }[];
}

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(var(--crm-primary))",
  },
  customers: {
    label: "Novos Clientes",
    color: "hsl(var(--crm-cta))",
  },
};

const MetricCard = ({ title, value, icon: Icon, isLoading, format }: { title: string, value: number, icon: React.ElementType, isLoading: boolean, format?: (value: number) => string }) => (
  <div className="bg-card p-6 rounded-2xl border border-border flex items-center">
    <div className='p-3 rounded-xl bg-crm-primary text-black mr-4 shadow-lg shadow-crm-primary/30'>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      {isLoading ? (
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mt-1" />
      ) : (
        <p className="text-3xl font-bold text-foreground">{format ? format(value) : value}</p>
      )}
    </div>
  </div>
);

export default function DashboardCrmPage() {
  const [metrics, setMetrics] = useState<CrmMetrics | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const calculateMetrics = useCallback((customers: CustomerProfile[], leads: SaleLeadProfile[]): CrmMetrics => {
    const totalCustomers = customers.length;
    
    let totalRevenueWon = 0;
    let wonLeadsCount = 0;
    const leadStages = { new: 0, initial_contact: 0, qualified: 0, proposal: 0, negotiation: 0 };
    
    leads.forEach(lead => {
        if(lead.stage === 'won') {
            totalRevenueWon += lead.value || 0;
            wonLeadsCount++;
        } else if (lead.stage !== 'lost') {
            if (lead.stage in leadStages) {
                leadStages[lead.stage as keyof typeof leadStages]++;
            }
        }
    });

    const totalLeads = Object.values(leadStages).reduce((a, b) => a + b, 0);
    const totalClosedDeals = wonLeadsCount + leads.filter(l => l.stage === 'lost').length;
    const conversionRate = totalClosedDeals > 0 ? parseFloat(((wonLeadsCount / totalClosedDeals) * 100).toFixed(1)) : 0;

    const now = new Date();
    const monthlyCounts: { [key: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        monthlyCounts[monthKey] = 0;
    }

    customers.forEach(customer => {
        const createdAt = parseISO(customer.createdAt);
        if (createdAt >= startOfMonth(subMonths(now, 5))) {
            const monthKey = format(createdAt, 'yyyy-MM');
            if (monthlyCounts.hasOwnProperty(monthKey)) {
                monthlyCounts[monthKey]++;
            }
        }
    });
    
    const newCustomersPerMonth = Object.keys(monthlyCounts).map(key => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
            month: format(date, 'MMM', { locale: ptBR }),
            customers: monthlyCounts[key],
        };
    });

    return {
        totalCustomers,
        totalLeads,
        conversionRate,
        totalRevenueWon,
        leadStages,
        newCustomersPerMonth
    };
  }, []);


  useEffect(() => {
    if (!currentUser) return;

    const fetchAndSetMetrics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { customers, leads } = await getDashboardMetrics({ actor: currentUser.uid });
            const calculatedMetrics = calculateMetrics(customers, leads);
            setMetrics(calculatedMetrics);
        } catch (err) {
            console.error("Erro ao buscar métricas do CRM:", err);
            setError('Não foi possível carregar as métricas do CRM.');
        } finally {
            setIsLoading(false);
        }
    }
    
    fetchAndSetMetrics();

  }, [currentUser, calculateMetrics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  const formatPercentage = (value: number) => `${value}%`;
  
  const funnelChartData = metrics ? [
    { stage: 'Novo', leads: metrics.leadStages.new, fill: "var(--color-leads)" },
    { stage: 'Contato', leads: metrics.leadStages.initial_contact, fill: "var(--color-leads)" },
    { stage: 'Qualificado', leads: metrics.leadStages.qualified, fill: "var(--color-leads)" },
    { stage: 'Proposta', leads: metrics.leadStages.proposal, fill: "var(--color-leads)" },
    { stage: 'Negociação', leads: metrics.leadStages.negotiation, fill: "var(--color-leads)" },
  ] : [];

  const newCustomersChartData = metrics ? metrics.newCustomersPerMonth.map(item => ({ ...item, month: item.month.charAt(0).toUpperCase() + item.month.slice(1) })) : [];


  const renderContent = () => {
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
            <MetricCard title="Total de Clientes" value={metrics?.totalCustomers ?? 0} icon={Users} isLoading={isLoading} />
            <MetricCard title="Leads Ativos" value={metrics?.totalLeads ?? 0} icon={TrendingUp} isLoading={isLoading} />
            <MetricCard title="Taxa de Conversão" value={metrics?.conversionRate ?? 0} icon={Percent} isLoading={isLoading} format={formatPercentage} />
            <MetricCard title="Receita Gerada" value={metrics?.totalRevenueWon ?? 0} icon={DollarSign} isLoading={isLoading} format={formatCurrency} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card p-6 rounded-2xl border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center"><TrendingUp className="w-5 h-5 mr-3 text-crm-primary"/>Funil de Vendas</CardTitle>
                        <CardDescription>Distribuição de leads ativos por estágio.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChartPrimitive data={funnelChartData} >
                                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                                <CustomXAxis dataKey="stage" tickMargin={10} />
                                <CustomYAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="leads" radius={8} fill="var(--color-leads)" />
                            </BarChartPrimitive>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="bg-card p-6 rounded-2xl border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center"><LineChart className="w-5 h-5 mr-3 text-crm-primary"/>Novos Clientes por Mês</CardTitle>
                        <CardDescription>Crescimento da base de clientes nos últimos 6 meses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChartPrimitive data={newCustomersChartData} >
                                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                                <CustomXAxis dataKey="month" tickMargin={10} />
                                <CustomYAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="customers" name="Novos Clientes" radius={8} fill="var(--color-customers)" />
                            </BarChartPrimitive>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Dashboard do CRM</h1>
        <p className="text-muted-foreground">
          Analise a saúde do seu relacionamento com clientes e o desempenho de vendas.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
