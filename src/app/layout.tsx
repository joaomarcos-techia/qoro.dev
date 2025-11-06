
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Qoro - Plataforma de Gestão Empresarial Integrada com CRM, Finanças e IA',
  description: 'Transforme o caos em clareza com a Qoro, a plataforma de gestão que unifica CRM, finanças, tarefas e IA. Ideal para PMEs, autônomos e agências que buscam crescimento estratégico e eficiência operacional.',
  keywords: [
    'plataforma de gestão',
    'gestão empresarial',
    'software de crm',
    'controle financeiro',
    'gestão de tarefas',
    'inteligência artificial para negócios',
    'automação de processos',
    'software para pme',
    'gestão para autônomos',
    'Qoro',
    'QoroCRM',
    'QoroFinance',
    'QoroTask',
    'QoroPulse',
  ],
  metadataBase: new URL('https://qoro.com.br'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
