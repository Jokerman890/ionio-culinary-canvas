import { useScrollReveal } from '@/hooks/useScrollReveal';
import dishMeat from '@/assets/dish-meat.jpg';
import dishFish from '@/assets/dish-fish.jpg';
import dishMeze from '@/assets/dish-meze.jpg';

const dishes = [
  {
    title: 'Fleischgerichte',
    description: 'Zarte Lammkoteletts vom Grill, saftige Souvlaki-Spieße und würziges Gyros – jedes Gericht wird nach traditionellen Rezepten zubereitet.',
    image: dishMeat,
  },
  {
    title: 'Fischgerichte',
    description: 'Frischer Fisch aus dem Mittelmeer, gegrillt mit Zitrone und Kräutern. Ein Geschmack, der Sie ans Meer entführt.',
    image: dishFish,
  },
  {
    title: 'Vegetarische Meze',
    description: 'Cremiger Hummus, erfrischender Tzatziki und gefüllte Weinblätter – eine Vielfalt mediterraner Köstlichkeiten.',
    image: dishMeze,
  },
];

export function KitchenSection() {
  const { ref: titleRef, isRevealed: titleRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="kueche" className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div 
          ref={titleRef}
          className={`scroll-reveal ${titleRevealed ? 'revealed' : ''} text-center mb-16`}
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 gold-underline inline-block">
            Unsere Küche
          </h2>
          <p className="text-muted-foreground mt-8 max-w-2xl mx-auto">
            Entdecken Sie die Höhepunkte unserer Speisekarte – 
            authentische Gerichte mit mediterranem Charakter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {dishes.map((dish, index) => (
            <DishCard key={dish.title} dish={dish} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DishCard({ dish, index }: { dish: typeof dishes[0]; index: number }) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isRevealed ? 'revealed' : ''} card-hover`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="bg-card rounded-lg overflow-hidden shadow-lg h-full">
        <div className="aspect-square overflow-hidden">
          <img
            src={dish.image}
            alt={dish.title}
            className="w-full h-full object-cover gallery-image"
          />
        </div>
        <div className="p-6">
          <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3">
            {dish.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {dish.description}
          </p>
        </div>
      </div>
    </div>
  );
}
