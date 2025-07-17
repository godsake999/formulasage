
'use client';

import { useMemo, useContext } from 'react';
import { useFormulas } from '@/contexts/formula-context';
import { useTips } from '@/contexts/tip-context';
import { useAuth } from '@/contexts/auth-context';
import { LanguageContext, content } from '@/contexts/language-context';
import FormulaCard from '@/components/formula-card';
import CategoryCard from '@/components/category-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Formula } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, BarChart2, FolderKanban, Bookmark, History, ThumbsUp, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function Home() {
  const { language } = useContext(LanguageContext);
  const { formulas, bookmarkedFormulas, loading: formulasLoading } = useFormulas();
  const { user } = useAuth();
  const { tips, loading: tipsLoading } = useTips();
  const pageContent = content[language];
  
  const loading = formulasLoading || tipsLoading;

  const { featuredFormulas, categories, formulasByCategory, newAdditionsCount, recentFormulas } = useMemo(() => {
    if (loading || !formulas) return { featuredFormulas: [], categories: [], formulasByCategory: {}, newAdditionsCount: 0, recentFormulas: [] };
    
    // For featured, let's take the first 4 marked as "new", or just the first 4
    const featured = formulas.filter(f => f.isNew).slice(0, 4);
    if (featured.length < 4) {
      featured.push(...formulas.filter(f => !f.isNew).slice(0, 4 - featured.length));
    }

    const grouped: { [key: string]: Formula[] } = {};
    formulas.forEach((formula) => {
      const category = formula.category.en || 'Uncategorized'; // Use English for keying
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(formula);
    });

    const categoryNames = Object.keys(grouped).sort();
    
    const newCount = formulas.filter(f => f.isNew).length;

    // Logic for Quick Access tabs
    const recent = formulas.slice(0, 4);


    return { 
      featuredFormulas: featured, 
      categories: categoryNames,
      formulasByCategory: grouped,
      newAdditionsCount: newCount,
      recentFormulas: recent,
    };
  }, [formulas, loading]);

  if (loading) {
      return (
        <div className="container mx-auto px-4 md:px-6 py-12 space-y-12">
            {/* Featured Skeleton */}
            <div>
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, j) => ( <Skeleton key={j} className="h-48 rounded-lg" /> ))}
                </div>
            </div>
             {/* Overview Skeleton */}
            <div>
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     {[...Array(4)].map((_, j) => ( <Skeleton key={j} className="h-24 rounded-lg" /> ))}
                </div>
            </div>
            {/* Categories Skeleton */}
            <div>
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, j) => ( <Skeleton key={j} className="h-32 rounded-lg" /> ))}
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <section className="text-center py-12 md:py-16">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tighter">
            {pageContent.home.title}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            {pageContent.home.subtitle}
            </p>
        </section>

        {/* Featured Functions */}
        <section className="space-y-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-headline tracking-tight">{pageContent.home.featuredFunctions}</h2>
                <Button asChild variant="link" className="text-primary">
                    <Link href="/formulas">
                        {pageContent.home.viewAll} <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredFormulas.map(formula => (
                    <FormulaCard key={formula.id} formula={formula} />
                ))}
            </div>
        </section>

        {/* Platform Overview */}
        <section className="space-y-8 py-12">
            <div className="text-center">
                 <h2 className="text-3xl font-bold font-headline tracking-tight">{pageContent.home.platformOverview}</h2>
                 <p className="mt-2 text-muted-foreground">{pageContent.home.platformOverviewSubtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="bg-card p-6 rounded-lg shadow">
                    <BarChart2 className="h-10 w-10 text-primary mx-auto mb-4"/>
                    <p className="text-3xl font-bold">{formulas.length}</p>
                    <p className="text-muted-foreground">{pageContent.home.totalFunctions}</p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow">
                    <FolderKanban className="h-10 w-10 text-primary mx-auto mb-4"/>
                    <p className="text-3xl font-bold">{categories.length}</p>
                    <p className="text-muted-foreground">{pageContent.home.uniqueCategories}</p>
                </div>
                 <div className="bg-card p-6 rounded-lg shadow">
                    <ThumbsUp className="h-10 w-10 text-primary mx-auto mb-4"/>
                    <p className="text-3xl font-bold">{tips.length}</p>
                    <p className="text-muted-foreground">{pageContent.home.expertTips}</p>
                </div>
                 <div className="bg-card p-6 rounded-lg shadow">
                    <Star className="h-10 w-10 text-primary mx-auto mb-4"/>
                    <p className="text-3xl font-bold">{newAdditionsCount}</p>
                    <p className="text-muted-foreground">{pageContent.home.newAdditions}</p>
                </div>
            </div>
        </section>

        {/* Function Categories */}
        <section className="space-y-8 py-12">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-headline tracking-tight">{pageContent.home.functionCategories}</h2>
                <Button asChild variant="link" className="text-primary">
                    <Link href="/category">
                        {pageContent.home.viewAll} <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {categories.slice(0, 10).map(category => (
                    <CategoryCard 
                        key={category} 
                        categoryName={language === 'en' ? category : formulasByCategory[category]?.[0]?.category.my || category}
                        englishCategoryName={category}
                        formulaCount={formulasByCategory[category].length}
                    />
                ))}
            </div>
        </section>

        {/* Quick Access */}
        <section className="space-y-8 py-12">
            <div className="text-center">
                 <h2 className="text-3xl font-bold font-headline tracking-tight">{pageContent.home.quickAccess}</h2>
                 <p className="mt-2 text-muted-foreground">{pageContent.home.quickAccessSubtitle}</p>
            </div>
             <Tabs defaultValue="recent" className="w-full max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recent"><History className="mr-2"/>{pageContent.home.recent}</TabsTrigger>
                    <TabsTrigger value="bookmarked"><Bookmark className="mr-2"/>{pageContent.home.bookmarked}</TabsTrigger>
                </TabsList>
                <TabsContent value="recent">
                    <div className="p-4 bg-card rounded-b-lg">
                        {recentFormulas.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentFormulas.map(formula => (
                                    <FormulaCard key={`recent-${formula.id}`} formula={formula} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center">{pageContent.home.noFormulas}</p>
                        )}
                   </div>
                </TabsContent>
                <TabsContent value="bookmarked">
                   <div className="p-4 bg-card rounded-b-lg">
                     {!user ? (
                        <div className="text-center p-8">
                             <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                             <p className="font-semibold">{pageContent.home.loginToViewBookmarks}</p>
                             <p className="text-sm text-muted-foreground">{pageContent.home.loginToViewBookmarksSubtitle}</p>
                             <Button asChild size="sm" className="mt-4">
                                <Link href="/login">{pageContent.nav.login}</Link>
                             </Button>
                        </div>
                     ) : bookmarkedFormulas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookmarkedFormulas.map(formula => (
                                <FormulaCard key={`bookmarked-${formula.id}`} formula={formula} />
                            ))}
                        </div>
                     ) : (
                        <div className="text-center p-8">
                            <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="font-semibold">{pageContent.home.noBookmarks}</p>
                            <p className="text-sm text-muted-foreground">{pageContent.home.noBookmarksSubtitle}</p>
                        </div>
                     )}
                   </div>
                </TabsContent>
            </Tabs>
        </section>

    </div>
  );
}
