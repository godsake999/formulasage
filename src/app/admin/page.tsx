
'use client';

import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import type { Formula, Example } from '@/lib/data';
import type { Tip } from '@/lib/tips-data';
import { useFormulas } from '@/contexts/formula-context';
import { useTips as useTipsContext } from '@/contexts/tip-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LanguageContext, content } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { Loader, Lock, ShieldOff, X, PlusCircle, Search, FileText, ChevronDown, ChevronRight, Settings, Code, FileImage, Save, Eye, Trash2, Lightbulb, Sigma, TextQuote, GitCompareArrows } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import BulkFormulaUpload from '@/components/admin/BulkFormulaUpload'; // Adjust path as needed

const initialFormulaState: Omit<Formula, 'created_at'> = {
  id: 0,
  title: { en: '', my: '' },
  category: { en: '', my: '' },
  shortDescription: { en: '', my: '' },
  longDescription: { en: [], my: [] },
  syntax: '',
  syntaxBreakdown: { en: [], my: [] },
  examples: [],
  isNew: false,
  difficulty: { en: 'Beginner', my: 'လွယ်ကူသော' },
};

const initialTipState: Omit<Tip, 'created_at' | 'id'> = {
  title: { en: '', my: '' },
  examples: [],
  oldMethodTitle: { en: '', my: '' },
  oldMethodDesc: { en: [], my: [] },
  newMethodTitle: { en: '', my: '' },
  newMethodDesc: { en: [], my: [] },
  details: { en: [], my: [] },
  exampleCode: '',
  visualExplanation: { imageUrl: '' },
};


