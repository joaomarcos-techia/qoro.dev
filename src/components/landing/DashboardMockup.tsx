
'use client';
import { BarChart3, CheckSquare, DollarSign, Users, TrendingUp, ListTodo, Activity, Folder, Settings, ArrowRight, Bell } from "lucide-react";

const MetricCard = ({ title, value, icon: Icon, color, change, changeType }: { title: string, value: string, icon: React.ElementType, color: string, change: string, changeType: 'up' | 'down' }) => {
    const changeColor = changeType === 'up' ? 'text-green-400' : 'text-red-400';
    return (
        <div className="bg-card/50 border border-border rounded-xl p-4 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
            <div className="flex items-center text-muted-foreground text-sm mb-2">
                <Icon className={`w-5 h-5 mr-2 ${color}`} />
                <span>{title}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <div className={`flex items-center text-xs mt-1 ${changeColor}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{change}</span>
            </div>
        </div>
    )
}

export function DashboardMockup() {
    return (
        <div className="w-full h-full aspect-[16/10] rounded-xl bg-card flex overflow-hidden border-2 border-border shadow-2xl">
            {/* Sidebar */}
            <aside className="w-20 bg-secondary/30 p-4 flex-shrink-0 flex flex-col items-center justify-between">
                <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-primary text-black flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30">Q</div>
                     <div className="w-10 h-10 rounded-full bg-crm-primary/20 flex items-center justify-center text-crm-primary" title="QoroCRM">
                        <Users className="w-5 h-5" />
                    </div>
                     <div className="w-10 h-10 rounded-full bg-task-primary/20 flex items-center justify-center text-task-primary" title="QoroTask">
                        <CheckSquare className="w-5 h-5" />
                    </div>
                     <div className="w-10 h-10 rounded-full bg-finance-primary/20 flex items-center justify-center text-finance-primary" title="QoroFinance">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-pulse-primary/20 flex items-center justify-center text-pulse-primary" title="QoroPulse">
                        <Activity className="w-5 h-5" />
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-muted/30 cursor-pointer" title="Configurações">
                    <Settings className="w-5 h-5" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-hidden">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-muted-foreground">Bem-vindo, Empreendedor!</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-muted-foreground hover:text-foreground"><Bell className="w-5 h-5"/></button>
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">E</div>
                    </div>
                </header>
                
                {/* Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard title="Total de Clientes" value="124" icon={Users} color="text-crm-primary" change="+12.5%" changeType="up" />
                    <MetricCard title="Leads no Funil" value="32" icon={TrendingUp} color="text-crm-primary" change="+5" changeType="up" />
                    <MetricCard title="Tarefas Pendentes" value="18" icon={ListTodo} color="text-task-primary" change="-2" changeType="down" />
                    <MetricCard title="Saldo em Contas" value="R$ 78.4k" icon={DollarSign} color="text-finance-primary" change="+R$ 5.2k" changeType="up" />
                </div>

                {/* Chart */}
                <div className="h-full max-h-[220px] bg-secondary/30 p-4 rounded-xl border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Evolução da Receita</h3>
                     <div className="h-40 flex items-end space-x-2">
                        {[3, 5, 4, 7, 6, 8, 9, 7, 5, 6, 8, 10, 11, 9, 12, 13].map((height, i) => (
                            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-b from-primary/80 to-primary/40" style={{ height: `${height * 8}%` }}></div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
