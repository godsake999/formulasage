
'use client';

import Image from 'next/image';
import type { Formula } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContext } from 'react';
import { LanguageContext, content } from '@/contexts/language-context';
import { BookOpen, CheckCircle, BrainCircuit, BarChartHorizontal, ZoomIn } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FormulaCardProps {
  formula: Formula;
}

const difficultyStyles: { [key: string]: string } = {
  Beginner: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-800/30 dark:text-green-200 dark:border-green-600',
  Intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-800/20 dark:text-yellow-200 dark:border-yellow-600',
  Advanced: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-800/20 dark:text-red-200 dark:border-red-600',
  'လွယ်ကူသော': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-800/30 dark:text-green-200 dark:border-green-600',
  'အလယ်အလတ်': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-800/20 dark:text-yellow-200 dark:border-yellow-600',
  'ခက်ခဲသော': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-800/20 dark:text-red-200 dark:border-red-600',
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
    case 'လွယ်ကူသော':
      return <CheckCircle className="h-3 w-3" />;
    case 'Intermediate':
    case 'အလယ်အလတ်':
      return <BarChartHorizontal className="h-3 w-3" />;
    case 'Advanced':
    case 'ခက်ခဲသော':
      return <BrainCircuit className="h-3 w-3" />;
    default:
      return null;
  }
};

export default function FormulaCard({ formula }: FormulaCardProps) {
  const { language } = useContext(LanguageContext);
  const pageContent = content[language];

  const difficulty = formula.difficulty?.[language] || content.en.admin.intermediate;

  return (
    <Link href={`/formulas/${formula.id}`} className="group block h-full">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 group-hover:border-primary/50">
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            {formula.title[language]}
          </CardTitle>
          <CardDescription className="text-sm !mt-1">{formula.category[language]}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {formula.shortDescription[language]}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
            <Badge variant="outline" className={cn("flex items-center gap-1.5", difficultyStyles[difficulty])}>
              {getDifficultyIcon(difficulty)}
              {difficulty}
            </Badge>
          <span className="flex items-center text-sm font-semibold text-primary">
            <BookOpen className="h-4 w-4 mr-2" />
            {pageContent.formulaCard.learnMore}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
