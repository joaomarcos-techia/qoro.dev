'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { listTasks } from '@/ai/flows/task-management';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { TaskProfile } from '@/ai/schemas';


interface TasksContextType {
  tasks: TaskProfile[];
  loading: boolean;
  error: string | null;
  loadTasks: (actorUid: string) => Promise<void>;
  resetError: () => void;
}

const TasksContext = createContext<TasksContextType | null>(null);

class CircuitBreaker {
  private failures = 0;
  private nextAttempt = Date.now();
  private timeout = 60000; // 1 minuto
  private maxFailures = 3; 

  canAttempt(): boolean {
    if (this.failures >= this.maxFailures) {
      if (Date.now() >= this.nextAttempt) {
        this.failures = 0; // Reset after timeout
        return true;
      }
      return false;
    }
    return true;
  }

  recordFailure(): void {
    this.failures++;
    if (this.failures >= this.maxFailures) {
      this.nextAttempt = Date.now() + this.timeout;
      console.log(`🚨 Circuit breaker ativo. Próxima tentativa em ${this.timeout / 1000}s`);
    }
  }

  recordSuccess(): void {
    this.failures = 0;
  }

  getTimeUntilNextAttempt(): number {
    return Math.max(0, this.nextAttempt - Date.now());
  }
}

const circuitBreaker = new CircuitBreaker();

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TaskProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async (actorUid: string) => {
    // A verificação `loading` foi removida daqui para evitar dependência no useCallback.
    // A lógica de bloqueio de chamada múltipla ainda funciona porque o botão/trigger fica desabilitado com o estado `loading`.
    
    if (!circuitBreaker.canAttempt()) {
      const timeLeft = Math.ceil(circuitBreaker.getTimeUntilNextAttempt() / 1000);
      const errorMessage = `Muitas tentativas falharam. Aguarde ${timeLeft}s.`;
      setError(errorMessage);
      console.log(`⛔ Circuit breaker bloqueou tentativa. ${timeLeft}s restantes.`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Tentando carregar tarefas...');
      const result = await listTasks({ actor: actorUid });
      // Sort tasks on the client-side after fetching
      const sortedTasks = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTasks(sortedTasks);
      circuitBreaker.recordSuccess();
      console.log('✅ Tarefas carregadas com sucesso');
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar tarefas no contexto:', err);
      circuitBreaker.recordFailure();
      setError(err.message || 'Erro no servidor. Tente novamente em alguns minutos.');
    } finally {
      setLoading(false);
    }
  }, []); // Array de dependências VAZIO para garantir que a função NUNCA seja recriada.

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <TasksContext.Provider value={{ 
      tasks, 
      loading, 
      error, 
      loadTasks, 
      resetError 
    }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks deve ser usado dentro de TasksProvider');
  }
  return context;
};
