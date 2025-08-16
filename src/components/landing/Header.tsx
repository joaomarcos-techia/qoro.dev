
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Show header when scrolled down a bit
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#home', label: 'Início' },
    { href: '/#produtos', label: 'Soluções' },
    { href: '/#sobre', label: 'Sobre' },
    { href: '/#precos', label: 'Planos' },
    { href: '/#contato', label: 'Contato' },
  ];
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith('/#')) {
        e.preventDefault();
        const targetId = href.substring(2);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100, // Adjust for header height and spacing
                behavior: 'smooth'
            });
        }
    }
  };

  // Only render this header for the landing page
  if (pathname !== '/') {
    return null;
  }

  return (
    <header 
      className={`fixed w-full top-0 left-0 z-50 flex justify-center transition-all duration-500 ease-in-out ${isScrolled ? 'top-5 opacity-100' : '-top-20 opacity-0'}`}
    >
      <div 
        className="bg-[#18191B] rounded-full py-3 px-8 flex items-center justify-between shadow-2xl border border-[#24262D] w-full"
        style={{ maxWidth: '700px' }}
      >
        <div className="flex items-center">
          <Link href="/#home" onClick={(e) => handleLinkClick(e, '/#home')} className="text-xl font-bold text-white">
            Qoro
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="text-gray-300 hover:text-white text-sm transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/login">
            <div className="hidden md:block bg-primary text-white px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ease-in-out hover:bg-primary/80 hover:shadow-lg hover:scale-105">
                Comece agora
            </div>
        </Link>
      </div>
    </header>
  );
}
