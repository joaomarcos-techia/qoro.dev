import { Zap, Shield, Headphones, Star } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Integração Total',
    description: 'Todos os módulos trabalham em perfeita sincronia, eliminando silos de informação.',
  },
  {
    icon: Shield,
    title: 'Segurança Avançada',
    description: 'Criptografia de ponta a ponta da Google Firebase para proteção de dados.',
  },
  {
    icon: Headphones,
    title: 'Suporte Premium',
    description: 'Equipe especializada disponível para garantir o sucesso da sua operação.',
  },
];

export function AboutSection() {
  return (
    <section id="sobre" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
              Por que escolher a Qoro?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Somos mais que uma plataforma de software. Somos parceiros estratégicos 
              na transformação digital do seu negócio, oferecendo tecnologia de ponta 
              com suporte humano excepcional.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-neumorphism">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-neumorphism">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl shadow-neumorphism-inset">
                  <div className="w-8 h-8 bg-black rounded-xl mb-3 shadow-neumorphism"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded"></div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl shadow-neumorphism-inset">
                  <div className="w-8 h-8 bg-gray-700 rounded-xl mb-3 shadow-neumorphism"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded"></div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl shadow-neumorphism-inset">
                  <div className="w-8 h-8 bg-gray-600 rounded-xl mb-3 shadow-neumorphism"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded"></div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl shadow-neumorphism-inset">
                  <div className="w-8 h-8 bg-gray-500 rounded-xl mb-3 shadow-neumorphism"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center bg-gray-50 px-4 py-2 rounded-full shadow-neumorphism-inset">
                  <Star className="text-yellow-500 mr-2 w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">Plataforma Unificada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
