"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#home', label: 'Início' },
    { href: '/#produtos', label: 'Soluções' },
    { href: '/#sobre', label: 'Sobre nós' },
    { href: '/#precos', label: 'Planos' },
    { href: '/#contato', label: 'Contato' },
  ];
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith('/#')) {
        e.preventDefault();
        const targetId = href.substring(2); // Remove '/#'
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for header height
            behavior: 'smooth'
            });
        }
    }
    setIsMenuOpen(false);
  };

  // Only render this header for the landing page
  if (pathname !== '/') {
    return null;
  }

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-neumorphism' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/#home" onClick={(e) => handleLinkClick(e, '/#home')} className="text-2xl lg:text-3xl font-bold text-black">Qoro</Link>
            </div>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="hidden md:block">
             <Link href="/login">
                <div className="bg-gray-800 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover">
                    Entrar
                </div>
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-black p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-neumorphism">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href} 
                href={link.href} 
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2">
               <Link href="/login">
                <div className="w-full text-center bg-gray-800 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover">
                    Entrar
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

    