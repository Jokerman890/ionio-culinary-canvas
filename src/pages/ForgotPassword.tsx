import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logoImage from '@/assets/logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie Ihre E-Mail-Adresse ein.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'E-Mail gesendet',
        description: 'Prüfen Sie Ihren Posteingang für den Link zum Zurücksetzen.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Fehler',
        description: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <img 
            src={logoImage} 
            alt="IONIO Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <CardTitle className="font-serif text-2xl">Passwort vergessen</CardTitle>
          <CardDescription>
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-gold" />
              </div>
              <p className="text-muted-foreground">
                Falls ein Konto mit <strong>{email}</strong> existiert, haben wir Ihnen eine E-Mail mit einem Link zum Zurücksetzen gesendet.
              </p>
              <p className="text-sm text-muted-foreground">
                Bitte prüfen Sie auch Ihren Spam-Ordner.
              </p>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setEmailSent(false)}
              >
                Andere E-Mail eingeben
              </Button>
            </div>
          ) : (
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
              <Button
                type="submit"
                className="w-full bg-gold text-navy hover:bg-gold-light"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sende...
                  </>
                ) : (
                  'Link zum Zurücksetzen senden'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/admin/login"
              className="text-sm text-muted-foreground hover:text-gold transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Zurück zur Anmeldung
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
