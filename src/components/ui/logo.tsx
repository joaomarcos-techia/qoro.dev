'use client';
import Image from 'next/image';

interface LogoProps {
  height?: number;
}

export function Logo({ height = 32 }: LogoProps) {
  const width = (height / 32) * 102; // Mantém a proporção de 102:32

  return (
    <div 
      className="relative" 
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <Image
        src="/logo.svg"
        alt="Qoro Logo"
        fill
        sizes={`${width}px`}
        priority
      />
    </div>
  );
}
