import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/explore/locations/110032705230457/griechische-restaurant-ionio',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/p/Griechische-Restaurant-IONIO-100086946044930',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com/@ionio_restaurant23',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
];

export function ContactSection() {
  const { ref: titleRef, isRevealed: titleRevealed } = useScrollReveal<HTMLDivElement>();
  const { ref: contentRef, isRevealed: contentRevealed } = useScrollReveal<HTMLDivElement>();

  const mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=M%C3%BChlenstr.+23,+27777+Ganderkesee';

  return (
    <section id="kontakt" className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div 
          ref={titleRef}
          className={`scroll-reveal ${titleRevealed ? 'revealed' : ''} text-center mb-16`}
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 gold-underline inline-block">
            Kontakt & Anfahrt
          </h2>
          <p className="text-muted-foreground mt-8 max-w-2xl mx-auto">
            Wir freuen uns auf Ihren Besuch!
          </p>
        </div>

        <div 
          ref={contentRef}
          className={`scroll-reveal ${contentRevealed ? 'revealed' : ''}`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-1">Adresse</h3>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-gold transition-colors flex items-center gap-2 group"
                    >
                      Mühlenstr. 23, 27777 Ganderkesee
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-1">Reservierung</h3>
                    <p className="text-muted-foreground">
                      Rufen Sie uns an oder besuchen Sie uns direkt
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-1">Öffnungszeiten</h3>
                    <p className="text-muted-foreground">
                      Täglich geöffnet – Aktuelle Zeiten auf Anfrage
                    </p>
                  </div>
                </div>

                {/* Route Button */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gold text-navy px-6 py-3 rounded-md font-medium hover:bg-gold-light transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  Route planen
                </a>
              </div>

              {/* Social & Map Placeholder */}
              <div>
                <h3 className="font-serif text-lg text-foreground mb-6">Folgen Sie uns</h3>
                <div className="flex gap-4 mb-8">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon text-foreground hover:text-gold"
                      aria-label={link.name}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>

                {/* Map Embed */}
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2393.6!2d8.5!3d53.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b12b8a0!2sM%C3%BChlenstra%C3%9Fe%2023%2C%2027777%20Ganderkesee!5e0!3m2!1sde!2sde!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Restaurant Location"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
