
'use client';

import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
}

export function Logo({ width = 120, height = 32 }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Qoro Logo"
      width={width}
      height={height}
      priority
    />
  );
}
