import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-restaurant.jpg';

export function HeroSection() {
  const scrollToContact = () => {
    const element = document.querySelector('#kontakt');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - using img for better LCP optimization */}
      <img 
        src={heroImage}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-16">
        <h1 className="hero-animate font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-6 leading-tight">
          Authentische griechische Küche
          <span className="block text-gold mt-2">in Ganderkesee</span>
        </h1>
        
        <p className="hero-animate hero-animate-delay-1 text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto font-light tracking-wide">
          Tradition. Qualität. Mediterraner Genuss.
        </p>
        
        <div className="hero-animate hero-animate-delay-2 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="hero" 
            size="xl"
            onClick={scrollToContact}
            className="btn-animate btn-glow"
          >
            Kontakt & Anfahrt
          </Button>
          <Button 
            variant="heroOutline" 
            size="xl"
            onClick={() => {
              const el = document.querySelector('#speisekarte');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-animate"
          >
            Speisekarte
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-animate hero-animate-delay-2">
        <div className="w-6 h-10 border-2 border-primary-foreground/40 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary-foreground/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
