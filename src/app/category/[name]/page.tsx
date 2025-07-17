
'use client';

import { useMemo, useContext } from 'react';
import { useFormulas } from '@/contexts/formula-context';
import { LanguageContext, content } from '@/contexts/language-context';
import FormulaCard from '@/components/formula-card';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryDetailPage() {
  const params = useParams();
  const { language } = useContext(LanguageContext);
  const { formulas, loading } = useFormulas();
  const pageContent = content[language];

  const name = Array.isArray(params.name) ? params.name[0] : params.name;
  const categoryName = name ? decodeURIComponent(name) : '';

  const { formulasInCategory, displayedCategoryName } = useMemo(() => {
    if (!categoryName) return { formulasInCategory: [], displayedCategoryName: '' };
    
    const filteredFormulas = formulas.filter(
      (formula) => formula.category.en.toLowerCase() === categoryName.toLowerCase()
    );

    if (filteredFormulas.length === 0) {
      return { formulasInCategory: [], displayedCategoryName: categoryName };
    }

    // Determine the displayed name based on the current language
    const firstFormula = filteredFormulas[0];
    const displayName = firstFormula.category[language] || categoryName;

    return { formulasInCategory: filteredFormulas, displayedCategoryName: displayName };
  }, [categoryName, language, formulas]);

  const isCategoryValid = useMemo(() => {
    return formulas.some(f => f.category.en.toLowerCase() === categoryName.toLowerCase())
  }, [formulas, categoryName]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-8 w-3/4 mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, j) => ( <Skeleton key={j} className="h-48 rounded-lg" /> ))}
            </div>
        </div>
    )
  }
  
  if (!categoryName || (!loading && !isCategoryValid)) {
     notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
            <Button asChild variant="outline" size="sm">
                <Link href="/category">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    {pageContent.category.backToCategories}
                </Link>
            </Button>
        </div>

       <section className="pb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
          {displayedCategoryName}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
           {pageContent.category.categorySubtitle(displayedCategoryName)}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {formulasInCategory.map((formula) => (
          <FormulaCard key={formula.id} formula={formula} />
        ))}
      </div>
    </div>
  );
}
