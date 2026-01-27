import { Star, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WeeklyOffer } from '@/hooks/useMenuData';

interface WeeklyOffersDisplayProps {
  offers: WeeklyOffer[];
}

export function WeeklyOffersDisplay({ offers }: WeeklyOffersDisplayProps) {
  if (offers.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Star className="w-5 h-5 text-gold fill-gold" />
        <h3 className="font-serif text-2xl md:text-3xl text-foreground">
          Wochenangebote
        </h3>
        <Star className="w-5 h-5 text-gold fill-gold" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
        {offers.map((offer, index) => (
          <Card 
            key={offer.id} 
            className="group relative overflow-hidden border-2 border-gold/30 bg-gradient-to-br from-gold/5 to-gold/10 hover:border-gold/60 transition-all duration-short hover:shadow-lg hover:shadow-gold/10"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Discount Badge */}
            {offer.original_price && offer.original_price > offer.price && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-destructive text-destructive-foreground flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {Math.round((1 - offer.price / offer.original_price) * 100)}%
                </Badge>
              </div>
            )}
            
            <CardContent className="p-5 text-center">
              <div className="mb-3">
                <Badge className="bg-gold text-navy font-medium">
                  Angebot {offer.position}
                </Badge>
              </div>
              
              <h4 className="font-serif text-lg md:text-xl text-foreground mb-2 group-hover:text-gold transition-colors duration-short">
                {offer.name}
              </h4>
              
              {offer.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {offer.description}
                </p>
              )}
              
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold text-gold">
                  {offer.price.toFixed(2).replace('.', ',')} €
                </span>
                {offer.original_price && offer.original_price > offer.price && (
                  <span className="text-muted-foreground line-through text-sm">
                    {offer.original_price.toFixed(2).replace('.', ',')} €
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
