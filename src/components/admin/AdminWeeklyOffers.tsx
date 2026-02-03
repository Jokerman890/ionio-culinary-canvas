import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

const priceSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.replace(',', '.') : value),
  z.coerce.number().min(0, 'Preis muss 0 oder größer sein'),
);

const optionalPriceSchema = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return typeof value === 'string' ? value.replace(',', '.') : value;
  },
  z.coerce.number().min(0, 'Preis muss 0 oder größer sein').optional(),
);

const weeklyOfferSchema = z.object({
  id: z.string(),
  position: z.number(),
  name: z.string().trim().min(1, 'Name erforderlich'),
  description: z.string().trim().max(500, 'Maximal 500 Zeichen').optional().or(z.literal('')),
  price: priceSchema,
  original_price: optionalPriceSchema,
  is_active: z.boolean(),
});

const weeklyOffersFormSchema = z.object({
  offers: z.array(weeklyOfferSchema).length(3),
});

type WeeklyOffersFormValues = z.input<typeof weeklyOffersFormSchema>;

export function AdminWeeklyOffers() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const {
    control,
    register,
    reset,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<WeeklyOffersFormValues>({
    resolver: zodResolver(weeklyOffersFormSchema),
    defaultValues: { offers: [] },
  });

  const { fields } = useFieldArray({
    control,
    name: 'offers',
    keyName: 'fieldId',
  });

  const watchedOffers = watch('offers');

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    try {
      const { data: initialData, error } = await supabase
        .from('weekly_offers')
        .select('*')
        .order('position');

      if (error) throw error;

      let data = (initialData || []).map((offer) => ({
        ...offer,
        is_active: offer.is_active ?? false,
      }));

      const existingPositions = new Set(data.map(offer => offer.position));
      const missingPositions = [1, 2, 3].filter(position => !existingPositions.has(position));

      if (missingPositions.length > 0) {
        const placeholders = missingPositions.map(position => ({
          position,
          name: `Wochenangebot ${position}`,
          description: null,
          price: 0,
          original_price: null,
          is_active: false,
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('weekly_offers')
          .insert(placeholders)
          .select('*');

        if (insertError) {
          toast({ title: 'Fehler beim Anlegen der Wochenangebote', variant: 'destructive' });
        } else if (inserted) {
          data = [...data, ...inserted].map((offer) => ({
            ...offer,
            is_active: offer.is_active ?? false,
          }));
        }
      }

      const offersMap = new Map(data.map(offer => [offer.position, offer]));
      const completeOffers = [1, 2, 3].flatMap((position) => {
        const offer = offersMap.get(position);
        return offer ? [offer] : [];
      });

      reset({
        offers: completeOffers.map((offer) => ({
          id: offer.id,
          position: offer.position,
          name: offer.name,
          description: offer.description ?? '',
          price: offer.price,
          original_price: offer.original_price ?? '',
          is_active: offer.is_active,
        })),
      });
    } catch (error) {
      console.error('Error fetching weekly offers:', error);
      toast({ title: 'Fehler beim Laden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const saveOffer = async (index: number) => {
    const isValid = await trigger(`offers.${index}` as const);
    if (!isValid) {
      toast({ title: 'Ungültige Eingaben', variant: 'destructive' });
      return;
    }

    const parsed = weeklyOffersFormSchema.parse(getValues());
    const offer = parsed.offers[index];

    setSaving(offer.position);
    try {
      const { error } = await supabase
        .from('weekly_offers')
        .update({
          name: offer.name,
          description: offer.description || null,
          price: offer.price,
          original_price: offer.original_price ?? null,
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
      const isValid = await trigger('offers');
      if (!isValid) {
        toast({ title: 'Ungültige Eingaben', variant: 'destructive' });
        return;
      }

      const parsed = weeklyOffersFormSchema.parse(getValues());

      for (const offer of parsed.offers) {
        const { error } = await supabase
          .from('weekly_offers')
          .update({
            name: offer.name,
            description: offer.description || null,
            price: offer.price,
            original_price: offer.original_price ?? null,
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
        {fields.map((offer, index) => {
          const offerState = watchedOffers?.[index];
          const isActive = offerState?.is_active ?? offer.is_active;
          return (
            <Card 
              key={offer.fieldId} 
              className={`border-2 transition-all duration-short ${
                isActive 
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
                  <Controller
                    control={control}
                    name={`offers.${index}.is_active` as const}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <input type="hidden" {...register(`offers.${index}.id` as const)} />
              <input type="hidden" {...register(`offers.${index}.position` as const, { valueAsNumber: true })} />
              <div className="space-y-2">
                <Label htmlFor={`name-${offer.position}`}>Gerichtname</Label>
                <Input
                  id={`name-${offer.position}`}
                  {...register(`offers.${index}.name` as const)}
                  placeholder="z.B. Gyros Spezial"
                />
                {errors.offers?.[index]?.name && (
                  <p className="text-xs text-destructive">{errors.offers[index]?.name?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`desc-${offer.position}`}>Beschreibung</Label>
                <Textarea
                  id={`desc-${offer.position}`}
                  {...register(`offers.${index}.description` as const)}
                  placeholder="Kurze Beschreibung..."
                  rows={2}
                />
                {errors.offers?.[index]?.description && (
                  <p className="text-xs text-destructive">{errors.offers[index]?.description?.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`price-${offer.position}`}>Angebotspreis (€)</Label>
                  <Input
                    id={`price-${offer.position}`}
                    type="text"
                    inputMode="decimal"
                    {...register(`offers.${index}.price` as const)}
                  />
                  {errors.offers?.[index]?.price && (
                    <p className="text-xs text-destructive">{errors.offers[index]?.price?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`orig-${offer.position}`}>Originalpreis (€)</Label>
                  <Input
                    id={`orig-${offer.position}`}
                    type="text"
                    inputMode="decimal"
                    {...register(`offers.${index}.original_price` as const)}
                    placeholder="Optional"
                  />
                  {errors.offers?.[index]?.original_price && (
                    <p className="text-xs text-destructive">{errors.offers[index]?.original_price?.message}</p>
                  )}
                </div>
              </div>

              <Button
                className="w-full bg-navy text-primary-foreground hover:bg-navy-light btn-animate"
                onClick={() => saveOffer(index)}
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
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Die Wochenangebote werden oben in der Speisekarte prominent angezeigt.
      </p>
    </div>
  );
}
