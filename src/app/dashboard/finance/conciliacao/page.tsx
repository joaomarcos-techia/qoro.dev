
'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GitCompareArrows, Upload, FileCheck } from 'lucide-react';

export default function ConciliacaoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Arquivo selecionado:', file.name);
      setSelectedFile(file);
      // A lógica para processar o arquivo OFX viria aqui
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Conciliação Bancária</h1>
          <p className="text-muted-foreground">
            Compare suas transações com o extrato bancário para garantir que tudo esteja correto.
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".ofx"
        />
        <Button 
          onClick={handleFileImportClick}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-300 border border-transparent hover:border-primary/50 flex items-center justify-center font-semibold">
            <Upload className="mr-2 w-5 h-5" />
            Importar Extrato (OFX)
        </Button>
      </div>
      
      {selectedFile && (
        <div className="mb-6 p-4 bg-green-800/20 text-green-300 border border-green-500/30 rounded-lg flex items-center">
            <FileCheck className="w-5 h-5 mr-3" />
            <span>Arquivo <strong>{selectedFile.name}</strong> selecionado com sucesso. Pronto para processamento.</span>
        </div>
      )}

      <div className="bg-card p-6 rounded-2xl border-border">
        <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
            <GitCompareArrows className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground">Pronto para conciliar?</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
                Importe seu extrato bancário no formato OFX para começar a conciliar suas transações registradas com as movimentações do banco.
            </p>
        </div>
      </div>
    </div>
  );
}
