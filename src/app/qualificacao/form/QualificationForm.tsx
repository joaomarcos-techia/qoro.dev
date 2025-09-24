
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const questions = [
  {
    step: 1,
    section: 'Empresa',
    title: 'Qual o tamanho da sua empresa?',
    type: 'radio',
    key: 'companySize',
    options: ['Micro (até 10)', 'Pequena (11-50)', 'Média (51-200)', 'Grande (201+)'],
  },
  {
    step: 2,
    section: 'Problema',
    title: 'Quais processos internos hoje consomem mais tempo da sua equipe?',
    type: 'textarea',
    key: 'inefficientProcesses',
    placeholder: 'Ex: "Gerenciamento manual de planilhas", "Falta de comunicação entre vendas e financeiro"...',
  },
  {
    step: 3,
    section: 'Problema',
    title: 'Quais ferramentas ou softwares vocês já utilizam no dia a dia?',
    type: 'textarea',
    key: 'currentTools',
    placeholder: 'Ex: "Trello para tarefas, Excel para finanças, WhatsApp para comunicação com clientes"...',
  },
  {
    step: 4,
    section: 'Problema',
    title: 'Em uma escala de 0 a 10, qual é a urgência em resolver esse problema?',
    type: 'radio',
    key: 'urgency',
    options: Array.from({ length: 11 }, (_, i) => i.toString()),
    isScale: true,
  },
  {
    step: 5,
    section: 'Serviço',
    title: 'Em quais serviços você tem mais interesse?',
    subtitle: 'Selecione uma ou mais opções.',
    type: 'checkbox',
    key: 'interestedServices',
    options: [
      { category: 'Automação e Eficiência', items: ['Automação de processos internos', 'Integração entre sistemas já existentes'] },
      { category: 'Inteligência Artificial', items: ['Criação de agente de IA personalizado', 'Chatbots de atendimento', 'Geração de análises e insights automatizados'] },
      { category: 'Desenvolvimento', items: ['Criação de SaaS sob medida'] },
    ],
  },
  {
    step: 6,
    section: 'Investimento',
    title: 'Em qual faixa de investimento você estaria confortável para este projeto?',
    type: 'radio',
    key: 'investmentRange',
    options: ['Até R$ 2.000', 'R$ 2.000 – R$ 5.000', 'R$ 5.000 – R$ 10.000', 'Acima de R$ 10.000', 'Ainda não tenho uma ideia clara'],
  },
  {
    step: 7,
    section: 'Expectativa',
    title: 'O que você gostaria de alcançar com essa solução?',
    type: 'textarea',
    key: 'desiredOutcome',
    placeholder: 'Ex: "Reduzir custos em 20%", "Ganhar 5 horas por semana", "Aumentar as vendas em 15%", "Melhorar a produtividade da equipe"...',
  },
  {
    step: 8,
    section: 'Contato',
    title: 'Excelente! Estamos quase lá. Faltam apenas seus dados para contato.',
    type: 'contact',
    keys: ['fullName', 'role', 'email'],
  },
];

const totalSteps = questions.length;

export default function QualificationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setAnswers({ ...answers, [key]: value });
  };
  
  const handleCheckboxChange = (category: string, item: string, checked: boolean) => {
    const key = 'interestedServices';
    const currentServices = answers[key] || {};
    const categoryServices = currentServices[category] || [];

    let newCategoryServices;
    if (checked) {
        newCategoryServices = [...categoryServices, item];
    } else {
        newCategoryServices = categoryServices.filter((s: string) => s !== item);
    }
    
    handleInputChange(key, { ...currentServices, [category]: newCategoryServices });
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulating an API call
    console.log('Form Submitted:', answers);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    router.push('/qualificacao/obrigado');
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="p-4">
        <Progress value={progress} className="w-full" />
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-semibold mb-2">{currentQuestion.section}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{currentQuestion.title}</h1>
            {currentQuestion.subtitle && <p className="text-muted-foreground mt-2">{currentQuestion.subtitle}</p>}
          </div>

          <div className="min-h-[250px]">
            {currentQuestion.type === 'radio' && (
              <RadioGroup
                value={answers[currentQuestion.key] || ''}
                onValueChange={(value) => handleInputChange(currentQuestion.key, value)}
                className={`grid ${currentQuestion.isScale ? 'grid-cols-6' : 'grid-cols-1 md:grid-cols-2'} gap-4`}
              >
                {currentQuestion.options.map((option) => (
                  <Label key={option} className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${answers[currentQuestion.key] === option ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value={option} id={option} className="sr-only" />
                    <span>{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'textarea' && (
              <Textarea
                value={answers[currentQuestion.key] || ''}
                onChange={(e) => handleInputChange(currentQuestion.key, e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="min-h-[150px] text-lg"
              />
            )}

            {currentQuestion.type === 'checkbox' && (
              <div className="space-y-6">
                {currentQuestion.options.map(({ category, items }) => (
                  <div key={category}>
                    <h3 className="font-semibold text-lg mb-3">{category}</h3>
                    <div className="space-y-3 pl-2">
                      {items.map((item) => (
                        <Label key={item} className="flex items-center space-x-3 cursor-pointer text-base">
                          <Checkbox
                            id={item}
                            checked={answers[currentQuestion.key]?.[category]?.includes(item) || false}
                            onCheckedChange={(checked) => handleCheckboxChange(category, item, !!checked)}
                          />
                          <span>{item}</span>
                        </Label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'contact' && (
              <div className="space-y-4">
                <Input placeholder="Nome Completo" value={answers['fullName'] || ''} onChange={(e) => handleInputChange('fullName', e.target.value)} className="h-12 text-base"/>
                <Input placeholder="Cargo" value={answers['role'] || ''} onChange={(e) => handleInputChange('role', e.target.value)} className="h-12 text-base"/>
                <Input type="email" placeholder="E-mail" value={answers['email'] || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="h-12 text-base"/>
              </div>
            )}
          </div>

          <div className="mt-12 flex items-center justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            {currentStep < totalSteps - 1 ? (
              <Button onClick={handleNext}>
                Avançar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isLoading ? 'Enviando...' : 'Enviar Respostas'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
