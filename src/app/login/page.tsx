'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LanguageContext, content } from '@/contexts/language-context';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  // CHANGE 1: Add state for email
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const pageContent = content[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // CHANGE 2: Pass the email state to your signIn function
      // (Check your auth-context definition to ensure it accepts email)
      await signIn(email, password); 
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: 'destructive',
        title: pageContent.login.errorTitle,
        description: errorMessage,
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{pageContent.login.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{pageContent.login.emailLabel}</Label>
              {/* CHANGE 3: Update the Input properties */}
              <Input
                id="email"
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{pageContent.login.passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {pageContent.login.button}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
