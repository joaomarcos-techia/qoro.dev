
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { listTasks } from '@/ai/flows/task-management';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { TaskProfile } from '@/ai/schemas';

interface TasksContextType {
  tasks: TaskProfile[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => void;
}

const TasksContext = createContext<TasksContextType | null>(null);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TaskProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const refreshTasks = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Define an async function inside the effect
    const fetchTasks = async () => {
      // If there is no user, we clear the tasks and stop loading.
      if (!currentUser) {
        setTasks([]);
        setLoading(false);
        return;
      }
      
      console.log('🔄 Tentando carregar tarefas...');
      setLoading(true);
      setError(null);

      try {
        const result = await listTasks({ actor: currentUser.uid });
        // Sort tasks by creation date, newest first
        const sortedTasks = result.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        setTasks(sortedTasks);
        console.log('✅ Tarefas carregadas com sucesso');
      } catch (err: any) {
        console.error('❌ Erro ao carregar tarefas no contexto:', err);
        setError(err.message || 'Erro no servidor. Tente novamente em alguns minutos.');
      } finally {
        setLoading(false);
      }
    };
    
    // Call the async function
    fetchTasks();
  }, [currentUser, refreshTrigger]);
  
  return (
    <TasksContext.Provider value={{ tasks, loading, error, refreshTasks }}>
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
