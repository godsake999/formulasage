
'use client';

import { useMemo, useContext, useState } from 'react';
import { useFormulas } from '@/contexts/formula-context';
import { LanguageContext, content } from '@/contexts/language-context';
import FormulaCard from '@/components/formula-card';
import CategoryCard from '@/components/category-card';
import type { Formula } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';


export default function CategoriesPage() {
  const { language } = useContext(LanguageContext);
  const { formulas, loading } = useFormulas();
  const pageContent = content[language];

  const { categories, formulasByCategory, beginnerFormulas, intermediateFormulas, advancedFormulas } = useMemo(() => {
    if (loading || !formulas) return { categories: [], formulasByCategory: {}, beginnerFormulas: [], intermediateFormulas: [], advancedFormulas: [] };

    const grouped: { [key: string]: Formula[] } = {};
    const beginner: Formula[] = [];
    const intermediate: Formula[] = [];
    const advanced: Formula[] = [];

    formulas.forEach((formula) => {
      const category = formula.category.en || 'Uncategorized'; // Use English for keying
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(formula);

      switch(formula.difficulty?.en) {
        case 'Beginner':
            beginner.push(formula);
            break;
        case 'Intermediate':
            intermediate.push(formula);
            break;
        case 'Advanced':
            advanced.push(formula);
            break;
      }
    });

    const categoryNames = Object.keys(grouped).sort();

    return { 
      categories: categoryNames,
      formulasByCategory: grouped,
      beginnerFormulas: beginner,
      intermediateFormulas: intermediate,
      advancedFormulas: advanced,
    };
  }, [formulas, loading]);

  if (loading) {
      return (
         <div className="container mx-auto px-4 md:px-6 py-8">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-8 w-3/4 mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, j) => ( <Skeleton key={j} className="h-48 rounded-lg" /> ))}
            </div>
         </div>
      )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
       <section className="pb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
          {pageContent.category.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
           {pageContent.category.subtitle}
        </p>
      </section>

       <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="all">{pageContent.category.allCategories}</TabsTrigger>
                <TabsTrigger value="beginner">{pageContent.category.beginner}</TabsTrigger>
                <TabsTrigger value="intermediate">{pageContent.category.intermediate}</TabsTrigger>
                <TabsTrigger value="advanced">{pageContent.category.advanced}</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {categories.map(category => (
                        <CategoryCard 
                            key={category} 
                            categoryName={language === 'en' ? category : formulasByCategory[category]?.[0]?.category.my || category}
                            englishCategoryName={category}
                            formulaCount={formulasByCategory[category].length}
                        />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="beginner">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {beginnerFormulas.map((formula) => (
                        <FormulaCard key={formula.id} formula={formula} />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="intermediate">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {intermediateFormulas.map((formula) => (
                        <FormulaCard key={formula.id} formula={formula} />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="advanced">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {advancedFormulas.map((formula) => (
                        <FormulaCard key={formula.id} formula={formula} />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
