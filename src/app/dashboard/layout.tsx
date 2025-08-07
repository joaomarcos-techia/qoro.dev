
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  LayoutGrid,
  CheckSquare,
  ClipboardList,
  Calendar,
  BarChart3,
  DollarSign,
  Activity,
  ChevronLeft,
  FileText,
  ShoppingCart,
  Wrench,
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Landmark,
  Truck,
  PlusCircle,
  MessageSquare,
  Trash2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Conversation } from '@/ai/schemas';
import { listConversations, deleteConversation as deleteConversationFlow } from '@/ai/flows/pulse-flow';
import { useEffect, useState, startTransition } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
    group: string;
    icon: LucideIcon;
    color: string;
    items: NavItem[];
}

const navConfig: Record<string, NavGroup> = {
    crm: {
        group: 'QoroCRM',
        icon: Users,
        color: 'bg-blue-500',
        items: [
            { href: '/dashboard/crm/dashboard', label: 'Dashboard', icon: BarChart3 },
            { href: '/dashboard/crm/clientes', label: 'Clientes', icon: Users },
            { href: '/dashboard/crm/funil', label: 'Funil', icon: LayoutGrid },
            { href: '/dashboard/crm/produtos', label: 'Produtos', icon: ShoppingCart },
            { href: '/dashboard/crm/servicos', label: 'Serviços', icon: Wrench },
            { href: '/dashboard/crm/orcamentos', label: 'Orçamentos', icon: FileText },
            { href: '/dashboard/crm/relatorios', label: 'Relatórios', icon: BarChart3 },
        ]
    },
    task: {
        group: 'QoroTask',
        icon: CheckSquare,
        color: 'bg-green-500',
        items: [
            { href: '/dashboard/task/dashboard', label: 'Dashboard', icon: BarChart3 },
            { href: '/dashboard/task/tarefas', label: 'Minhas Tarefas', icon: ClipboardList },
            { href: '/dashboard/task/projetos', label: 'Projetos', icon: LayoutGrid },
            { href: '/dashboard/task/calendario', label: 'Calendário', icon: Calendar },
        ]
    },
    finance: {
        group: 'QoroFinance',
        icon: DollarSign,
        color: 'bg-orange-500',
        items: [
            { href: '/dashboard/finance/visao-geral', label: 'Visão Geral', icon: LayoutDashboard },
            { href: '/dashboard/finance/transacoes', label: 'Transações', icon: ArrowLeftRight },
            { href: '/dashboard/finance/faturamento', label: 'Faturamento', icon: Receipt },
            { href: '/dashboard/finance/contas', label: 'Contas', icon: Landmark },
            { href: '/dashboard/finance/fornecedores', label: 'Fornecedores', icon: Truck },
        ]
    },
    pulse: {
        group: 'QoroPulse',
        icon: Activity,
        color: 'bg-purple-500',
        items: [] // Items will be dynamically populated for Pulse
    }
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/');
  const currentModule = segments.length > 2 ? segments[2] : 'home';
  const conversationId = currentModule === 'pulse' && segments.length > 3 ? segments[3] : null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchPulseData() {
        if (currentModule === 'pulse' && currentUser) {
            try {
                const convos = await listConversations({ actor: currentUser.uid });
                setConversations([...convos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            }
        }
    }
    fetchPulseData();
  }, [currentModule, currentUser, pathname]); // Re-fetch on path change to update list after new convo

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
        await deleteConversationFlow({ conversationId: id, actor: currentUser.uid });
        const updatedConversations = conversations.filter(c => c.id !== id);
        setConversations(updatedConversations);
        // If the active conversation was deleted, navigate to a new one
        if (id === conversationId) {
            router.push('/dashboard/pulse/new');
        }
    } catch (error) {
        console.error("Failed to delete conversation", error);
    }
  }


  const renderSidebar = () => {
    if (currentModule === 'home' || !navConfig[currentModule]) {
      return null;
    }
    
    const navData = navConfig[currentModule];
    const { group, icon: GroupIcon, color, items } = navData;
    
    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-neumorphism-right">
            <div className="p-4 border-b border-gray-200 space-y-4">
                <div className="flex items-center">
                    <div className={`p-3 rounded-xl text-white mr-4 shadow-neumorphism ${color}`}>
                        <GroupIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-black">{group}</h2>
                </div>
                <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-primary transition-colors text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    <span>Voltar ao Dashboard</span>
                </Link>
                 {currentModule === 'pulse' && (
                    <Link href="/dashboard/pulse/new">
                        <Button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover flex items-center justify-center font-semibold">
                            <PlusCircle className="mr-2 w-5 h-5"/>
                            Nova Conversa
                        </Button>
                    </Link>
                )}
            </div>
            <nav className="flex-grow p-4 overflow-y-auto">
                {currentModule === 'pulse' ? (
                    <ul className="space-y-1">
                        {conversations.length > 0 ? conversations.map(convo => (
                           <li key={convo.id}>
                                <Link
                                    href={`/dashboard/pulse/${convo.id}`}
                                    className={cn(
                                        "group flex items-center justify-between w-full text-left p-3 rounded-xl cursor-pointer transition-all duration-200",
                                        convo.id === conversationId 
                                        ? 'bg-primary text-white shadow-neumorphism-inset' 
                                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-neumorphism'
                                    )}
                                >
                                    <span className="text-sm font-medium truncate flex items-center">
                                        <MessageSquare className="w-4 h-4 mr-3 flex-shrink-0" />
                                        {convo.title}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDeleteConversation(convo.id, e)}
                                        className={cn(
                                            "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
                                            convo.id === conversationId ? "hover:bg-primary/80" : "hover:bg-red-100 text-red-500"
                                        )}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </Link>
                           </li>
                        )) : (
                             <div className="text-center text-gray-400 mt-10">
                                <MessageSquare className="mx-auto w-10 h-10 mb-2"/>
                                <p className="text-sm">Seu histórico aparecerá aqui.</p>
                            </div>
                        )}
                    </ul>
                ) : (
                    <ul>
                        {items.map((item) => (
                        <li key={item.href}>
                            <Link
                            href={item.href}
                            className={`flex items-center px-4 py-3 my-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                                pathname.startsWith(item.href)
                                ? 'bg-primary text-white shadow-neumorphism-inset'
                                : 'text-gray-700 hover:bg-gray-100 hover:shadow-neumorphism'
                            }`}
                            >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                            </Link>
                        </li>
                        ))}
                    </ul>
                )}
            </nav>
        </aside>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="flex h-[calc(100vh-64px)]">
         {renderSidebar()}
         <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {children}
            </div>
         </main>
      </div>
    </div>
  );
}
