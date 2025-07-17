
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';
import { Table, Home, Sigma, LayoutGrid, Lightbulb, Wrench, Cog, User, MoreVertical, Menu } from 'lucide-react';
import { LanguageContext, content } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { LanguageSwitcher } from './language-switcher';
import { ThemeSwitcher } from './theme-switcher';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const { language } = useContext(LanguageContext);
  const { isAdmin, user, signOut } = useAuth();
  const pageContent = content[language];

  const navLinks = [
    { href: '/', label: pageContent.nav.home, icon: Home },
    { href: '/formulas', label: pageContent.nav.functions, icon: Sigma },
    { href: '/category', label: pageContent.nav.categories, icon: LayoutGrid },
    { href: '/tips', label: pageContent.nav.tips, icon: Lightbulb },
    { href: '/builder', label: pageContent.nav.builder, icon: Wrench },
  ];

  const adminLink = {
    href: '/admin',
    label: pageContent.nav.admin,
    icon: Cog,
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    // For categories, we want to match /category and /category/[name]
    if (href === '/category') return pathname.startsWith('/category');
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Table className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline text-foreground">
              FormulaSage
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost" className={cn(isActive(href) ? 'text-primary' : 'text-muted-foreground', 'justify-start gap-2')}>
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
              </Button>
            ))}
             {isAdmin && (
                <Button asChild variant="ghost" className={cn(isActive(adminLink.href) ? 'text-primary' : 'text-muted-foreground', 'justify-start gap-2')}>
                     <Link href={adminLink.href}>
                        <adminLink.icon className="h-4 w-4" />
                        {adminLink.label}
                     </Link>
                </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
            {/* Desktop View */}
            <div className="hidden md:flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
                {user ? (
                    <Button variant="ghost" size="sm" onClick={signOut}>
                        {pageContent.nav.logout}
                    </Button>
                ) : (
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/login">{pageContent.nav.login}</Link>
                    </Button>
                )}
            </div>
            
            {/* Mobile View */}
            <div className="md:hidden">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <DropdownMenuItem key={href} asChild>
                                 <Link href={href} className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <span>{label}</span>
                                 </Link>
                            </DropdownMenuItem>
                        ))}
                         {isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link href={adminLink.href} className="flex items-center gap-2">
                                    <adminLink.icon className="h-4 w-4 text-muted-foreground" />
                                    <span>{adminLink.label}</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator/>
                        <div className="px-2 py-1.5 flex items-center justify-around">
                            <LanguageSwitcher />
                            <ThemeSwitcher />
                        </div>
                        <DropdownMenuSeparator/>
                        {user ? (
                            <DropdownMenuItem onClick={signOut}>
                                <span className="text-destructive w-full text-center">{pageContent.nav.logout}</span>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem asChild>
                                <Link href="/login" className="w-full justify-center">
                                    {pageContent.nav.login}
                                </Link>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </div>
    </header>
  );
}
