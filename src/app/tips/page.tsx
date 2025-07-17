
'use client';

import { useContext, useState, useMemo } from 'react';
import { useTips } from '@/contexts/tip-context';
import { LanguageContext, content } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from 'next/image';
import { ThumbsDown, ThumbsUp, ZoomIn, Search } from 'lucide-react';
import type { Tip } from '@/lib/tips-data';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function TipCard({ tip }: { tip: Tip }) {
    const { language } = useContext(LanguageContext);
    const pageContent = content[language];

    return (
        <Card>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-grow">
                                <CardTitle className="font-headline text-2xl">
                                    {tip.title[language]}
                                </CardTitle>
                            </div>
                             <AccordionTrigger className="px-3 py-2 text-sm h-auto hover:no-underline rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 [&[data-state=open]>svg]:rotate-180 flex-shrink-0">
                                {pageContent.formulaCard.viewDetails}
                            </AccordionTrigger>
                        </div>
                    </CardHeader>
                    <AccordionContent>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6 items-start">
                                {/* Old Method */}
                                <div className="rounded-lg p-4 bg-destructive text-destructive-foreground">
                                    <div className="flex items-center gap-3 mb-3">
                                        <ThumbsDown className="h-6 w-6 text-destructive-foreground flex-shrink-0" />
                                        <h3 className="text-lg font-semibold text-destructive-foreground">{tip.oldMethodTitle[language]}</h3>
                                    </div>
                                    <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-destructive-foreground/90">
                                    {(Array.isArray(tip.oldMethodDesc?.[language]) ? tip.oldMethodDesc[language] : []).map((desc, index) => (
                                            <li key={index}>{desc}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* New Method */}
                                 <div className="rounded-lg p-4 bg-accent text-accent-foreground">
                                    <div className="flex items-center gap-3 mb-3">
                                        <ThumbsUp className="h-6 w-6 text-accent-foreground flex-shrink-0" />
                                        <h3 className="text-lg font-semibold text-accent-foreground">{tip.newMethodTitle[language]}</h3>
                                    </div>
                                    <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-accent-foreground/90">
                                        {(Array.isArray(tip.newMethodDesc?.[language]) ? tip.newMethodDesc[language] : []).map((desc, index) => (
                                            <li key={index}>{desc}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <Separator />
                            
                            <div className="grid md:grid-cols-2 gap-8 pt-4">
                                {/* Left Column: Text Explanations & Example */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">{pageContent.tipsPage.details}</h4>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            {(Array.isArray(tip.details?.[language]) ? tip.details[language] : []).map((paragraph, index) => (
                                                <p key={index}>{paragraph}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">{pageContent.tipsPage.example}</h4>
                                        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                                            <code className="font-code text-sm text-foreground">
                                            {tip.exampleCode}
                                            </code>
                                        </pre>
                                    </div>
                                </div>

                                {/* Right Column: Visual Explanation */}
                                <div className="space-y-6">
                                {tip.visualExplanation && tip.visualExplanation.imageUrl && (
                                        <div>
                                            <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">{pageContent.tipsPage.visualExplanation}</h4>
                                            <Dialog>
                                                <div className="mt-2 border rounded-lg overflow-hidden bg-card aspect-video relative group">
                                                    <Image
                                                    src={tip.visualExplanation.imageUrl}
                                                    alt={`Visual explanation for ${tip.title['en']}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                    <DialogTrigger asChild>
                                                        <button className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                            <ZoomIn className="h-5 w-5" />
                                                            <span className="sr-only">{pageContent.common.zoom}</span>
                                                        </button>
                                                    </DialogTrigger>
                                                </div>
                                                <DialogContent className="max-w-4xl p-2">
                                                    <DialogHeader>
                                                        <DialogTitle className="sr-only">
                                                            {`Zoomed visual explanation for ${tip.title[language]}`}
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <Image
                                                        src={tip.visualExplanation.imageUrl}
                                                        alt={`Zoomed visual explanation for ${tip.title['en']}`}
                                                        width={1200}
                                                        height={675}
                                                        className="w-full h-auto rounded-md"
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </CardContent>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}


export default function TipsPage() {
    const { language } = useContext(LanguageContext);
    const { tips, loading } = useTips();
    const [searchTerm, setSearchTerm] = useState('');
    const pageContent = content[language];

    const filteredTips = useMemo(() => {
        if (!searchTerm) {
            return tips;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return tips.filter(tip =>
            tip.title[language].toLowerCase().includes(lowercasedFilter) ||
            tip.oldMethodTitle[language].toLowerCase().includes(lowercasedFilter) ||
            tip.newMethodTitle[language].toLowerCase().includes(lowercasedFilter) ||
            tip.title['en'].toLowerCase().includes(lowercasedFilter) // Also search English title
        );
    }, [searchTerm, tips, language]);

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <section className="text-center py-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                {pageContent.tipsPage.title}
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                {pageContent.tipsPage.subtitle}
                </p>
            </section>
            
            <div className="mb-8 max-w-xl mx-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={pageContent.tipsPage.searchPlaceholder}
                        className="w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-8 max-w-6xl mx-auto">
                {filteredTips.map((tip) => (
                    <TipCard key={tip.id} tip={tip} />
                ))}
                 {filteredTips.length === 0 && (
                    <div className="text-center col-span-full py-12">
                        <p className="text-muted-foreground">
                          {searchTerm ? pageContent.tipsPage.noResults(searchTerm) : pageContent.tipsPage.noTips}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
