
'use client';

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import type { Tip } from '@/lib/tips-data';
import { supabase } from '@/lib/supabaseClient';
import { addTip as addTipService, updateTip as updateTipService, deleteTip as deleteTipService } from '@/lib/tipService';

// This function converts the flat data structure from Supabase
// into the nested object structure our application uses.
const fromSupabase = (row: any): Tip => {
    if (!row) return {} as Tip;
    return {
        id: row.id,
        created_at: row.created_at,
        title: { en: row.title_en, my: row.title_my },
        oldMethodTitle: { en: row.old_method_title_en, my: row.old_method_title_my },
        oldMethodDesc: { en: row.old_method_desc_en || [], my: row.old_method_desc_my || [] },
        newMethodTitle: { en: row.new_method_title_en, my: row.new_method_title_my },
        newMethodDesc: { en: row.new_method_desc_en || [], my: row.new_method_desc_my || [] },
        details: { en: row.details_en || [], my: row.details_my || [] },
        exampleCode: row.example_code,
        visualExplanation: { imageUrl: row.image_url || '' },
    };
};

interface TipContextType {
  tips: Tip[];
  loading: boolean;
  addTip: (tip: Omit<Tip, 'created_at'>, file: File | null) => Promise<void>;
  updateTip: (id: number, tip: Partial<Omit<Tip, 'created_at'>>, file: File | null) => Promise<void>;
  deleteTip: (id: number) => Promise<void>;
}

export const TipContext = createContext<TipContextType | undefined>(undefined);

export const TipProvider = ({ children }: { children: ReactNode }) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const { data, error } = await supabase
          .from('tips')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tips:', error);
          throw new Error(error.message);
        }

        setTips(data.map(fromSupabase));
      } catch (error) {
        console.error("Failed to fetch tips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  const addTip = async (tip: Omit<Tip, 'created_at'>, file: File | null) => {
    const newTip = await addTipService(tip, file);
    setTips(prev => [newTip, ...prev]);
  };

  const updateTip = async (id: number, tip: Partial<Omit<Tip, 'created_at'>>, file: File | null) => {
    const updatedTip = await updateTipService(id, tip, file);
    setTips(prev => prev.map(f => f.id === id ? updatedTip : f));
  };

  const deleteTip = async (id: number) => {
    await deleteTipService(id);
    setTips(prev => prev.filter(f => f.id !== id));
  };


  return (
    <TipContext.Provider value={{ tips, loading, addTip, updateTip, deleteTip }}>
      {children}
    </TipContext.Provider>
  );
};

export const useTips = () => {
    const context = useContext(TipContext);
    if (!context) {
        throw new Error('useTips must be used within a TipProvider');
    }
    return context;
}
