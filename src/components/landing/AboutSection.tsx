
import { Eye, BrainCircuit, Rocket, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Visão 360°',
    description: 'Tenha todos os dados importantes do seu negócio — do cliente ao financeiro — em uma única tela.',
    colorClass: 'bg-crm-primary',
  },
  {
    icon: BrainCircuit,
    title: 'Decisões Inteligentes',
    description: 'Use a IA do QoroPulse para identificar tendências, prever resultados e guiar suas estratégias.',
    colorClass: 'bg-pulse-primary',
  },
  {
    icon: Rocket,
    title: 'Produtividade Máxima',
    description: 'Automatize tarefas, organize projetos e libere sua equipe para focar no que realmente importa.',
    colorClass: 'bg-task-primary',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança de Ponta',
    description: 'Construído sobre a infraestrutura do Google, seus dados estão sempre seguros e disponíveis.',
    colorClass: 'bg-finance-primary',
  }
];

export function AboutSection() {
  return (
    <section id="sobre" className="py-20 bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-sm font-medium text-primary mb-4 tracking-wider uppercase">Construído para Empreendedores como Você</div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Menos tempo gerenciando, mais tempo crescendo.
        </h2>
        <p className="text-xl text-white/70 mb-16 leading-relaxed max-w-3xl mx-auto">
          A Qoro não é apenas uma ferramenta, é o seu copiloto estratégico. Nós centralizamos a complexidade para que você possa focar em expandir seu negócio com clareza e confiança.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="relative group flex flex-col items-center text-center p-6 bg-secondary/30 rounded-2xl border border-border transition-all duration-300 hover:bg-secondary/60 hover:-translate-y-1 overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className={`text-black w-16 h-16 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0 shadow-lg transition-transform duration-300 ${feature.colorClass}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
