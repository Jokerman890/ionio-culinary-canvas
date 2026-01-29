import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/logo.png';

const Impressum = () => {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/">
            <img src={logoImage} alt="IONIO Restaurant Logo" className="h-10 md:h-12 w-auto" />
          </Link>
          <Button variant="ghost" asChild className="text-primary-foreground hover:text-gold">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Zurück zur Startseite
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto prose prose-lg prose-headings:text-navy prose-headings:font-display prose-p:text-foreground/80 prose-a:text-gold prose-a:no-underline hover:prose-a:underline">
          <h1 className="text-3xl md:text-4xl font-display text-navy mb-8">Impressum</h1>
          
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <p className="font-semibold text-navy text-lg">IONIO – Griechisches Restaurant</p>
              <p><strong>Inhaber (vertretungsberechtigt):</strong> Akakii Ratiani</p>
              <p><strong>Anschrift:</strong> Mühlenstraße 23, 27777 Ganderkesee</p>
              <p><strong>Telefon:</strong> 04222 7741110</p>
              <p><strong>E-Mail:</strong> <a href="mailto:info@ionio-ganderkesee.de">info@ionio-ganderkesee.de</a></p>
              <p><strong>Website:</strong> <a href="https://www.ionio-ganderkesee.de" target="_blank" rel="noopener noreferrer">https://www.ionio-ganderkesee.de</a></p>
              <p><strong>USt-ID:</strong> DE356173230</p>
              <p><strong>Unternehmensform:</strong> Inhaberbetrieb (nicht im Handelsregister eingetragen)</p>
            </div>

            <div>
              <h2 className="text-xl font-display text-navy mt-6 mb-3">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
              <p>Akakii Ratiani, Anschrift wie oben.</p>
            </div>

            <div>
              <h2 className="text-xl font-display text-navy mt-6 mb-3">Online-Streitbeilegung / Verbraucherstreitbeilegung</h2>
              <p>
                Die EU-Plattform zur Online-Streitbeilegung:{' '}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p>
                Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-display text-navy mt-6 mb-3">Hosting</h2>
              <p>
                Diese Website wird bei <strong>Hostinger International Ltd.</strong>, 61 Lordou Vironos Str., 
                6023 Larnaca, Zypern, gehostet.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-foreground/40 text-sm">
            © {new Date().getFullYear()} Griechisches Restaurant IONIO. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Impressum;
