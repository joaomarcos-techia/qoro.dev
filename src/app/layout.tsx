import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Qoro - Transforme seu negócio com nossa plataforma integrada',
  description: 'Qoro é uma solução tecnológica para microempreendedores e/ou solo entrepreneur que tem como objetivo unificar todas as ações principais em um único ecossistema, tornando mais fácil a utilização e localização de informações, agilizando o tempo necessário para uma tarefa e tomadas de decisão.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-gray-50 to-gray-100">{children}</body>
    </html>
  );
}
