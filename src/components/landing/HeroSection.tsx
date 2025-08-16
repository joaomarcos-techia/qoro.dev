import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section id="home" className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-black to-black -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                    Diga adeus ao caos.
                    <span className="block text-blue-400">Centralize tudo com a Qoro.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed">
                    Pare de perder tempo caçando informações. Unifique seu CRM, projetos, finanças e análises em uma única plataforma e tome decisões mais rápidas e inteligentes.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/signup">
                        <div className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1 group flex items-center justify-center text-lg font-semibold">
                            Começar grátis
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    </section>
  );
}