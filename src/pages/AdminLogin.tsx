import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { lovable } from '@/integrations/lovable/index';
import logoImage from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, role, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
                redirect_uri: `${window.location.origin}/admin/login`,
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

          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            disabled={isSubmitting}
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth('google', {
                redirect_uri: `${window.location.origin}/admin/login`,
              });
              if (error) {
                toast({
                  title: 'Anmeldung fehlgeschlagen',
                  description: 'Google-Anmeldung konnte nicht gestartet werden.',
                  variant: 'destructive',
                });
              }
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Mit Google anmelden
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
