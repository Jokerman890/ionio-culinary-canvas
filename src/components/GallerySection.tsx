import { useState } from 'react';
import { X } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import galleryInterior from '@/assets/gallery-interior.jpg';
import gallerySalad from '@/assets/gallery-salad.jpg';
import galleryGrill from '@/assets/gallery-grill.jpg';
import galleryDessert from '@/assets/gallery-dessert.jpg';
import dishMeat from '@/assets/dish-meat.jpg';
import dishFish from '@/assets/dish-fish.jpg';

const images = [
  { src: galleryInterior, alt: 'Restaurant Innenraum' },
  { src: gallerySalad, alt: 'Griechischer Salat' },
  { src: galleryGrill, alt: 'Grill' },
  { src: dishMeat, alt: 'Lammkoteletts' },
  { src: galleryDessert, alt: 'Baklava' },
  { src: dishFish, alt: 'Gegrillter Fisch' },
];

export function GallerySection() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const { ref: titleRef, isRevealed: titleRevealed } = useScrollReveal<HTMLDivElement>();

  const closeLightbox = () => {
    setIsClosing(true);
    setTimeout(() => {
      setLightboxImage(null);
      setIsClosing(false);
    }, 200);
  };

  return (
    <section id="galerie" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div 
          ref={titleRef}
          className={`scroll-reveal ${titleRevealed ? 'revealed' : ''} text-center mb-16`}
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 gold-underline inline-block">
            Impressionen
          </h2>
          <p className="text-muted-foreground mt-8 max-w-2xl mx-auto">
            Ein Einblick in unsere Welt – Atmosphäre, Genuss und Gastfreundschaft.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <GalleryImage 
              key={image.src} 
              image={image} 
              index={index}
              onClick={() => setLightboxImage(image.src)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/95 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            aria-label="Schließen"
          >
            <X size={32} />
          </button>
          <img
            src={lightboxImage}
            alt="Gallery image"
            className={`max-w-full max-h-[90vh] object-contain rounded-lg ${
              isClosing ? 'lightbox-exit' : 'lightbox-enter'
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

function GalleryImage({ 
  image, 
  index, 
  onClick 
}: { 
  image: typeof images[0]; 
  index: number;
  onClick: () => void;
}) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isRevealed ? 'revealed' : ''} cursor-pointer`}
      style={{ transitionDelay: `${index * 60}ms` }}
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg group">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          width={400}
          height={400}
          className="w-full h-full object-cover gallery-image"
        />
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/15 gallery-overlay" />
      </div>
    </div>
  );
}
