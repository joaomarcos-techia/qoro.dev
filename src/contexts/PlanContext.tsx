'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getUserAccessInfo } from '@/ai/flows/user-management';
import { AppPermissions } from '@/ai/schemas';

type PlanContextType = {
  planId: 'free' | 'growth' | 'performance' | null;
  permissions: AppPermissions | null;
  role: 'admin' | 'member' | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

const PlanContext = createContext<PlanContextType>({
  planId: null,
  permissions: null,
  role: null,
  isLoading: true,
  error: null,
  refetch: () => {},
});

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [planId, setPlanId] = useState<'free' | 'growth' | 'performance' | null>(null);
  const [permissions, setPermissions] = useState<AppPermissions | null>(null);
  const [role, setRole] = useState<'admin' | 'member' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
       if (!user) {
        setIsLoading(false);
        setPlanId(null);
        setPermissions(null);
        setRole(null);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);
  
  const fetchPlan = useCallback(async (user: FirebaseUser) => {
    try {
        const accessInfo = await getUserAccessInfo({ actor: user.uid });
        if (accessInfo) {
            setPlanId(accessInfo.planId);
            setPermissions(accessInfo.permissions);
            setRole(accessInfo.role);
            setError(null);
            setIsLoading(false);
        } else {
           throw new Error("User data not ready");
        }
    } catch (err) {
        console.error("Failed to fetch plan info:", err);
        setError("USER_DATA_NOT_FOUND");
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Real-time update from user document:", data.planId);
            
            // Force refresh the ID token to get the latest custom claims
            await currentUser.getIdToken(true);
            
            // Re-fetch the access info which relies on the new claims
            const accessInfo = await getUserAccessInfo({ actor: currentUser.uid });
            if (accessInfo) {
                setPlanId(accessInfo.planId);
                setPermissions(accessInfo.permissions);
                setRole(accessInfo.role);
                setError(null);
            }
        } else {
             console.log("User document does not exist yet, waiting...");
        }
        setIsLoading(false); // Set loading to false after first check
    }, (err) => {
        console.error("Error listening to user document:", err);
        setError("Não foi possível sincronizar os dados da sua conta.");
        setIsLoading(false);
    });

    // Initial fetch for immediate feedback
    fetchPlan(currentUser);

    return () => unsubscribe();
}, [currentUser, fetchPlan]);


  return (
    <PlanContext.Provider value={{ planId, permissions, role, isLoading, error, refetch }}>
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
