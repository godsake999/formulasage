
'use client';

import React, { createContext, useState, ReactNode, useContext, useEffect, useMemo, useCallback } from 'react';
import { type Formula } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './auth-context';
import { addFormula as addFormulaService, updateFormula as updateFormulaService, deleteFormula as deleteFormulaService } from '@/lib/formulaService';
import { fetchBookmarkIds as fetchBookmarkIdsService, addBookmark as addBookmarkService, removeBookmark as removeBookmarkService } from '@/lib/bookmarkService';

// This function converts the flat data structure from Supabase
// into the nested object structure our application uses.
const fromSupabase = (row: any): Formula => {
  if (!row) return {} as Formula;
  const formula: Formula = {
    id: row.id,
    created_at: row.created_at,
    title: { en: row.title_en, my: row.title_my },
    category: { en: row.category_en, my: row.category_my },
    shortDescription: { en: row.short_description_en, my: row.short_description_my },
    longDescription: { en: row.long_description_en || [], my: row.long_description_my || [] },
    syntax: row.syntax,
    syntaxBreakdown: { en: row.syntax_breakdown_en || [], my: row.syntax_breakdown_my || [] },
    examples: row.examples || [], // This is now an array of objects
    isNew: row.is_new,
    difficulty: { en: row.difficulty_en || 'Beginner', my: row.difficulty_my || 'လွယ်ကူသော' },
  };

  return formula;
};


interface FormulaContextType {
  formulas: Formula[];
  loading: boolean;
  addFormula: (formula: Omit<Formula, 'created_at'>, files: (File | null)[]) => Promise<Formula>;
  updateFormula: (id: number, formula: Partial<Omit<Formula, 'created_at'>>, files: (File | null)[]) => Promise<void>;
  deleteFormula: (id: number) => Promise<void>;
  bookmarkedFormulas: Formula[];
  isBookmarked: (formulaId: number) => boolean;
  toggleBookmark: (formulaId: number) => Promise<void>;
}

export const FormulaContext = createContext<FormulaContextType | undefined>(undefined);

export const FormulaProvider = ({ children }: { children: ReactNode }) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const { user } = useAuth();


  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const { data, error } = await supabase
          .from('formulas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching formulas:', error);
          throw new Error(error.message);
        }

        setFormulas(data.map(fromSupabase));
      } catch (error) {
        console.error("Failed to fetch formulas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFormulas();
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
        if (user) {
            const ids = await fetchBookmarkIdsService(user.id);
            setBookmarkedIds(new Set(ids));
        } else {
            setBookmarkedIds(new Set());
        }
    };
    fetchBookmarks();
  }, [user]);

  const addFormula = async (formula: Omit<Formula, 'created_at'>, files: (File | null)[]) => {
    const newFormula = await addFormulaService(formula, files);
    setFormulas(prev => [newFormula, ...prev]);
    return newFormula;
  };

  const updateFormula = async (id: number, formula: Partial<Omit<Formula, 'created_at'>>, files: (File | null)[]) => {
    const updatedFormula = await updateFormulaService(id, formula, files);
    setFormulas(prev => prev.map(f => f.id === id ? updatedFormula : f));
  };

  const deleteFormula = async (id: number) => {
    await deleteFormulaService(id);
    setFormulas(prev => prev.filter(f => f.id !== id));
  };

  const isBookmarked = useCallback((formulaId: number) => {
    return bookmarkedIds.has(formulaId);
  }, [bookmarkedIds]);

  const toggleBookmark = async (formulaId: number) => {
    if (!user) return;
    const currentlyBookmarked = isBookmarked(formulaId);
    if (currentlyBookmarked) {
        await removeBookmarkService(user.id, formulaId);
        setBookmarkedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(formulaId);
            return newSet;
        });
    } else {
        await addBookmarkService(user.id, formulaId);
        setBookmarkedIds(prev => {
            const newSet = new Set(prev);
            newSet.add(formulaId);
            return newSet;
        });
    }
  };

  const bookmarkedFormulas = useMemo(() => {
    return formulas.filter(formula => bookmarkedIds.has(formula.id));
  }, [formulas, bookmarkedIds]);


  return (
    <FormulaContext.Provider value={{ formulas, loading, addFormula, updateFormula, deleteFormula, bookmarkedFormulas, isBookmarked, toggleBookmark }}>
      {children}
    </FormulaContext.Provider>
  );
};

export const useFormulas = () => {
    const context = useContext(FormulaContext);
    if (!context) {
        throw new Error('useFormulas must be used within a FormulaProvider');
    }
    return context;
}
