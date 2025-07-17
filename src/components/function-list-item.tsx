
'use client';

import type { Formula } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/language-context';
import { getCategoryIcon } from './category-card';
import { Plus } from 'lucide-react';

interface FunctionListItemProps {
  formula: Formula;
}

export default function FunctionListItem({ formula }: FunctionListItemProps) {
  const { language } = useContext(LanguageContext);
  const Icon = getCategoryIcon(formula.category.en);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('formulaId', formula.id.toString());
  };

  return (
    <Card 
      className="group cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md hover:border-primary/50"
      draggable="true"
      onDragStart={handleDragStart}
    >
        <div className="flex items-start p-4">
            <div className="p-3 rounded-md bg-primary/10 mr-4">
                <Icon className="h-6 w-6 text-primary"/>
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{formula.title[language]}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{formula.shortDescription[language]}</p>
                <code className="text-xs text-accent mt-1 block font-semibold">{formula.syntax}</code>
            </div>
            <div className="p-2 rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-4 w-4"/>
            </div>
        </div>
    </Card>
  );
}
