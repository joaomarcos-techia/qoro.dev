
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserAccessInfo } from '@/ai/flows/user-management';
import { UserAccessInfo } from '@/ai/schemas';

type PlanContextType = {
  planId: 'free' | 'growth' | 'performance' | null;
  permissions: UserAccessInfo['permissions'] | null;
  isLoading: boolean;
};

const PlanContext = createContext<PlanContextType | null>(null);

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [planId, setPlanId] = useState<'free' | 'growth' | 'performance' | null>(null);
  const [permissions, setPermissions] = useState<UserAccessInfo['permissions'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setIsLoading(false);
        setPlanId(null);
        setPermissions(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!currentUser) return;

      setIsLoading(true);
      try {
        const accessInfo = await getUserAccessInfo({ actor: currentUser.uid });
        setPlanId(accessInfo.planId);
        setPermissions(accessInfo.permissions);
      } catch (error) {
        console.error("Failed to fetch plan info:", error);
        // Fallback to free plan on error
        setPlanId('free');
        setPermissions({ qoroCrm: true, qoroPulse: true, qoroTask: true, qoroFinance: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [currentUser]);

  return (
    <PlanContext.Provider value={{ planId, permissions, isLoading }}>
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
