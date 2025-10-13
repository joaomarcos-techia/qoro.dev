'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserAccessInfo } from '@/ai/flows/user-management';
import { UserAccessInfo } from '@/ai/schemas';

type PlanContextType = {
  planId: 'free' | 'growth' | 'performance' | null;
  permissions: UserAccessInfo['permissions'] | null;
  isLoading: boolean;
  error: string | null;
};

const PlanContext = createContext<PlanContextType>({
  planId: null,
  permissions: null,
  isLoading: true,
  error: null,
});

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [planId, setPlanId] = useState<'free' | 'growth' | 'performance' | null>(null);
  const [permissions, setPermissions] = useState<UserAccessInfo['permissions'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
        setPlanId(null);
        setPermissions(null);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    let retries = 0;
    const maxRetries = 10;
    const retryDelay = 3000;

    const fetchPlan = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      
      try {
        const accessInfo = await getUserAccessInfo({ actor: currentUser.uid });
        if (accessInfo) {
          if (isMounted) {
            setPlanId(accessInfo.planId);
            setPermissions(accessInfo.permissions);
            setError(null);
            setIsLoading(false);
          }
        } else {
          throw new Error("User data not ready");
        }
      } catch (err) {
        if (retries < maxRetries) {
          retries++;
          console.log(`User data not ready, retrying... Attempt ${retries}`);
          setTimeout(fetchPlan, retryDelay);
        } else if (isMounted) {
          console.error("Failed to fetch plan info after multiple retries.");
          setError("Não foi possível carregar as informações do seu plano. Por favor, tente recarregar a página.");
          setIsLoading(false);
        }
      }
    };

    fetchPlan();

    return () => {
      isMounted = false; // Cleanup to prevent state updates on unmounted component
    };
  }, [currentUser]);


  return (
    <PlanContext.Provider value={{ planId, permissions, isLoading, error }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