export default function AdminPage() {
  const { formulas, addFormula, updateFormula, deleteFormula, loading: formulasLoading } = useFormulas();
  const { tips, addTip, updateTip, deleteTip, loading: tipsLoading } = useTipsContext();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { language, setLanguage } = useContext(LanguageContext);
  const pageContent = content[language];
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('formulas');
  
  // Formula State
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [formulaFormData, setFormulaFormData] = useState<Omit<Formula, 'created_at'>>(JSON.parse(JSON.stringify(initialFormulaState)));
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const [formulaSearchTerm, setFormulaSearchTerm] = useState('');
  const [exampleFiles, setExampleFiles] = useState<(File | null)[]>([]);

  // Tip State
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [tipFormData, setTipFormData] = useState<Omit<Tip, 'created_at' | 'id'>>(JSON.parse(JSON.stringify(initialTipState)));
  const [isEditingTip, setIsEditingTip] = useState(false);
  const [tipSearchTerm, setTipSearchTerm] = useState('');
  const [tipFile, setTipFile] = useState<File | null>(null);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Formula Effects & Handlers
  useEffect(() => {
    if (selectedFormula) {
        const formData = JSON.parse(JSON.stringify(selectedFormula));
        formData.difficulty = formData.difficulty ?? { en: 'Beginner', my: 'လွယ်ကူသော' };
        formData.syntaxBreakdown = formData.syntaxBreakdown ?? { en: [], my: [] };
        formData.examples = formData.examples ?? [];
        setFormulaFormData(formData);
        setIsEditingFormula(true);
        setExampleFiles(new Array(formData.examples.length).fill(null));
    } else {
        setFormulaFormData(JSON.parse(JSON.stringify(initialFormulaState)));
        setIsEditingFormula(false);
        setExampleFiles([]);
    }
  }, [selectedFormula])

  // Tip Effects & Handlers
  useEffect(() => {
    if (selectedTip) {
        setTipFormData(JSON.parse(JSON.stringify(selectedTip)));
        setIsEditingTip(true);
        setTipFile(null);
    } else {
        setTipFormData(JSON.parse(JSON.stringify(initialTipState)));
        setIsEditingTip(false);
        setTipFile(null);
    }
  }, [selectedTip]);

  const handleSelectFormula = (formula: Formula) => setSelectedFormula(formula);
  const handleAddNewFormula = () => {
    setSelectedFormula(null);
    setFormulaFormData(JSON.parse(JSON.stringify(initialFormulaState)));
    setIsEditingFormula(false);
  }
  
  const handleUploadComplete = () => {
    // This forces the useFormulas context to reload data if it has a refresh method, 
    // OR you can just hard reload the page for simplicity:
    window.location.reload(); 
    toast({ title: 'Bulk Upload Success', description: 'Formulas have been imported.' });
};
  const handleSelectTip = (tip: Tip) => setSelectedTip(tip);
  const handleAddNewTip = () => {
    setSelectedTip(null);
    setTipFormData(JSON.parse(JSON.stringify(initialTipState)));
    setIsEditingTip(false);
  }

  // Generic change handlers that work for both forms
  const handleFormChange = (setter: React.Dispatch<React.SetStateAction<any>>, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nameParts = name.split('.');

    setter((prev:any) => {
        const newState = JSON.parse(JSON.stringify(prev));
        let current = newState;
        for (let i = 0; i < nameParts.length - 1; i++) {
            current = current[nameParts[i]];
        }
        const lastPart = nameParts[nameParts.length - 1];
        const secondLastPart = nameParts.length > 1 ? nameParts[nameParts.length - 2] : null;

        if (secondLastPart && ['longDescription', 'syntaxBreakdown', 'oldMethodDesc', 'newMethodDesc', 'details'].includes(secondLastPart)) {
             const parent = nameParts.slice(0, -1).reduce((obj, key) => obj[key], newState);
             parent[lastPart] = value.split('\n');
        } else {
            current[lastPart] = value;
        }
        return newState;
    });
  };
  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleFormChange(setFormulaFormData, e);
  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleFormChange(setTipFormData, e);

  // Formula-specific handlers
  const handleExampleChange = (index: number, field: keyof Example | `explanation.${'en' | 'my'}`, value: string) => {
      setFormulaFormData(prev => {
          const newExamples = [...(prev.examples || [])];
          if (field.startsWith('explanation.')) {
              const lang = field.split('.')[1] as 'en' | 'my';
              newExamples[index].explanation[lang] = value;
          } else if (field === 'code') {
              newExamples[index].code = value;
          }
          return { ...prev, examples: newExamples };
      });
  };
  const addExample = () => {
      setFormulaFormData(prev => ({
          ...prev,
          examples: [...(prev.examples || []), { code: '', explanation: { en: '', my: '' }, imageUrl: '' }]
      }));
       setExampleFiles(prev => [...prev, null]);
  };
  const removeExample = (index: number) => {
      setFormulaFormData(prev => ({
          ...prev,
          examples: (prev.examples || []).filter((_, i) => i !== index)
      }));
       setExampleFiles(prev => prev.filter((_, i) => i !== index));
  };
  const handleExampleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setExampleFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
    });
  }
  const removeExampleImage = (index: number) => {
    setExampleFiles(prev => { const newFiles = [...prev]; newFiles[index] = null; return newFiles; });
    setFormulaFormData(prev => {
      const newExamples = [...(prev.examples || [])];
      newExamples[index].imageUrl = '';
      return { ...prev, examples: newExamples };
    });
  }
  const handleDifficultyChange = (value: string) => {
    const difficultyMap: { [key: string]: { en: string, my: string } } = {
      'Beginner': { en: 'Beginner', my: 'လွယ်ကူသော' },
      'Intermediate': { en: 'Intermediate', my: 'အလယ်အလတ်' },
      'Advanced': { en: 'Advanced', my: 'ခက်ခဲသော' },
    };
    setFormulaFormData(prev => ({ ...prev, difficulty: difficultyMap[value] || { en: 'Beginner', my: 'လွယ်ကူသော' } }));
  };
  const handleFormulaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingFormula && selectedFormula) {
        await updateFormula(selectedFormula.id, formulaFormData, exampleFiles);
        toast({ title: 'Success', description: 'Formula updated successfully.' });
        const reloadedFormulas = await supabase.from('formulas').select('*');
        const updatedFormulaFromDb = reloadedFormulas.data?.find(f => f.id === selectedFormula.id);
        if(updatedFormulaFromDb) setSelectedFormula(updatedFormulaFromDb as unknown as Formula);
      } else {
        const newFormula = await addFormula(formulaFormData, exampleFiles);
        toast({ title: 'Success', description: 'Formula added successfully.' });
        setSelectedFormula(newFormula);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    }
  };
  const handleFormulaDelete = async () => {
    if (!selectedFormula) return;
    if (window.confirm('Are you sure you want to delete this formula? This action cannot be undone.')) {
        try {
            await deleteFormula(selectedFormula.id);
            toast({ title: 'Success', description: 'Formula deleted successfully.' });
            setSelectedFormula(null);
        } catch (error) {
           const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
           toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        }
    }
  }

  // Tip-specific handlers
  const handleTipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipFile(e.target.files ? e.target.files[0] : null);
  }
  const removeTipImage = () => {
    setTipFile(null);
    setTipFormData(prev => ({ ...prev, visualExplanation: { imageUrl: '' } }));
  }
  const handleTipSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (isEditingTip && selectedTip) {
              await updateTip(selectedTip.id, tipFormData, tipFile);
              toast({ title: 'Success', description: 'Tip updated successfully.'});
              const { data } = await supabase.from('tips').select('*').eq('id', selectedTip.id).single();
              if (data) setSelectedTip(data as unknown as Tip);
          } else {
              const newTip = await addTip(tipFormData, tipFile);
              toast({ title: 'Success', description: 'Tip added successfully.' });
              setSelectedTip(newTip);
          }
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      }
  }
  const handleTipDelete = async () => {
    if (!selectedTip) return;
    if (window.confirm('Are you sure you want to delete this tip? This action cannot be undone.')) {
        try {
            await deleteTip(selectedTip.id);
            toast({ title: 'Success', description: 'Tip deleted successfully.'});
            setSelectedTip(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        }
    }
  }

  // Memoized filtered lists
  const filteredFormulas = useMemo(() => {
    const grouped: {[key: string]: Formula[]} = {};
    const allFormulas = formulas.sort((a,b) => a.title.en.localeCompare(b.title.en));
    allFormulas.forEach(formula => {
      const category = formula.category?.en || 'Uncategorized';
      if(!grouped[category]) grouped[category] = [];
      grouped[category].push(formula);
    });
    if(!formulaSearchTerm) return grouped;
    const filteredGrouped: {[key: string]: Formula[]} = {};
    for (const category in grouped) {
      const filtered = grouped[category].filter(f => f.title.en.toLowerCase().includes(formulaSearchTerm.toLowerCase()));
      if (filtered.length > 0) filteredGrouped[category] = filtered;
    }
    return filteredGrouped;
  }, [formulas, formulaSearchTerm]);

  const filteredTips = useMemo(() => {
      if (!tipSearchTerm) return tips;
      return tips.filter(tip => tip.title.en.toLowerCase().includes(tipSearchTerm.toLowerCase()));
  }, [tips, tipSearchTerm]);


  if (authLoading || formulasLoading || tipsLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="h-8 w-8 animate-spin" /></div>;
  }
  if (!user) {
    return (
       <div className="container mx-auto px-4 md:px-6 py-8 text-center h-[calc(100vh-80px)] flex items-center justify-center">
            <Card className="max-w-md mx-auto">
                <CardHeader><CardTitle className="flex items-center justify-center gap-2"><Lock /> {pageContent.admin.loginRequired}</CardTitle></CardHeader>
                <CardContent><p>{pageContent.admin.loginPrompt}</p><Button asChild className="mt-4"><Link href="/login">Login</Link></Button></CardContent>
            </Card>
        </div>
    )
  }
  if (!isAdmin) {
      return (
        <div className="container mx-auto px-4 md:px-6 py-8 text-center h-[calc(100vh-80px)] flex items-center justify-center">
            <Card className="max-w-md mx-auto bg-destructive/10 border-destructive">
                <CardHeader><CardTitle className="flex items-center justify-center gap-2"><ShieldOff /> {pageContent.admin.notAdmin}</CardTitle></CardHeader>
                <CardContent><p>{pageContent.admin.notAdminPrompt}</p></CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-muted/40">
        <div className="border-b bg-background">
            <div className="container mx-auto px-4 md:px-6 h-24 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary tracking-tighter">Content Management</h1>
                <p className="text-muted-foreground">Manage Excel functions, tips, and educational content.</p>
            </div>
            </div>
        </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto px-4 md:px-6 py-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="formulas"><Sigma className="mr-2"/>Formula Management</TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb className="mr-2"/>Tip Management</TabsTrigger>
        </TabsList>

        {/* FORMULAS TAB */}
        <TabsContent value="formulas" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            <div className="lg:col-span-4 xl:col-span-3">
            <Card>
                <CardHeader>
                    {/* Inside TabsContent value="formulas" */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <Card>
                            <CardHeader>
                                <Button className="w-full" onClick={handleAddNewFormula}><PlusCircle/> Create New Formula</Button>
                                {/* ... existing search input ... */}
                            </CardHeader>
                            <CardContent>
                                {/* ... existing list ... */}
                            </CardContent>
                        </Card>

                        {/* ADD THIS SECTION BELOW THE LIST CARD */}
                        <BulkFormulaUpload onUploadComplete={handleUploadComplete} />
                    </div>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search functions..." className="pl-9" value={formulaSearchTerm} onChange={(e) => setFormulaSearchTerm(e.target.value)}/>
                    </div>
                </CardHeader>
                <CardContent className="p-2">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {Object.keys(filteredFormulas).sort().map(category => (
                    <CollapsibleCategory key={category} category={category} formulas={filteredFormulas[category]} selectedFormula={selectedFormula} onSelect={handleSelectFormula} />
                    ))}
                </div>
                </CardContent>
            </Card>
            </div>

            <div className="lg:col-span-8 xl:col-span-9">
                {(!selectedFormula && isEditingFormula) || (activeTab === 'formulas' && !selectedFormula && !isEditingFormula) ? (
                    <Card className="flex items-center justify-center h-96">
                        <CardContent className="text-center text-muted-foreground pt-6">
                            <FileText className="h-12 w-12 mx-auto mb-4" />
                            <p>Select a formula to edit or create a new one.</p>
                        </CardContent>
                    </Card>
                ) : null}

                {(selectedFormula || !isEditingFormula) && (
                <form onSubmit={handleFormulaSubmit}>
                    <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-headline flex items-center gap-3">
                                <FileText className="text-primary"/> 
                                {isEditingFormula ? `Edit: ${formulaFormData?.title?.en || ''}` : 'Create New Formula'}
                                </CardTitle>
                                <CardDescription>
                                {isEditingFormula ? `ID: ${formulaFormData?.id || ''}` : `Fill out the details for the new formula.`}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditingFormula && (
                                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleFormulaDelete}>
                                        <Trash2 className="h-4 w-4 mr-2"/> Delete
                                    </Button>
                                )}
                                <Button type="submit" size="sm"><Save className="h-4 w-4 mr-2"/> {isEditingFormula ? 'Save Changes' : 'Create Formula'}</Button>
                            </div>
                        </div>
                        <div className="flex justify-end items-center pt-2">
                            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                                <Button type="button" size="sm" variant={language === 'en' ? 'secondary' : 'ghost'} className="h-7 px-3" onClick={() => setLanguage('en')}>EN</Button>
                                <Button type="button" size="sm" variant={language === 'my' ? 'secondary' : 'ghost'} className="h-7 px-3" onClick={() => setLanguage('my')}>မြန်မာ</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="basic">
                            <TabsList>
                                <TabsTrigger value="basic"><Settings className="h-4 w-4 mr-2"/>Basic Info</TabsTrigger>
                                <TabsTrigger value="content"><FileText className="h-4 w-4 mr-2"/>Content</TabsTrigger>
                                <TabsTrigger value="example"><Code className="h-4 w-4 mr-2"/>Examples</TabsTrigger>
                            </TabsList>
                            <div className="pt-6">
                                <TabsContent value="basic" className="grid grid-cols-1 md:grid-cols-2 gap-6 m-0">
                                    <div className="space-y-2"><Label htmlFor="title.en">{pageContent.admin.titleEnLabel}</Label><Input id="title.en" name="title.en" value={formulaFormData?.title?.en || ''} onChange={handleFormulaChange} required /></div>
                                    <div className="space-y-2"><Label htmlFor="title.my">{pageContent.admin.titleMyLabel}</Label><Input id="title.my" name="title.my" value={formulaFormData?.title?.my || ''} onChange={handleFormulaChange} required /></div>
                                    <div className="space-y-2"><Label htmlFor="category.en">{pageContent.admin.categoryEnLabel}</Label><Input id="category.en" name="category.en" value={formulaFormData?.category?.en || ''} onChange={handleFormulaChange} required /></div>
                                    <div className="space-y-2"><Label htmlFor="category.my">{pageContent.admin.categoryMyLabel}</Label><Input id="category.my" name="category.my" value={formulaFormData?.category?.my || ''} onChange={handleFormulaChange} required /></div>
                                    <div className="space-y-2"><Label>{pageContent.admin.difficultyLabel}</Label><Select onValueChange={handleDifficultyChange} value={formulaFormData?.difficulty?.en || 'Beginner'}><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger><SelectContent><SelectItem value="Beginner">{pageContent.admin.beginner}</SelectItem><SelectItem value="Intermediate">{pageContent.admin.intermediate}</SelectItem><SelectItem value="Advanced">{pageContent.admin.advanced}</SelectItem></SelectContent></Select></div>
                                    <div className="flex items-center space-x-2 pt-6"><Switch id="is-new" checked={formulaFormData?.isNew || false} onCheckedChange={(checked) => setFormulaFormData(prev => ({ ...prev, isNew: checked }))} /><Label htmlFor="is-new">{pageContent.admin.isNewLabel}</Label></div>
                                </TabsContent>
                                <TabsContent value="content" className="grid grid-cols-1 md:grid-cols-2 gap-6 m-0">
                                    <div className="md:col-span-2 space-y-2"><Label htmlFor="syntax">{pageContent.admin.syntaxLabel}</Label><Input id="syntax" name="syntax" placeholder={pageContent.admin.syntaxPlaceholder} value={formulaFormData?.syntax || ''} onChange={handleFormulaChange} required className="font-code" /></div>
                                    <div className="space-y-2"><Label htmlFor="shortDescription.en">{pageContent.admin.shortDescEnLabel}</Label><Textarea id="shortDescription.en" name="shortDescription.en" value={formulaFormData?.shortDescription?.en || ''} onChange={handleFormulaChange} required /></div>
                                    <div className="space-y-2"><Label htmlFor="shortDescription.my">{pageContent.admin.shortDescMyLabel}</Label><Textarea id="shortDescription.my" name="shortDescription.my" value={formulaFormData?.shortDescription?.my || ''} onChange={handleFormulaChange} required /></div>
                                    <div className="space-y-2"><Label htmlFor="longDescription.en">{pageContent.admin.longDescEnLabel}</Label><Textarea id="longDescription.en" name="longDescription.en" value={Array.isArray(formulaFormData?.longDescription?.en) ? formulaFormData.longDescription.en.join('\n') : ''} onChange={handleFormulaChange} rows={5} required /></div>
                                    <div className="space-y-2"><Label htmlFor="longDescription.my">{pageContent.admin.longDescMyLabel}</Label><Textarea id="longDescription.my" name="longDescription.my" value={Array.isArray(formulaFormData?.longDescription?.my) ? formulaFormData.longDescription.my.join('\n') : ''} onChange={handleFormulaChange} rows={5} required /></div>
                                    <div className="space-y-2"><Label htmlFor="syntaxBreakdown.en">Syntax Breakdown (English)</Label><Textarea id="syntaxBreakdown.en" name="syntaxBreakdown.en" value={Array.isArray(formulaFormData.syntaxBreakdown?.en) ? formulaFormData.syntaxBreakdown.en.join('\n') : ''} onChange={handleFormulaChange} rows={5} /></div>
                                    <div className="space-y-2"><Label htmlFor="syntaxBreakdown.my">Syntax Breakdown (Myanmar)</Label><Textarea id="syntaxBreakdown.my" name="syntaxBreakdown.my" value={Array.isArray(formulaFormData.syntaxBreakdown?.my) ? formulaFormData.syntaxBreakdown.my.join('\n') : ''} onChange={handleFormulaChange} rows={5} /></div>
                                </TabsContent>
                                <TabsContent value="example" className="space-y-6 m-0">
                                    <Label>Manage Examples</Label>
                                    <div className="space-y-4">
                                        {(formulaFormData.examples || []).map((ex, index) => (
                                            <Card key={index} className="p-4 bg-muted/50">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-grow space-y-4">
                                                        <div className='space-y-2'><Label htmlFor={`example-code-${index}`}>Example Code</Label><Input id={`example-code-${index}`} value={ex.code} onChange={(e) => handleExampleChange(index, 'code', e.target.value)} placeholder="=XLOOKUP(...)" className="font-code"/></div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className='space-y-2'><Label htmlFor={`example-exp-en-${index}`}>Explanation (English)</Label><Textarea id={`example-exp-en-${index}`} value={ex.explanation.en} onChange={(e) => handleExampleChange(index, 'explanation.en', e.target.value)} rows={3}/></div>
                                                            <div className='space-y-2'><Label htmlFor={`example-exp-my-${index}`}>Explanation (Myanmar)</Label><Textarea id={`example-exp-my-${index}`} value={ex.explanation.my} onChange={(e) => handleExampleChange(index, 'explanation.my', e.target.value)} rows={3}/></div>
                                                        </div>
                                                        <div className="space-y-2"><Label htmlFor={`example-image-${index}`} className="flex items-center gap-2"><FileImage className="w-4 h-4 text-muted-foreground"/>Visual Explanation (Optional)</Label><Input id={`example-image-${index}`} type="file" accept="image/*" onChange={(e) => handleExampleFileChange(index, e)}/>
                                                            {exampleFiles[index] && (<div className="flex items-center gap-2 text-sm text-muted-foreground mt-2"><span>Preview: {exampleFiles[index]?.name}</span><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeExampleImage(index)}><X className="h-4 w-4"/></Button></div>)}
                                                            {ex.imageUrl && !exampleFiles[index] && (<div className="mt-2 text-sm"><div className='flex items-center gap-4'><a href={ex.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate block">{ex.imageUrl}</a><Button type="button" variant="link" size="sm" className="p-0 h-auto text-destructive" onClick={() => removeExampleImage(index)}>Remove Image</Button></div></div>)}
                                                        </div>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExample(index)} className="mt-6 text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addExample}><PlusCircle className="mr-2 h-4 w-4"/>Add Example</Button>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                    </Card>
                </form>
                )}
            </div>
        </TabsContent>
        
        {/* TIPS TAB */}
        <TabsContent value="tips" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            <div className="lg:col-span-4 xl:col-span-3">
                <Card>
                    <CardHeader>
                        <Button className="w-full" onClick={handleAddNewTip}><PlusCircle/> Create New Tip</Button>
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search tips..." className="pl-9" value={tipSearchTerm} onChange={(e) => setTipSearchTerm(e.target.value)}/>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                           {filteredTips.map(tip => (
                                <button key={tip.id} onClick={() => handleSelectTip(tip)} className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 ${selectedTip?.id === tip.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
                                    <Lightbulb className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{tip.title.en}</span>
                                </button>
                           ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-8 xl:col-span-9">
                {(!selectedTip && isEditingTip) || (activeTab === 'tips' && !selectedTip && !isEditingTip) ? (
                    <Card className="flex items-center justify-center h-96">
                        <CardContent className="text-center text-muted-foreground pt-6">
                            <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                            <p>Select a tip to edit or create a new one.</p>
                        </CardContent>
                    </Card>
                ) : null}

                {(selectedTip || !isEditingTip) && (
                    <form onSubmit={handleTipSubmit}>
                        <Card>
                             <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl font-headline flex items-center gap-3">
                                            <Lightbulb className="text-primary"/> 
                                            {isEditingTip ? `Edit: ${tipFormData?.title?.en || ''}` : 'Create New Tip'}
                                        </CardTitle>
                                        <CardDescription>
                                            {isEditingTip ? `ID: ${selectedTip?.id || ''}` : 'Fill out the details for the new tip.'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isEditingTip && (
                                            <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleTipDelete}>
                                                <Trash2 className="h-4 w-4 mr-2"/> Delete
                                            </Button>
                                        )}
                                        <Button type="submit" size="sm"><Save className="h-4 w-4 mr-2"/> {isEditingTip ? 'Save Changes' : 'Create Tip'}</Button>
                                    </div>
                                </div>
                                <div className="flex justify-end items-center pt-2">
                                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                                        <Button type="button" size="sm" variant={language === 'en' ? 'secondary' : 'ghost'} className="h-7 px-3" onClick={() => setLanguage('en')}>EN</Button>
                                        <Button type="button" size="sm" variant={language === 'my' ? 'secondary' : 'ghost'} className="h-7 px-3" onClick={() => setLanguage('my')}>မြန်မာ</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="basic">
                                    <TabsList>
                                        <TabsTrigger value="basic"><Settings className="h-4 w-4 mr-2"/>Basic Info</TabsTrigger>
                                        <TabsTrigger value="comparison"><GitCompareArrows className="h-4 w-4 mr-2"/>Comparison</TabsTrigger>
                                        <TabsTrigger value="content"><TextQuote className="h-4 w-4 mr-2"/>Content & Media</TabsTrigger>
                                    </TabsList>
                                     <div className="pt-6">
                                        <TabsContent value="basic" className="grid grid-cols-1 md:grid-cols-2 gap-6 m-0">
                                             <div className="space-y-2"><Label htmlFor="tip.title.en">Title (English)</Label><Input id="tip.title.en" name="title.en" value={tipFormData?.title?.en || ''} onChange={handleTipChange} required /></div>
                                             <div className="space-y-2"><Label htmlFor="tip.title.my">Title (Myanmar)</Label><Input id="tip.title.my" name="title.my" value={tipFormData?.title?.my || ''} onChange={handleTipChange} required /></div>
                                        </TabsContent>
                                        <TabsContent value="comparison" className="space-y-6 m-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2"><Label htmlFor="tip.oldMethodTitle.en">"Old Way" Title (English)</Label><Input id="tip.oldMethodTitle.en" name="oldMethodTitle.en" value={tipFormData?.oldMethodTitle?.en || ''} onChange={handleTipChange}/></div>
                                                <div className="space-y-2"><Label htmlFor="tip.oldMethodTitle.my">"Old Way" Title (Myanmar)</Label><Input id="tip.oldMethodTitle.my" name="oldMethodTitle.my" value={tipFormData?.oldMethodTitle?.my || ''} onChange={handleTipChange}/></div>
                                                <div className="space-y-2"><Label htmlFor="tip.oldMethodDesc.en">"Old Way" Description (English, 1 per line)</Label><Textarea id="tip.oldMethodDesc.en" name="oldMethodDesc.en" value={(tipFormData?.oldMethodDesc?.en || []).join('\n')} onChange={handleTipChange} rows={4}/></div>
                                                <div className="space-y-2"><Label htmlFor="tip.oldMethodDesc.my">"Old Way" Description (Myanmar, 1 per line)</Label><Textarea id="tip.oldMethodDesc.my" name="oldMethodDesc.my" value={(tipFormData?.oldMethodDesc?.my || []).join('\n')} onChange={handleTipChange} rows={4}/></div>
                                            </div>
                                            <Separator/>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2"><Label htmlFor="tip.newMethodTitle.en">"New Way" Title (English)</Label><Input id="tip.newMethodTitle.en" name="newMethodTitle.en" value={tipFormData?.newMethodTitle?.en || ''} onChange={handleTipChange}/></div>
                                                <div className="space-y-2"><Label htmlFor="tip.newMethodTitle.my">"New Way" Title (Myanmar)</Label><Input id="tip.newMethodTitle.my" name="newMethodTitle.my" value={tipFormData?.newMethodTitle?.my || ''} onChange={handleTipChange}/></div>
                                                <div className="space-y-2"><Label htmlFor="tip.newMethodDesc.en">"New Way" Description (English, 1 per line)</Label><Textarea id="tip.newMethodDesc.en" name="newMethodDesc.en" value={(tipFormData?.newMethodDesc?.en || []).join('\n')} onChange={handleTipChange} rows={4}/></div>
                                                <div className="space-y-2"><Label htmlFor="tip.newMethodDesc.my">"New Way" Description (Myanmar, 1 per line)</Label><Textarea id="tip.newMethodDesc.my" name="newMethodDesc.my" value={(tipFormData?.newMethodDesc?.my || []).join('\n')} onChange={handleTipChange} rows={4}/></div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="content" className="space-y-6 m-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2"><Label htmlFor="tip.details.en">Details (English, 1 para per line)</Label><Textarea id="tip.details.en" name="details.en" value={(tipFormData?.details?.en || []).join('\n')} onChange={handleTipChange} rows={5}/></div>
                                                <div className="space-y-2"><Label htmlFor="tip.details.my">Details (Myanmar, 1 para per line)</Label><Textarea id="tip.details.my" name="details.my" value={(tipFormData?.details?.my || []).join('\n')} onChange={handleTipChange} rows={5}/></div>
                                            </div>
                                            <Separator/>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2"><Label htmlFor="tip.exampleCode">Example Code</Label><Input id="tip.exampleCode" name="exampleCode" value={tipFormData?.exampleCode || ''} onChange={handleTipChange} className="font-code"/></div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="tip-image" className="flex items-center gap-2"><FileImage className="w-4 h-4 text-muted-foreground"/>Visual Explanation Image</Label>
                                                    <Input id="tip-image" type="file" accept="image/*" onChange={handleTipFileChange}/>
                                                    {tipFile && (<div className="flex items-center gap-2 text-sm text-muted-foreground mt-2"><span>Preview: {tipFile.name}</span><Button size="icon" variant="ghost" className="h-6 w-6" onClick={removeTipImage}><X className="h-4 w-4"/></Button></div>)}
                                                    {tipFormData?.visualExplanation?.imageUrl && !tipFile && (
                                                        <div className="mt-2 text-sm">
                                                            <div className='flex items-center gap-4'>
                                                                <a href={tipFormData.visualExplanation.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate block">{tipFormData.visualExplanation.imageUrl}</a>
                                                                <Button type="button" variant="link" size="sm" className="p-0 h-auto text-destructive" onClick={removeTipImage}>Remove Image</Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>
                                     </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </form>
                )}

            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


function CollapsibleCategory({ category, formulas, selectedFormula, onSelect }: { category: string, formulas: Formula[], selectedFormula: Formula | null, onSelect: (formula: Formula) => void }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between text-left p-2 rounded-md hover:bg-muted font-semibold">
                <span>{category}</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {isOpen && (
                <div className="pl-4 mt-1 space-y-1">
                    {formulas.map(formula => (
                        <button 
                            key={formula.id} 
                            onClick={() => onSelect(formula)}
                            className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 ${selectedFormula?.id === formula.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        >
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{formula.title.en}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
