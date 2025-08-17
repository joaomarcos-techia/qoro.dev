
'use client';
import React, { useState, useEffect } from 'react';
import { type Product } from './ProductsSection';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, Activity, CheckSquare, DollarSign, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';


interface ProductCarouselProps {
  products: Product[];
}

const iconMap: Record<Product['iconName'], ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
    Users,
    Activity,
    CheckSquare,
    DollarSign,
};

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? products.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === products.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const timer = setInterval(goToNext, 5000); // Auto-scroll every 5 seconds
    return () => clearInterval(timer);
  }, [currentIndex]);


  const getSlideIndex = (index: number) => {
    const total = products.length;
    if (index === currentIndex) return 'active';
    if (index === (currentIndex - 1 + total) % total) return 'prev';
    if (index === (currentIndex + 1) % total) return 'next';
    return 'hidden';
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
        <div className="relative h-[450px] w-full flex items-center justify-center overflow-hidden">
        {products.map((product, index) => {
          const slideState = getSlideIndex(index);
          return (
            <div
              key={product.title}
              className={cn(
                'absolute transition-all duration-200 ease-in-out',
                {
                  'opacity-100 transform scale-100 z-10': slideState === 'active',
                  'opacity-40 transform scale-90 -translate-x-full z-0': slideState === 'prev',
                  'opacity-40 transform scale-90 translate-x-full z-0': slideState === 'next',
                  'opacity-0 transform scale-75 z-0': slideState === 'hidden',
                }
              )}
            >
              <ProductCard product={product} isActive={slideState === 'active'} />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center space-x-4 mt-8">
        <Button onClick={goToPrevious} variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 rounded-full w-12 h-12">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex space-x-2">
            {products.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                        currentIndex === index ? 'bg-primary scale-125' : 'bg-gray-600 hover:bg-gray-400'
                    )}
                />
            ))}
        </div>
        <Button onClick={goToNext} variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 rounded-full w-12 h-12">
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

const ProductCard = ({ product, isActive }: { product: Product, isActive: boolean }) => {
    const Icon = iconMap[product.iconName];
    return (
        <div className={cn("bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm transition-all duration-200 w-[340px]", { 'border-primary/50 shadow-2xl shadow-primary/20': isActive })}>
            <div className={`bg-gradient-to-br ${product.gradientClass} text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{product.title}</h3>
            <p className="text-white/70 mb-6 leading-relaxed h-20">{product.description}</p>
            <ul className="space-y-3">
                {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-white/60">
                        <div className={`w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-1.5 flex-shrink-0`}></div>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    )
};
