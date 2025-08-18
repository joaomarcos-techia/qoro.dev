'use client';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className, height = 24 }: LogoProps) {
  const aspectRatio = 100 / 40; 
  const width = height * aspectRatio;

  return (
    <div className={cn('relative', className)} style={{ width: `${width}px`, height: `${height}px` }}>
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/qoro-iy1gs.firebasestorage.app/o/logo_definitiva-removebg-preview.png?alt=media&token=a6de67b0-f90f-41a1-885f-a5ab5df437ac"
        alt="Qoro Logo"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-contain"
        priority
      />
    </div>
  );
}
