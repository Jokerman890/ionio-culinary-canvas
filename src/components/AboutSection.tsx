import { useScrollReveal } from '@/hooks/useScrollReveal';

export function AboutSection() {
  const { ref: titleRef, isRevealed: titleRevealed } = useScrollReveal<HTMLDivElement>();
  const { ref: textRef, isRevealed: textRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="ueber-uns" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div 
            ref={titleRef}
            className={`scroll-reveal ${titleRevealed ? 'revealed' : ''}`}
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 gold-underline inline-block">
              Willkommen im IONIO
            </h2>
          </div>
          
          <div 
            ref={textRef}
            className={`scroll-reveal ${textRevealed ? 'revealed' : ''} mt-12`}
            style={{ transitionDelay: '90ms' }}
          >
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              Seit Generationen pflegen wir die Kunst der griechischen Gastfreundschaft. 
              Bei uns erleben Sie die Wärme der mediterranen Lebensart – mit jedem Gericht, 
              das wir servieren.
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              Unsere Küche verwendet ausschließlich frische, sorgfältig ausgewählte Zutaten. 
              Olivenöl aus Griechenland, aromatische Kräuter aus eigenem Anbau und Fisch 
              aus nachhaltiger Fischerei bilden die Grundlage unserer Gerichte.
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              In familiärer Atmosphäre laden wir Sie ein, die Vielfalt der griechischen 
              Küche zu entdecken – von traditionellen Rezepten bis zu modernen Interpretationen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
