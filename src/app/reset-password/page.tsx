
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader, AlertTriangle } from 'lucide-react';
import { LanguageContext, content } from '@/contexts/language-context';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  
  useEffect(() => {
    // Supabase recovery token is in the URL hash
    if (window.location.hash.includes('type=recovery')) {
      setHasRecoveryToken(true);
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // The session is now active with the recovery token
          // We don't need to do anything here, just let the user set a new password
        }
        // Unsubscribe to avoid memory leaks
        subscription?.unsubscribe();
      });
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Success!',
        description: 'Your password has been updated. Please log in with your new password.',
      });
      router.push('/login');

    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || 'Failed to reset password. The link may have expired.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Reset Password</CardTitle>
          <CardDescription>Enter a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasRecoveryToken ? (
            <div className="flex flex-col items-center text-center text-destructive">
                <AlertTriangle className="h-10 w-10 mb-4" />
                <p className="font-semibold">Invalid or Expired Link</p>
                <p className="text-sm text-muted-foreground">Please request a new password reset link from the login page.</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Set New Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
