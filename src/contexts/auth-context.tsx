'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  // CHANGE 1: Update signature to accept email
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    // We keep this check to verify ADMIN status, but we don't force login with it anymore
    if (!adminEmail) {
      console.warn("Warning: NEXT_PUBLIC_ADMIN_EMAIL environment variable is not set. Admin checks will fail.");
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      // Logic remains: Is the logged-in user the admin?
      setIsAdmin(session?.user?.email === adminEmail); 
      setLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.email === adminEmail);
      if (_event === 'SIGNED_IN' && window.location.pathname === '/login') {
        router.push('/');
      }
      if (_event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [adminEmail, router]);

  // CHANGE 2: Update implementation to use the email argument
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email, // Use the user input email
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
