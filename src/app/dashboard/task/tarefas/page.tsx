'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskTable } from '@/components/dashboard/task/TaskTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/dashboard/task/TaskForm';

export default function TarefasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    setRefreshCounter(prev => prev + 1); // Trigger a refresh
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Minhas Tarefas</h1>
          <p className="text-gray-600">
            Crie e gerencie todas as suas atividades e projetos.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover flex items-center justify-center font-semibold">
              <PlusCircle className="mr-2 w-5 h-5" />
              Criar Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para adicionar uma nova tarefa.
              </DialogDescription>
            </DialogHeader>
            <TaskForm onTaskCreated={handleTaskCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
        <TaskTable key={refreshCounter} />
      </div>
    </div>
  );
}
