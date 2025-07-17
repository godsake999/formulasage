
'use client';

import type { Formula } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/language-context';
import { getCategoryIcon } from './category-card';
import { GripVertical, X } from 'lucide-react';
import { parseArguments, cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface BuilderFunctionItemProps {
  id: string;
  formula: Formula;
  args: { [key: string]: string };
  onArgumentChange: (id: string, argName: string, value: string) => void;
  onArgumentFocus: (id: string, argName: string) => void;
  onRemove: () => void;
  activeArgument: { functionId: string; argName: string } | null;
}

export default function BuilderFunctionItem({ id, formula, args, onArgumentChange, onArgumentFocus, onRemove, activeArgument }: BuilderFunctionItemProps) {
  const { language } = useContext(LanguageContext);
  const Icon = getCategoryIcon(formula.category.en);
  const argumentNames = parseArguments(formula.syntax);

  return (
    <Card className="bg-background group/item">
       <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0">
          <div className="flex items-center gap-3 p-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab flex-shrink-0" />
            <div className="p-2 rounded-md bg-primary/10">
              <Icon className="h-5 w-5 text-primary"/>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-sm">{formula.title[language]}</p>
              <code className="text-xs text-muted-foreground">{formula.syntax}</code>
            </div>
            <AccordionTrigger className="p-2 h-7 w-9 hover:no-underline [&[data-state=open]>svg]:rotate-180" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 opacity-0 group-hover/item:opacity-100"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AccordionContent>
            <CardContent className="pt-2 space-y-3">
                {argumentNames.map(argName => {
                    const isActive = activeArgument?.functionId === id && activeArgument?.argName === argName;
                    return (
                        <div key={argName} className="grid grid-cols-3 items-center gap-2">
                            <Label htmlFor={`${id}-${argName}`} className="text-xs text-right pr-2 text-muted-foreground truncate">
                            {argName.replace(/[\[\]]/g, '')}
                            </Label>
                            <Input 
                                id={`${id}-${argName}`}
                                value={args[argName]}
                                onFocus={() => onArgumentFocus(id, argName)}
                                onChange={(e) => onArgumentChange(id, argName, e.target.value)}
                                placeholder={argName.startsWith('[') ? 'optional' : 'required'}
                                className={cn("h-8 col-span-2 text-sm", isActive && "ring-2 ring-primary")}
                            />
                        </div>
                    )
                })}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
