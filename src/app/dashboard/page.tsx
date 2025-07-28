'use client';
import {
  Activity,
  ArrowRight,
  Bot,
  CheckSquare,
  DollarSign,
  Gift,
  MessageCircle,
  RefreshCw,
  Save,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div
      id="dashboard-content"
      className="app-content active max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">
          Bem-vindo à Qoro!
        </h2>
        <p className="text-gray-600">
          Gerencie todos os seus SaaS em uma única plataforma integrada
          <span className="ml-2 inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm rounded-full">
            <Gift className="w-3 h-3 mr-1" />
            Acesso VIP Gratuito
          </span>
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Receita Total</p>
              <p className="text-2xl font-bold text-black mt-1">R$ 12.5k</p>
              <p className="text-sm font-medium mt-1 text-green-600">
                +12% vs mês anterior
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-green-600 shadow-neumorphism-inset">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Leads Convertidos
              </p>
              <p className="text-2xl font-bold text-black mt-1">24</p>
              <p className="text-sm font-medium mt-1 text-green-600">
                +8% vs mês anterior
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-blue-600 shadow-neumorphism-inset">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Taxa de Conclusão
              </p>
              <p className="text-2xl font-bold text-black mt-1">85%</p>
              <p className="text-sm font-medium mt-1 text-green-600">
                +5% vs mês anterior
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-green-600 shadow-neumorphism-inset">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Automações Ativas
              </p>
              <p className="text-2xl font-bold text-black mt-1">7</p>
              <p className="text-sm font-medium mt-1 text-green-600">
                +15% vs mês anterior
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-purple-600 shadow-neumorphism-inset">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">Seus Aplicativos Qoro</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-neumorphism border border-gray-200 overflow-hidden hover:shadow-neumorphism-hover transition-all duration-300 hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-4 shadow-neumorphism">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black">QoroCRM</h4>
                    <p className="text-sm text-gray-600">
                      CRM ultra-simples com foco em WhatsApp e Email + automação
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">42</p>
                    <p className="text-xs text-gray-600">Leads Ativos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">12%</p>
                    <p className="text-xs text-gray-600">Conversões</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">18</p>
                    <p className="text-xs text-gray-600">Qualificados</p>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center shadow-neumorphism hover:shadow-neumorphism-hover">
                  Acessar QoroCRM
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-neumorphism border border-gray-200 overflow-hidden hover:shadow-neumorphism-hover transition-all duration-300 hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white mr-4 shadow-neumorphism">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black">QoroPulse</h4>
                    <p className="text-sm text-gray-600">
                      Sistema nervoso central inteligente para otimização
                      automática
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">15</p>
                    <p className="text-xs text-gray-600">Insights Gerados</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">3</p>
                    <p className="text-xs text-gray-600">Não Lidos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bot className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">8</p>
                    <p className="text-xs text-gray-600">Aplicados</p>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center shadow-neumorphism hover:shadow-neumorphism-hover">
                  Acessar QoroPulse
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-neumorphism border border-gray-200 overflow-hidden hover:shadow-neumorphism-hover transition-all duration-300 hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white mr-4 shadow-neumorphism">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black">QoroTask</h4>
                    <p className="text-sm text-gray-600">
                      Plataforma leve de gestão de tarefas e produtividade
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CheckSquare className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">28</p>
                    <p className="text-xs text-gray-600">Tarefas Ativas</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">85%</p>
                    <p className="text-xs text-gray-600">Concluídas</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">3</p>
                    <p className="text-xs text-gray-600">Em Atraso</p>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center shadow-neumorphism hover:shadow-neumorphism-hover">
                  Acessar QoroTask
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-neumorphism border border-gray-200 overflow-hidden hover:shadow-neumorphism-hover transition-all duration-300 hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white mr-4 shadow-neumorphism">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black">
                      QoroFinance
                    </h4>
                    <p className="text-sm text-gray-600">
                      Controle financeiro completo para seu negócio
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">R$ 25.4k</p>
                    <p className="text-xs text-gray-600">Saldo Total</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">R$ 12.5k</p>
                    <p className="text-xs text-gray-600">Receita Mensal</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-lg font-bold text-black">48</p>
                    <p className="text-xs text-gray-600">Transações</p>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center shadow-neumorphism hover:shadow-neumorphism-hover">
                  Acessar QoroFinance
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-black mb-6">
            Atividades Recentes
          </h3>
          <div className="bg-white rounded-2xl shadow-neumorphism border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 rounded-xl bg-gray-50 mr-3 text-blue-600 shadow-neumorphism-inset">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    Novo lead convertido
                  </p>
                  <p className="text-xs text-gray-500">QoroCRM • 2 min atrás</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-xl bg-gray-50 mr-3 text-purple-600 shadow-neumorphism-inset">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    Insight sobre campanha detectado
                  </p>
                  <p className="text-xs text-gray-500">QoroPulse • 15 min atrás</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-xl bg-gray-50 mr-3 text-green-600 shadow-neumorphism-inset">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    Tarefa "Reunião cliente" concluída
                  </p>
                  <p className="text-xs text-gray-500">QoroTask • 1h atrás</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-xl bg-gray-50 mr-3 text-orange-600 shadow-neumorphism-inset">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    Receita de R$ 12.5k registrada
                  </p>
                  <p className="text-xs text-gray-500">
                    QoroFinance • 2h atrás
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 text-center text-sm text-gray-600 hover:text-black transition-colors">
              Ver todas as atividades
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-8 text-white shadow-neumorphism">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">💡 Insights do QoroPulse</h3>
            <p className="text-purple-100 mb-4">
              Seu assistente inteligente detectou algumas oportunidades
            </p>
            <div className="space-y-2">
              <div className="bg-white/10 rounded-xl p-3 shadow-neumorphism-inset">
                <p className="text-sm">
                  Seus leads do WhatsApp têm 34% mais conversão que email.
                  Considere aumentar investimento neste canal.
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 shadow-neumorphism-inset">
                <p className="text-sm">
                  5 clientes não interagem há mais de 30 dias. Recomendamos uma
                  campanha de reativação.
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 shadow-neumorphism-inset">
                <p className="text-sm">
                  Oportunidade de aumentar preço em 15% baseado no mercado atual
                  e valor percebido.
                </p>
              </div>
            </div>
          </div>
          <div className="ml-6">
            <button className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors font-medium shadow-neumorphism hover:shadow-neumorphism-hover">
              Ver Todos os Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
