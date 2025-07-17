
'use client';

import { useMemo, useContext } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { useFormulas } from '@/contexts/formula-context';
import { useAuth } from '@/contexts/auth-context';
import { LanguageContext, content } from '@/contexts/language-context';
import type { Formula } from '@/lib/data';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, BarChartHorizontal, BrainCircuit, BookOpen, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import FormulaCard from '@/components/formula-card';
import { useToast } from '@/hooks/use-toast';

const difficultyStyles: { [key: string]: string } = {
  Beginner: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700',
  Advanced: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700',
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return <CheckCircle className="h-4 w-4" />;
    case 'Intermediate':
      return <BarChartHorizontal className="h-4 w-4" />;
    case 'Advanced':
      return <BrainCircuit className="h-4 w-4" />;
    default:
      return null;
  }
};


export default function FormulaDetailPage() {
  const params = useParams();
  const { formulas, loading, isBookmarked, toggleBookmark } = useFormulas();
  const { user } = useAuth();
  const { language } = useContext(LanguageContext);
  const { toast } = useToast();

  const formulaId = Number(params.id);

  const { formula, relatedFormulas } = useMemo(() => {
    const currentFormula = formulas.find((f) => f.id === formulaId);
    if (!currentFormula) return { formula: null, relatedFormulas: [] };

    const related = formulas
      .filter((f) => f.id !== formulaId && f.category[language] === currentFormula.category[language])
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, 3);
    
    return { formula: currentFormula, relatedFormulas: related };
  }, [formulaId, formulas, language]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to bookmark formulas.",
        variant: "destructive"
      });
      return;
    }
    await toggleBookmark(formulaId);
  }


  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-80px)]">Loading...</div>;
  }
  
  if (!formula) {
    notFound();
  }

  const difficulty = formula.difficulty?.[language] || 'Intermediate';
  const bookmarked = isBookmarked(formulaId);

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 flex justify-between items-center">
            <Button asChild variant="outline" size="sm">
                <Link href="/formulas">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Functions
                </Link>
            </Button>
            {user && (
                 <Button variant={bookmarked ? "default" : "outline"} size="sm" onClick={handleBookmarkToggle}>
                    <Bookmark className={cn("mr-2 h-4 w-4", bookmarked && "fill-current")}/>
                    {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/category/${encodeURIComponent(formula.category.en)}`} className="text-sm font-medium hover:underline text-primary">
                            {formula.category[language]}
                        </Link>
                        <Badge className={cn("flex items-center gap-1.5 text-sm", difficultyStyles[formula.difficulty?.en || 'Beginner'])}>
                          {getDifficultyIcon(formula.difficulty?.en || 'Beginner')}
                          {difficulty}
                        </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
                        {formula.title[language]}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {formula.shortDescription[language]}
                    </p>
                </div>
                
                 {/* Long Description */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {(Array.isArray(formula.longDescription?.[language]) ? formula.longDescription[language] : []).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                  ))}
                </div>
                
                <Separator/>

                {/* Syntax & Breakdown */}
                <div>
                  <h2 className="text-3xl font-bold font-headline mb-4">Syntax</h2>
                  <Card>
                    <CardContent className="pt-6">
                       <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                          <code className="font-code text-base text-foreground">
                          {formula.syntax}
                          </code>
                      </pre>
                      {(formula.syntaxBreakdown?.[language]?.length ?? 0) > 0 && (
                        <>
                          <h3 className="text-xl font-bold font-headline my-4">Breakdown</h3>
                          <ul className="space-y-3">
                            {(Array.isArray(formula.syntaxBreakdown?.[language]) ? formula.syntaxBreakdown[language] : []).map((item, index) => {
                                const parts = item.split(':');
                                const argument = parts[0];
                                const description = parts.slice(1).join(':');
                                return (
                                    <li key={index} className="flex">
                                        <code className="font-code text-sm font-semibold w-36 shrink-0">{argument}</code>
                                        <p className="text-sm text-muted-foreground">{description}</p>
                                    </li>
                                )
                            })}
                          </ul>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Separator/>

                {/* Examples */}
                <div>
                   <h2 className="text-3xl font-bold font-headline mb-4">Examples</h2>
                    <Card>
                      <CardContent className="pt-6 space-y-8">
                        {(formula.examples || []).map((example, index) => (
                          <div key={index}>
                            <h3 className="text-xl font-bold font-headline mb-4">Example {index + 1}</h3>
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                                <code className="font-code text-base text-foreground">
                                {example.code}
                                </code>
                            </pre>
                            <p className="mt-4 text-muted-foreground">{example.explanation[language]}</p>
                            
                            {example.imageUrl && (
                              <div className="mt-6">
                                  <h4 className="text-lg font-semibold font-headline mb-2">Visual Explanation</h4>
                                  <div className="aspect-video bg-muted relative border rounded-lg overflow-hidden">
                                    <Image
                                        src={example.imageUrl}
                                        alt={`Visual explanation for example ${index + 1} of ${formula.title['en']}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                  </div>
                              </div>
                            )}

                            {index < (formula.examples || []).length - 1 && <Separator className="mt-8" />}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
                {relatedFormulas.length > 0 && (
                     <div>
                        <h3 className="text-xl font-bold font-headline mb-4">Related Functions</h3>
                        <div className="space-y-4">
                        {relatedFormulas.map((relatedFormula) => (
                           <Link href={`/formulas/${relatedFormula.id}`} key={relatedFormula.id} className="block group">
                             <Card className="transition-all duration-200 group-hover:border-primary group-hover:bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">{relatedFormula.title[language]}</CardTitle>
                                    <CardDescription className="line-clamp-2">{relatedFormula.shortDescription[language]}</CardDescription>
                                </CardHeader>
                             </Card>
                           </Link>
                        ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
