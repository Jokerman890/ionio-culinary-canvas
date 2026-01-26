import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { menuCategories, allergenInfo, type MenuItem } from '@/data/menuData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Leaf, Star, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function MenuSection() {
  const { ref: titleRef, isRevealed: titleRevealed } = useScrollReveal<HTMLDivElement>();
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);

  return (
    <section id="speisekarte" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={titleRef}
          className={`scroll-reveal ${titleRevealed ? 'revealed' : ''} text-center mb-12`}
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 gold-underline inline-block">
            Unsere Speisekarte
          </h2>
          <p className="text-muted-foreground mt-8 max-w-2xl mx-auto">
            Entdecken Sie die Vielfalt der griechischen Küche – 
            von traditionellen Mezedes bis zu köstlichen Hauptgerichten vom Holzkohlegrill.
          </p>
        </div>

        <TooltipProvider>
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-8 p-0">
              {menuCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-gold data-[state=active]:text-navy bg-secondary text-foreground px-4 py-2 rounded-full transition-all duration-short"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {menuCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <MenuCategoryContent category={category} />
              </TabsContent>
            ))}
          </Tabs>
        </TooltipProvider>

        {/* Allergen Legend */}
        <AllergenLegend />
      </div>
    </section>
  );
}

function MenuCategoryContent({ category }: { category: typeof menuCategories[0] }) {
  return (
    <div className="animate-fade-in">
      {category.description && (
        <p className="text-center text-muted-foreground mb-8 italic">
          {category.description}
        </p>
      )}
      
      <div className="grid gap-4 md:gap-6 max-w-4xl mx-auto">
        {category.items.map((item, index) => (
          <MenuItemCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function MenuItemCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <div
      className="menu-item-card group flex justify-between items-start gap-4 p-4 md:p-5 rounded-lg bg-card border border-border/50 hover:border-gold/30 hover:shadow-md transition-all duration-short"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-serif text-lg md:text-xl text-foreground group-hover:text-gold transition-colors duration-short">
            {item.name}
          </h3>
          {item.vegetarian && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="border-accent text-accent-foreground px-1.5 py-0">
                  <Leaf className="w-3 h-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Vegetarisch</TooltipContent>
            </Tooltip>
          )}
          {item.popular && (
            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-gold/20 text-gold-dark border-gold/30 px-1.5 py-0">
                  <Star className="w-3 h-3 fill-current" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Besonders beliebt</TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {item.description && (
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {item.description}
          </p>
        )}
        
        {item.allergens && (
          <div className="mt-2 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <Info className="w-3 h-3" />
                <span>Allergene: {item.allergens}</span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  {item.allergens.split(', ').map((code) => (
                    <div key={code}>{code} = {allergenInfo[code.trim()] || code}</div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
      
      <div className="flex-shrink-0">
        <span className="font-semibold text-lg md:text-xl text-gold whitespace-nowrap">
          {item.price}
        </span>
      </div>
    </div>
  );
}

function AllergenLegend() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <Info className="w-4 h-4" />
        <span>Allergen-Informationen {isOpen ? 'ausblenden' : 'anzeigen'}</span>
      </button>
      
      {isOpen && (
        <div className="mt-4 p-4 bg-secondary rounded-lg animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
            {Object.entries(allergenInfo).map(([code, name]) => (
              <div key={code} className="flex items-center gap-1">
                <span className="font-medium">{code}</span>
                <span>= {name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <Leaf className="w-3 h-3 text-accent" />
              <span>= Vegetarisch</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-gold fill-gold" />
              <span>= Besonders beliebt</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
