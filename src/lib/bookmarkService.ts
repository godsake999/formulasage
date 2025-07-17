
import { supabase } from './supabaseClient';

export const fetchBookmarkIds = async (userId: string): Promise<number[]> => {
    const { data, error } = await supabase
        .from('bookmarks')
        .select('formula_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching bookmarks:', error.message);
        return [];
    }

    return data.map(item => item.formula_id);
};

export const addBookmark = async (userId: string, formulaId: number): Promise<void> => {
    const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: userId, formula_id: formulaId });

    if (error) {
        console.error('Error adding bookmark:', error);
        throw new Error(error.message);
    }
};

export const removeBookmark = async (userId: string, formulaId: number): Promise<void> => {
    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('formula_id', formulaId);

    if (error) {
        console.error('Error removing bookmark:', error);
        throw new Error(error.message);
    }
};
