
import { FeaturesCarousel } from './FeaturesCarousel';

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
        
        <FeaturesCarousel />
      </div>
    </section>
  );
}
