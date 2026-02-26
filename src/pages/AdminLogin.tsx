import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { lovable } from '@/integrations/lovable/index';
import logoImage from '@/assets/logo.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, role, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rateLimitKey = 'adminLoginRateLimit';
  const maxAttempts = 5;
  const windowMs = 5 * 60 * 1000;

  const readRateLimitState = () => {
    try {
      const raw = localStorage.getItem(rateLimitKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { count?: number; firstAttemptAt?: number };
      if (typeof parsed.count !== 'number' || typeof parsed.firstAttemptAt !== 'number') return null;
      return { count: parsed.count, firstAttemptAt: parsed.firstAttemptAt };
    } catch {
      return null;
    }
  };

  const writeRateLimitState = (state: { count: number; firstAttemptAt: number } | null) => {
    try {
      if (!state) {
        localStorage.removeItem(rateLimitKey);
        return;
      }
      localStorage.setItem(rateLimitKey, JSON.stringify(state));
    } catch {
      // localStorage kann in seltenen Fällen nicht verfügbar sein (z.B. Privacy-Modus)
    }
  };

  const getRateLimitInfo = () => {
    const now = Date.now();
    const state = readRateLimitState();
    if (!state) {
      return { state: null, isLimited: false, remainingMs: 0 };
    }

    const elapsed = now - state.firstAttemptAt;
    if (elapsed > windowMs) {
      writeRateLimitState(null);
      return { state: null, isLimited: false, remainingMs: 0 };
    }

    const remainingMs = windowMs - elapsed;
    return { state, isLimited: state.count >= maxAttempts, remainingMs };
  };

  useEffect(() => {
    if (!loading && isAuthenticated && (role === 'admin' || role === 'staff')) {
      navigate('/admin');
    }
  }, [isAuthenticated, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Fehler',
        description: 'Bitte E-Mail und Passwort eingeben.',
        variant: 'destructive',
      });
      return;
    }

    const rateLimitInfo = getRateLimitInfo();
    if (rateLimitInfo.isLimited) {
      const remainingMinutes = Math.max(1, Math.ceil(rateLimitInfo.remainingMs / 60000));
      toast({
        title: 'Zu viele Anmeldeversuche',
        description: `Bitte warten Sie ${remainingMinutes} Minute(n), bevor Sie es erneut versuchen.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Hinweis: Client-seitiges Rate-Limit ist umgehbar; server-seitig sollte ein Limit
    // z.B. via Supabase Edge Function (Auth-Proxy) oder API-Gateway ergänzt werden.
    const { error } = await signIn(email, password);
    
    if (error) {
      const now = Date.now();
      const nextState = rateLimitInfo.state
        ? { count: rateLimitInfo.state.count + 1, firstAttemptAt: rateLimitInfo.state.firstAttemptAt }
        : { count: 1, firstAttemptAt: now };
      writeRateLimitState(nextState);

      if (nextState.count >= maxAttempts) {
        toast({
          title: 'Zu viele Anmeldeversuche',
          description: 'Bitte warten Sie 5 Minuten, bevor Sie es erneut versuchen.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Anmeldung fehlgeschlagen',
          description:
            error.message === 'Invalid login credentials'
              ? 'Ungültige E-Mail oder Passwort.'
              : error.message,
          variant: 'destructive',
        });
      }
      setIsSubmitting(false);
      return;
    }

    writeRateLimitState(null);
  };

  if (loading) {
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
          <CardTitle className="font-serif text-2xl">Admin-Bereich</CardTitle>
          <CardDescription>
            Melden Sie sich an, um das Restaurant zu verwalten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ionio-ganderkesee.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Anmelden...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              oder
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting}
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth('apple', {
                redirect_uri: window.location.origin,
              });
              if (error) {
                toast({
                  title: 'Anmeldung fehlgeschlagen',
                  description: 'Apple-Anmeldung konnte nicht gestartet werden.',
                  variant: 'destructive',
                });
              }
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Mit Apple anmelden
          </Button>

          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              ← Zurück zur Website
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
