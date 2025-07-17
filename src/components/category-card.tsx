
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, ArrowRight, Calculator, Filter, BarChart, Calendar, Database, Search, Text, Clock, CircleDollarSign } from 'lucide-react';
import React from 'react';

interface CategoryCardProps {
    categoryName: string;
    englishCategoryName: string;
    formulaCount: number;
}

const iconMap: { [key: string]: React.ElementType } = {
    'math': Calculator,
    'trig': Calculator,
    'statistical': BarChart,
    'lookup': Search,
    'reference': Search,
    'database': Database,
    'text': Text,
    'logical': Filter,
    'information': Filter,
    'date': Calendar,
    'time': Clock,
    'financial': CircleDollarSign,
};

export const getCategoryIcon = (categoryName: string): React.ElementType => {
    const lowerCaseName = categoryName.toLowerCase();
    for (const key in iconMap) {
        if (lowerCaseName.includes(key)) {
            return iconMap[key];
        }
    }
    return FolderKanban; // Default icon
};


export default function CategoryCard({ categoryName, englishCategoryName, formulaCount }: CategoryCardProps) {
  const Icon = getCategoryIcon(englishCategoryName);
  
  return (
    <Link href={`/category/${encodeURIComponent(englishCategoryName)}`} className="group block h-full">
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/30">
            <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2"/>
                <CardTitle className="font-headline text-base truncate">{categoryName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground">{formulaCount} Functions</p>
            </CardContent>
            <CardFooter>
                 <span className="flex items-center text-xs font-semibold text-primary/80 group-hover:text-primary">
                    View Category <ArrowRight className="ml-2 h-4 w-4"/>
                </span>
            </CardFooter>
        </Card>
    </Link>
  );
}
