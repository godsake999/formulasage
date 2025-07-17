

export type Language = 'en' | 'my';

export type LanguageData = {
  [key in Language]: string;
}

export type LanguageDataArray = {
  [key in Language]: string[];
}

export type Example = {
  code: string;
  explanation: LanguageData;
  imageUrl?: string;
}

export type Formula = {
  id: number;
  created_at?: string;
  title: LanguageData;
  category: LanguageData;
  shortDescription: LanguageData;
  longDescription: LanguageDataArray;
  syntax: string;
  syntaxBreakdown?: LanguageDataArray;
  examples: Example[];
  isNew?: boolean;
  difficulty?: LanguageData;
};

// This mock data is now deprecated and will not be used.
// The application fetches data directly from Supabase.
export const formulas: Formula[] = [];

    