import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
const COOKIE_CONSENT_KEY = 'ionio-cookie-consent';
export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      // Small delay for smoother appearance after page load
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);
  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };
  if (!isVisible) return null;
  return <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in" role="dialog" aria-label="Cookie-Hinweis">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-navy rounded-lg shadow-2xl border border-navy-light p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 border-solid opacity-70">
          {/* Icon & Text */}
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
            <p className="text-primary-foreground/90 text-sm md:text-base leading-relaxed">
              Wir verwenden ausschließlich <strong className="text-gold">technisch notwendige Cookies</strong>, 
              um diese Website bereitzustellen. Es findet <strong>kein</strong> Tracking statt.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button onClick={handleAccept} variant="gold" className="btn-animate flex-1 md:flex-none">
              OK
            </Button>
            <Button variant="ghost" asChild className="text-primary-foreground/70 hover:text-gold hover:bg-transparent flex-1 md:flex-none">
              <Link to="/datenschutz">Mehr erfahren</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>;
}