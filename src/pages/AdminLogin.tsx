import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import logoImage from '@/assets/logo.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, role, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: error.message === 'Invalid login credentials' 
          ? 'Ungültige E-Mail oder Passwort.' 
          : error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
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
