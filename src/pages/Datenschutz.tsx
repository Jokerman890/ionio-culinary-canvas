import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/logo.png';

const Datenschutz = () => {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display text-navy mb-8">
            Datenschutzerklärung nach DSGVO & TTDSG
          </h1>
          <p className="text-muted-foreground mb-8">Stand: 29. Januar 2026</p>

          <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">1. Verantwortlicher</h2>
              <p className="text-foreground/80">
                IONIO – Griechisches Restaurant, Inhaber: Akakii Ratiani<br />
                Mühlenstraße 23, 27777 Ganderkesee<br />
                Telefon: 04222 7741110 · E-Mail:{' '}
                <a href="mailto:info@ionio-ganderkesee.de" className="text-gold hover:underline">
                  info@ionio-ganderkesee.de
                </a>
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">2. Hosting / Server-Logs</h2>
              <p className="text-foreground/80">
                Wir hosten unsere Website bei <strong>Hostinger International Ltd.</strong> (61 Lordou Vironos Str., 
                6023 Larnaca, Zypern). Mit Hostinger besteht ein Auftragsverarbeitungsvertrag (Art. 28 DSGVO). 
                Hostinger verarbeitet u. a. IP-Adresse, Datum/Uhrzeit des Zugriffs, Request-Zeile, Referrer sowie 
                ggf. User-Agent in Server-Logfiles zur Sicherstellung von Stabilität und Sicherheit 
                (Art. 6 Abs. 1 lit. f DSGVO). Logdaten werden automatisch gelöscht, sobald der Zweck entfällt.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">3. Cookies und lokale Speicher (TTDSG)</h2>
              <p className="text-foreground/80">
                Aktuell setzen wir <strong>nur technisch notwendige Cookies</strong> ein (z. B. zur Auslieferung 
                der Website oder zur Speicherung Ihrer Einwilligungswahl). Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TTDSG 
                i. V. m. Art. 6 Abs. 1 lit. f DSGVO.
              </p>
              <p className="text-foreground/80 mt-2">
                <strong>Keine</strong> Analyse-, Marketing- oder Tracking-Cookies, sofern nicht nachfolgend 
                ausdrücklich benannt.
              </p>
              <p className="text-foreground/80 mt-2 italic">
                Hinweis: Falls zukünftig optionale Dienste (z. B. Google Maps, YouTube/Vimeo, Online-Reservierung, 
                Web-Analytics) eingebunden werden, ist vorher ein Einwilligungs-Banner (Consent-Management) 
                erforderlich; diese Erklärung wird dann erweitert.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">4. Kontaktaufnahme (Telefon/E-Mail)</h2>
              <p className="text-foreground/80">
                Bei Kontaktaufnahme verarbeiten wir die von Ihnen mitgeteilten Daten (z. B. Name, Telefonnummer, 
                E-Mail, Inhalte der Anfrage) zur Bearbeitung Ihres Anliegens (Art. 6 Abs. 1 lit. b DSGVO, ggf. lit. f). 
                Daten löschen wir, wenn die Anfrage erledigt ist und keine gesetzlichen Aufbewahrungsfristen 
                entgegenstehen.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">5. Bestellungen über Plattformen (z. B. Lieferando)</h2>
              <p className="text-foreground/80">
                Wenn Sie über externe Plattformen bestellen, erfolgt die Datenverarbeitung primär durch den jeweiligen 
                Anbieter nach dessen Datenschutzbestimmungen. Wir erhalten nur zur Vertragsabwicklung erforderliche 
                Daten (z. B. Bestellung, Lieferdetails) und verarbeiten diese zur Erfüllung des Vertrags 
                (Art. 6 Abs. 1 lit. b DSGVO).
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">6. Eingebundene Inhalte / Links zu sozialen Netzwerken</h2>
              <p className="text-foreground/80">
                Unsere Website kann auf unsere Social-Media-Profile verlinken. Beim Aufruf der verlinkten Plattformen 
                (z. B. Facebook/Instagram) gelten die Datenschutzbestimmungen des jeweiligen Anbieters. Eine 
                Datenerhebung durch uns findet dort nicht statt.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">7. Empfänger/Kategorien von Empfängern</h2>
              <ul className="list-disc list-inside text-foreground/80 space-y-1">
                <li>IT-Dienstleister/Hoster (Hostinger)</li>
                <li>ggf. öffentliche Stellen bei Vorliegen einer gesetzlichen Pflicht</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">8. Drittlandtransfer</h2>
              <p className="text-foreground/80">
                Ein Drittlandtransfer ist nicht beabsichtigt. Sollte er ausnahmsweise stattfinden (z. B. durch einzelne 
                Dienstleister), erfolgt dies nur auf Grundlage der Art. 44 ff. DSGVO (z. B. EU-Standardvertragsklauseln 
                oder Angemessenheitsbeschluss).
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">9. Speicherdauer</h2>
              <p className="text-foreground/80">
                Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist 
                oder gesetzliche Aufbewahrungsfristen bestehen. Server-Logdaten werden nach den 
                Sicherheits-/Betriebskonzepten des Hosters automatisch gelöscht.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-display text-navy mb-3">10. Ihre Rechte</h2>
              <p className="text-foreground/80">
                Sie haben die Rechte auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), 
                Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21 DSGVO). 
                Zudem besteht ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde, insbesondere in Niedersachsen.
              </p>
            </section>
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

export default Datenschutz;
