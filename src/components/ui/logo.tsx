
'use client';

interface LogoProps {
  height?: number;
}

export function Logo({ height = 32 }: LogoProps) {
  const scale = height / 32;

  return (
    <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
      <span 
        className="font-bold text-white transition-colors duration-300"
        style={{ fontSize: `${30 * scale}px`, letterSpacing: '-0.05em' }}
      >
        Qoro
      </span>
    </div>
  );
}
