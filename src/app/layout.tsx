import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoreFlow - Transforme seu negócio com nossa plataforma integrada',
  description: 'CoreFlow - Plataforma completa com CRM, monitoramento, gestão de tarefas e controle financeiro para transformar seu negócio',
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
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-gray-50 to-gray-100">{children}</body>
    </html>
  );
}
