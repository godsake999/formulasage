
'use client';

import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageContext } from '@/contexts/language-context';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { setLanguage } = useContext(LanguageContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('my')}>
          မြန်မာ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
