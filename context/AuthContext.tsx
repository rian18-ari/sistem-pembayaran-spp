'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, Parent } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { SEED_PARENTS } from '@/lib/seed-data';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentParent: Parent | null;
  setCurrentParent: (parent: Parent | null) => void;
  availableParents: Parent[];
  userName: string;
  userEmail: string;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin');
  const [availableParents, setAvailableParents] = useState<Parent[]>(SEED_PARENTS);
  const [currentParent, setCurrentParentState] = useState<Parent | null>(SEED_PARENTS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load parents from Firestore or fallback to seed data
  const loadParents = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'parents'));
      if (!snap.empty) {
        const parentsList: Parent[] = [];
        snap.forEach((d) => {
          parentsList.push({ id: d.id, ...d.data() } as Parent);
        });
        setAvailableParents(parentsList);
        setCurrentParentState((prev) => prev || parentsList[0]);
      }
    } catch (e) {
      console.warn('Using local initial parents:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const snap = await getDocs(collection(db, 'parents'));
        if (!snap.empty && active) {
          const parentsList: Parent[] = [];
          snap.forEach((d) => {
            parentsList.push({ id: d.id, ...d.data() } as Parent);
          });
          setAvailableParents(parentsList);
          setCurrentParentState((prev) => prev || parentsList[0]);
        }
      } catch (e) {
        console.warn('Using local initial parents:', e);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void init();
    return () => {
      active = false;
    };
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
  };

  const setCurrentParent = (parent: Parent | null) => {
    setCurrentParentState(parent);
  };

  const userName = role === 'admin' 
    ? 'Ust. Burhanuddin, S.E. (Bendahara)' 
    : currentParent?.name || 'Wali Santri';

  const userEmail = role === 'admin'
    ? 'keuangan@darulilmi.sch.id'
    : currentParent?.email || 'wali@darulilmi.sch.id';

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        currentParent,
        setCurrentParent,
        availableParents,
        userName,
        userEmail,
        isLoading,
        refreshData: loadParents,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
