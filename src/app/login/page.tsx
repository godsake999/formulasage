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
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const pageContent = content[language];
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(password);
      // The onAuthStateChange listener in AuthProvider will handle redirect
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
              <Input
                id="email"
                type="email"
                value={adminEmail}
                disabled
                readOnly
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
