import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Star, Save, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getUserFriendlyError } from '@/lib/errorMessages';

interface WeeklyOffer {
  id: string;
  position: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

export function AdminWeeklyOffers() {
  const [offers, setOffers] = useState<WeeklyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weekly_offers')
        .select('*')
        .order('position');

      if (error) throw error;

      // Ensure we have all 3 positions
      const offersMap = new Map(data?.map(o => [o.position, o]));
      const completeOffers: WeeklyOffer[] = [];
      
      for (let i = 1; i <= 3; i++) {
        if (offersMap.has(i)) {
          completeOffers.push(offersMap.get(i)!);
        }
      }

      setOffers(completeOffers);
    } catch (error) {
      console.error('Error fetching weekly offers:', error);
      toast({ title: 'Fehler beim Laden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const updateOffer = (position: number, field: keyof WeeklyOffer, value: any) => {
    setOffers(prev => prev.map(o => 
      o.position === position ? { ...o, [field]: value } : o
    ));
  };

  const saveOffer = async (offer: WeeklyOffer) => {
    setSaving(offer.position);
    try {
      const { error } = await supabase
        .from('weekly_offers')
        .update({
          name: offer.name,
          description: offer.description,
          price: offer.price,
          original_price: offer.original_price,
          is_active: offer.is_active,
        })
        .eq('id', offer.id);

      if (error) throw error;
      toast({ title: `Angebot ${offer.position} gespeichert` });
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminWeeklyOffers.saveOffer');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const saveAllOffers = async () => {
    setSaving(-1);
    try {
      for (const offer of offers) {
        const { error } = await supabase
          .from('weekly_offers')
          .update({
            name: offer.name,
            description: offer.description,
            price: offer.price,
            original_price: offer.original_price,
            is_active: offer.is_active,
          })
          .eq('id', offer.id);

        if (error) throw error;
      }
      toast({ title: 'Alle Angebote gespeichert' });
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminWeeklyOffers.saveAllOffers');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-xl text-foreground">Wochenangebote</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOffers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
          <Button 
            className="bg-gold text-navy hover:bg-gold-light btn-animate"
            size="sm"
            onClick={saveAllOffers}
            disabled={saving !== null}
          >
            {saving === -1 ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Alle speichern
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {offers.map((offer) => (
          <Card 
            key={offer.id} 
            className={`border-2 transition-all duration-short ${
              offer.is_active 
                ? 'border-gold/50 bg-gold/5' 
                : 'border-border/50 opacity-60'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="bg-gold text-navy">
                    Angebot {offer.position}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Aktiv</span>
                  <Switch
                    checked={offer.is_active}
                    onCheckedChange={(checked) => updateOffer(offer.position, 'is_active', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${offer.position}`}>Gerichtname</Label>
                <Input
                  id={`name-${offer.position}`}
                  value={offer.name}
                  onChange={(e) => updateOffer(offer.position, 'name', e.target.value)}
                  placeholder="z.B. Gyros Spezial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`desc-${offer.position}`}>Beschreibung</Label>
                <Textarea
                  id={`desc-${offer.position}`}
                  value={offer.description || ''}
                  onChange={(e) => updateOffer(offer.position, 'description', e.target.value)}
                  placeholder="Kurze Beschreibung..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`price-${offer.position}`}>Angebotspreis (€)</Label>
                  <Input
                    id={`price-${offer.position}`}
                    type="number"
                    step="0.10"
                    value={offer.price}
                    onChange={(e) => updateOffer(offer.position, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`orig-${offer.position}`}>Originalpreis (€)</Label>
                  <Input
                    id={`orig-${offer.position}`}
                    type="number"
                    step="0.10"
                    value={offer.original_price || ''}
                    onChange={(e) => updateOffer(offer.position, 'original_price', parseFloat(e.target.value) || null)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-navy text-primary-foreground hover:bg-navy-light btn-animate"
                onClick={() => saveOffer(offer)}
                disabled={saving !== null}
              >
                {saving === offer.position ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Speichern
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Die Wochenangebote werden oben in der Speisekarte prominent angezeigt.
      </p>
    </div>
  );
}
