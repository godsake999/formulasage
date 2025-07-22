

'use client';
export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useContext, useState, useEffect } from 'react';
import { useFormulas } from '@/contexts/formula-context';
import { LanguageContext, content } from '@/contexts/language-context';
import FormulaCard from '@/components/formula-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function AllFormulasPage() {
  const { language } = useContext(LanguageContext);
  const { formulas, loading } = useFormulas();
  const pageContent = content[language];
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for the search input is managed directly in this component
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // This effect updates the URL query parameter as the user types
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchTerm) {
      params.set('q', debouncedSearchTerm);
    } else {
      params.delete('q');
    }
    // Using router.replace to avoid adding to browser history for each keystroke
    router.replace(`/formulas?${params.toString()}`);
  }, [debouncedSearchTerm, router, searchParams]);


  const filteredFormulas = useMemo(() => {
    // The source of truth for filtering is the URL query parameter
    const query = searchParams.get('q') || '';
    if (!query) {
      return formulas;
    }
    const lowercasedTerm = query.toLowerCase();
    return formulas.filter(
      (formula) =>
        formula.title[language].toLowerCase().includes(lowercasedTerm) ||
        formula.shortDescription[language]
          .toLowerCase()
          .includes(lowercasedTerm) ||
        formula.category[language].toLowerCase().includes(lowercasedTerm) ||
        formula.title['en'].toLowerCase().includes(lowercasedTerm) // Also search English title
    );
  }, [searchParams, language, formulas]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
          {pageContent.allFormulas.title}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
           {pageContent.allFormulas.subtitle}
        </p>
      </section>

      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={pageContent.common.searchPlaceholder}
              className="w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>


      {filteredFormulas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredFormulas.map((formula) => (
            <FormulaCard key={formula.id} formula={formula} />
            ))}
        </div>
      ) : (
         <div className="text-center col-span-full py-12">
            <p className="text-muted-foreground">{pageContent.allFormulas.noResults(searchParams.get('q') || '')}</p>
         </div>
      )}
    </div>
  );
}
