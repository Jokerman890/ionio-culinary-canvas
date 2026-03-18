import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logoImage from '@/assets/logo.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if we have a recovery token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsValidToken(true);
    }

    // Listen for auth state changes (recovery event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidToken(true);
      }
    });

    setChecking(false);

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie beide Felder aus.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Fehler',
        description: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Fehler',
        description: 'Die Passwörter stimmen nicht überein.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setIsSuccess(true);
      toast({ title: 'Passwort erfolgreich geändert' });

      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (error: unknown) {
      toast({
        title: 'Fehler',
        description: 'Passwort konnte nicht geändert werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <img 
            src={logoImage} 
            alt="IONIO Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <CardTitle className="font-serif text-2xl">Neues Passwort setzen</CardTitle>
          <CardDescription>
            Geben Sie Ihr neues Passwort ein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-gold" />
              </div>
              <p className="text-muted-foreground">
                Ihr Passwort wurde erfolgreich geändert. Sie werden zur Anmeldung weitergeleitet...
              </p>
            </div>
          ) : !isValidToken ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Ungültiger oder abgelaufener Link. Bitte fordern Sie einen neuen Link zum Zurücksetzen an.
              </p>
              <Button
                className="w-full bg-gold text-navy hover:bg-gold-light"
                onClick={() => navigate('/admin/forgot-password')}
              >
                Neuen Link anfordern
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mindestens 6 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Passwort wiederholen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-background"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gold text-navy hover:bg-gold-light"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichere...
                  </>
                ) : (
                  'Passwort ändern'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
