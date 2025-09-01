
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
       // When user logs out, clear data and stop loading.
      if (!user) {
        setTasks([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // This function will only run when currentUser or refreshTrigger changes.
    const fetchTasks = async () => {
      // Guard clause: If there is no user, do nothing.
      if (!currentUser) {
        setLoading(false); // Ensure loading is false if there's no user
        return;
      }
      
      console.log('🔄 Tentando carregar tarefas...');
      setLoading(true);
      setError(null);
      try {
        const result = await listTasks({ actor: currentUser.uid });
        const sortedTasks = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTasks(sortedTasks);
        console.log('✅ Tarefas carregadas com sucesso');
      } catch (err: any) {
        console.error('❌ Erro ao carregar tarefas no contexto:', err);
        setError(err.message || 'Erro no servidor. Tente novamente em alguns minutos.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser, refreshTrigger]); // This effect now correctly depends on the user and the trigger.

  // This function is now stable and will not cause re-renders.
  const refreshTasks = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
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
