
'use client';

import { useState, useMemo, useContext, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LanguageContext, content } from '@/contexts/language-context';
import { useFormulas } from '@/contexts/formula-context';
import { Search, Wrench, FileText, Trash2, Bookmark, RefreshCw, MousePointer, Sparkles, Loader } from 'lucide-react';
import FunctionListItem from '@/components/function-list-item';
import SampleDataTable from '@/components/sample-data-table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Formula } from '@/lib/data';
import BuilderFunctionItem from '@/components/builder-function-item';
import { parseArguments } from '@/lib/utils';
import { calculateFormula } from '@/ai/flows/calculate-formula-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface BuiltFunction {
  id: string; // Unique ID for this instance in the builder
  formula: Formula;
  args: { [key: string]: string };
}

const sampleData = [
  { A: 10, B: 20, C: 30, D: 'Product A' },
  { A: 15, B: 25, C: 35, D: 'Product B' },
  { A: 20, B: 30, C: 40, D: 'Product C' },
  { A: 25, B: 35, C: 45, D: 'Product D' },
  { A: 30, B: 40, C: 50, D: 'Product E' },
  { A: 35, B: 45, C: 55, D: 'Product F' },
  { A: 40, B: 50, C: 60, D: 'Product G' },
];

export default function BuilderPage() {
  const { language } = useContext(LanguageContext);
  const pageContent = content[language].builder;
  const { formulas, loading } = useFormulas();
  const [searchTerm, setSearchTerm] = useState('');
  const [builtFunctions, setBuiltFunctions] = useState<BuiltFunction[]>([]);

  // State for interactivity between table and builder
  const [activeArgument, setActiveArgument] = useState<{ functionId: string; argName: string } | null>(null);

  // State for AI calculation
  const [apiKey, setApiKey] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<string | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);


  const filteredFormulas = useMemo(() => {
    if (!searchTerm) {
      return formulas;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return formulas.filter(
      (formula) =>
        formula.title[language].toLowerCase().includes(lowercasedTerm) ||
        formula.title['en'].toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, formulas, language]);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const formulaId = e.dataTransfer.getData('formulaId');
    const formulaToAdd = formulas.find(f => f.id.toString() === formulaId);
    
    if (formulaToAdd) {
      const args = parseArguments(formulaToAdd.syntax);
      const initialArgValues = args.reduce((acc, arg) => {
        acc[arg] = '';
        return acc;
      }, {} as {[key: string]: string});

      setBuiltFunctions(prev => [...prev, {
        id: `${formulaToAdd.id}-${Date.now()}`, // Unique ID for key prop
        formula: formulaToAdd,
        args: initialArgValues
      }]);
    }
  };

  const clearBuilder = () => {
    setBuiltFunctions([]);
    setCalculationResult(null);
    setCalculationError(null);
  }

  const removeFunction = (id: string) => {
    setBuiltFunctions(prev => prev.filter((func) => func.id !== id));
  }
  
  const handleArgumentChange = (id: string, argName: string, value: string) => {
    setBuiltFunctions(prev => prev.map(func => {
      if (func.id === id) {
        return {
          ...func,
          args: {
            ...func.args,
            [argName]: value
          }
        }
      }
      return func;
    }));
  }

  const handleArgumentFocus = (functionId: string, argName: string) => {
    setActiveArgument({ functionId, argName });
  };
  
  const handleTableCellSelect = (cellValue: string) => {
      if (activeArgument) {
          handleArgumentChange(activeArgument.functionId, activeArgument.argName, cellValue);
      }
  };

  const formulaPreview = useMemo(() => {
    if (builtFunctions.length === 0) return pageContent.generatedFormulaPlaceholder;
    
    return '=' + builtFunctions.map(func => {
      const argsString = Object.values(func.args).map(val => val || '...').join(', ');
      // Get the function name from the syntax, e.g., =XLOOKUP(...) -> XLOOKUP
      const functionName = func.formula.syntax.split('(')[0].replace('=', '');
      return `${functionName}(${argsString})`;
    }).join(' + '); // Simple join for now

  }, [builtFunctions, pageContent.generatedFormulaPlaceholder]);

  const handleCalculate = useCallback(async () => {
    if (!apiKey) {
      setCalculationError("Please enter your Gemini API key to calculate the result.");
      return;
    }
    if (formulaPreview === pageContent.generatedFormulaPlaceholder) {
      setCalculationError("Please build a formula before calculating.");
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);
    setCalculationResult(null);

    try {
      const result = await calculateFormula({
        formula: formulaPreview,
        data: sampleData,
        apiKey: apiKey
      });
      setCalculationResult(result);
    } catch (e: any) {
      console.error(e);
      setCalculationError(e.message || "An unknown error occurred during calculation.");
    } finally {
      setIsCalculating(false);
    }
  }, [apiKey, formulaPreview, pageContent.generatedFormulaPlaceholder]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-muted/40">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 md:px-6 h-24 flex items-center justify-between">
           <div>
            <h1 className="text-3xl font-bold font-headline text-primary tracking-tighter flex items-center gap-3">
                <Wrench />
                {pageContent.title}
            </h1>
            <p className="text-muted-foreground">
                {pageContent.subtitle}
            </p>
           </div>
           <div className="flex items-center gap-2">
              <Button variant="outline"><Bookmark className="mr-2"/>{pageContent.savedFormulas}</Button>
              <Button variant="ghost" onClick={clearBuilder}><RefreshCw className="mr-2"/>{pageContent.reset}</Button>
           </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-hidden">
        
        {/* Left Panel: Function Library */}
        <div className="lg:col-span-3 h-full flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle>{pageContent.libraryTitle}</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={pageContent.searchPlaceholder}
                            className="pl-9 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-2 flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-2">
                            {loading ? (
                                [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
                            ) : (
                                filteredFormulas.map(formula => (
                                    <FunctionListItem key={formula.id} formula={formula} />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        {/* Center Panel: Formula Builder */}
        <div className="lg:col-span-6 h-full flex flex-col">
            <Card 
              className="flex-1 flex flex-col overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>{pageContent.builderTitle}</CardTitle>
                    {builtFunctions.length > 0 && 
                      <Button variant="ghost" size="sm" onClick={clearBuilder}><Trash2 className="mr-2"/>{pageContent.clear}</Button>
                    }
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {builtFunctions.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                          <div>
                              <MousePointer className="h-12 w-12 mx-auto mb-4" />
                              <p className="font-semibold">{pageContent.dropTargetTitle}</p>
                              <p className="text-sm">{pageContent.dropTargetSubtitle}</p>
                          </div>
                      </div>
                    ) : (
                      builtFunctions.map((func) => (
                        <BuilderFunctionItem 
                            key={func.id} 
                            id={func.id}
                            formula={func.formula}
                            args={func.args}
                            onArgumentChange={handleArgumentChange} 
                            onArgumentFocus={handleArgumentFocus}
                            onRemove={() => removeFunction(func.id)}
                            activeArgument={activeArgument}
                        />
                      ))
                    )}
                </CardContent>
                 <div className="border-t p-3 text-sm text-muted-foreground">
                    Functions: {builtFunctions.length}
                </div>
            </Card>
        </div>

        {/* Right Panel: Preview & Data */}
        <div className="lg:col-span-3 h-full flex flex-col overflow-hidden">
             <ScrollArea className="h-full pr-4 -mr-4">
                <div className="space-y-6 pb-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{pageContent.previewTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{pageContent.generatedFormula}</CardDescription>
                            <div className="mt-2 bg-muted rounded-md p-4 font-code text-sm text-foreground break-all">
                                {formulaPreview}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>{pageContent.sampleData}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SampleDataTable onCellSelect={handleTableCellSelect} data={sampleData} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>{pageContent.resultTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                            <Label htmlFor="apiKey">{pageContent.apiKeyLabel}</Label>
                            <Input 
                                id="apiKey"
                                type="password"
                                placeholder={pageContent.apiKeyPlaceholder}
                                value={apiKey}
                                onChange={(e) => {
                                setApiKey(e.target.value);
                                if (calculationError) setCalculationError(null);
                                }}
                            />
                            </div>
                            <Button onClick={handleCalculate} className="w-full" disabled={isCalculating}>
                            {isCalculating ? <Loader className="animate-spin" /> : <Sparkles className="mr-2" />}
                            {pageContent.calculateButton}
                            </Button>
                            {isCalculating && <p className="text-sm text-center text-muted-foreground">AI is calculating...</p>}
                            {calculationError && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{calculationError}</AlertDescription>
                            </Alert>
                            )}
                            {calculationResult && (
                            <div>
                                <p className="text-sm text-muted-foreground">{pageContent.resultSubtitle}</p>
                                <p className="text-2xl font-bold text-center p-4 bg-muted rounded-md">{calculationResult}</p>
                            </div>
                            )}
                            {!isCalculating && !calculationResult && !calculationError && (
                            <div className="text-center text-muted-foreground py-4">
                                <p>--</p>
                            </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
             </ScrollArea>
        </div>

      </div>
    </div>
  );
}
