
'use client';
import { BarChart3, CheckSquare, DollarSign, Users, TrendingUp, ListTodo, Activity, Folder, Settings, ArrowRight, Bell } from "lucide-react";
import { Logo } from "../ui/logo";

const Placeholder = ({ className }: { className?: string }) => <div className={`bg-white/10 rounded-full ${className}`} />;

const MetricCard = ({ icon: Icon, color }: { icon: React.ElementType, color: string}) => {
    return (
        <div className="bg-card/50 border border-border rounded-lg p-2 flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${color}/20 text-${color} shadow-lg flex-shrink-0`}>
                <Icon className={`w-3 h-3 ${color}`} />
            </div>
            <div className="w-full space-y-1">
              <Placeholder className="w-3/4 h-1.5" />
              <Placeholder className="w-1/2 h-2" />
            </div>
        </div>
    )
}

const AppCard = ({ title, icon: Icon, color }: { title: string, icon: React.ElementType, color: string}) => (
    <div className="group bg-card/50 rounded-lg border border-border transition-all flex flex-col p-2">
        <div className="flex items-center mb-1.5">
            <div className={`p-1.5 rounded-md ${color}/20 text-${color} mr-2 shadow-lg flex-shrink-0`}>
                <Icon className="w-3 h-3" />
            </div>
            <h4 className="text-[8px] font-bold text-foreground">{title}</h4>
        </div>
        <div className="space-y-1 mb-1.5 flex-grow">
            <Placeholder className="w-full h-1" />
            <Placeholder className="w-5/6 h-1" />
        </div>
        <div className="w-full bg-secondary py-1 px-1.5 rounded-md flex items-center justify-center">
            <Placeholder className="w-1/3 h-1.5" />
        </div>
    </div>
)

export function DashboardMockup() {
    return (
        <div className="w-full aspect-video rounded-xl bg-card flex flex-col overflow-hidden border-2 border-border shadow-2xl text-[10px]">
            {/* Header */}
            <header className="bg-card/80 border-b border-border flex items-center justify-between h-10 px-3 flex-shrink-0">
                 <div className="flex items-center">
                    <Logo height={16}/>
                </div>
                 <div className="flex items-center space-x-1.5">
                    <button className="text-muted-foreground p-1 rounded-md">
                        <Settings className="w-3 h-3" />
                    </button>
                     <button className="text-muted-foreground p-1 rounded-md">
                        <Bell className="w-3 h-3"/>
                    </button>
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-semibold">
                        <Users className="w-3 h-3" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-3 overflow-hidden">
                <div className="mb-3 space-y-1.5">
                    <Placeholder className="w-1/3 h-3" />
                    <Placeholder className="w-1/2 h-2.5" />
                </div>

                <div className="flex gap-4 h-full">
                    {/* Metrics Section */}
                    <div className="w-1/2 flex flex-col">
                        <Placeholder className="w-1/2 h-2.5 mb-2" />
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <MetricCard icon={Users} color="text-crm-primary" />
                            <MetricCard icon={TrendingUp} color="text-crm-primary" />
                            <MetricCard icon={ListTodo} color="text-task-primary" />
                            <MetricCard icon={DollarSign} color="text-finance-primary" />
                        </div>

                         {/* Apps Section */}
                        <Placeholder className="w-1/2 h-2.5 mb-2" />
                        <div className="grid grid-cols-2 gap-2 flex-grow">
                             <AppCard title="QoroCRM" icon={Users} color="text-crm-primary" />
                             <AppCard title="QoroPulse" icon={Activity} color="text-pulse-primary" />
                             <AppCard title="QoroTask" icon={CheckSquare} color="text-task-primary" />
                             <AppCard title="QoroFinance" icon={DollarSign} color="text-finance-primary" />
                        </div>
                    </div>

                    <div className="w-1/2 bg-secondary/30 rounded-lg p-2">
                         <Placeholder className="w-1/3 h-2.5 mb-2" />
                         <div className="space-y-2">
                            <Placeholder className="w-full h-8 rounded-md" />
                            <Placeholder className="w-full h-12 rounded-md" />
                            <Placeholder className="w-full h-6 rounded-md" />
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
