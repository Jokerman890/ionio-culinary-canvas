import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { getUserFriendlyError } from '@/lib/errorMessages';

interface DayHours {
  open: string;
  close: string;
  evening_open: string;
  evening_close: string;
  closed: boolean;
}

interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

const dayLabels: Record<keyof OpeningHours, string> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
};

const defaultHours: DayHours = {
  open: '11:30',
  close: '14:30',
  evening_open: '17:30',
  evening_close: '22:30',
  closed: false,
};

const dayHoursSchema = z.object({
  open: z.string().min(1, 'Erforderlich'),
  close: z.string().min(1, 'Erforderlich'),
  evening_open: z.string().min(1, 'Erforderlich'),
  evening_close: z.string().min(1, 'Erforderlich'),
  closed: z.boolean(),
});

const addressSchema = z.object({
  street: z.string().trim().min(1, 'Straße erforderlich'),
  zip: z.string().trim().min(3, 'PLZ erforderlich'),
  city: z.string().trim().min(1, 'Stadt erforderlich'),
});

const openingHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

const settingsSchema = z.object({
  phone: z.string().trim().min(5, 'Telefonnummer erforderlich'),
  address: addressSchema,
  openingHours: openingHoursSchema,
});

type SettingsFormValues = z.input<typeof settingsSchema>;

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    control,
    register,
    reset,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      phone: '',
      address: { street: '', zip: '', city: '' },
      openingHours: {
        monday: { ...defaultHours },
        tuesday: { ...defaultHours, closed: true },
        wednesday: { ...defaultHours },
        thursday: { ...defaultHours },
        friday: { ...defaultHours },
        saturday: { ...defaultHours },
        sunday: { ...defaultHours },
      },
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const watchedOpeningHours = watch('openingHours');

  async function fetchSettings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*');

      if (error) throw error;

      const currentValues = getValues();
      const nextValues: SettingsFormValues = {
        phone: currentValues.phone,
        address: currentValues.address,
        openingHours: currentValues.openingHours,
      };

      data?.forEach(setting => {
        if (setting.key === 'phone') {
          nextValues.phone = String(setting.value ?? '');
        } else if (setting.key === 'address') {
          nextValues.address = setting.value as SettingsFormValues['address'];
        } else if (setting.key === 'opening_hours') {
          nextValues.openingHours = setting.value as SettingsFormValues['openingHours'];
        }
      });

      reset(nextValues);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({ title: 'Fehler beim Laden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const saveSettings = async () => {
    setSaving(true);
    try {
      const isValid = await trigger();
      if (!isValid) {
        toast({ title: 'Ungültige Eingaben', variant: 'destructive' });
        return;
      }

      const values = settingsSchema.parse(getValues());
      // Update all settings using upsert
      const updates = [
        { key: 'phone', value: values.phone as unknown },
        { key: 'address', value: values.address as unknown },
        { key: 'opening_hours', value: values.openingHours as unknown },
      ];

      for (const update of updates) {
        // First try to update, if no rows affected, insert
        const { data: existing } = await supabase
          .from('restaurant_settings')
          .select('id')
          .eq('key', update.key)
          .maybeSingle();
        
        if (existing) {
          const { error } = await supabase
            .from('restaurant_settings')
            .update({ value: update.value as import('@/integrations/supabase/types').Json })
            .eq('key', update.key);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('restaurant_settings')
            .insert({ key: update.key, value: update.value as import('@/integrations/supabase/types').Json });
          if (error) throw error;
        }
      }

      toast({ title: 'Einstellungen gespeichert' });
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminSettings.saveSettings');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Einstellungen</h1>
            <p className="text-muted-foreground mt-1">Kontaktdaten und Öffnungszeiten</p>
          </div>
          <Button 
            className="bg-gold text-navy hover:bg-gold-light"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Speichern
          </Button>
        </div>

        {/* Contact Info */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Kontaktdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="04222 77 411 10"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Straße</Label>
                <Input
                  id="street"
                  {...register('address.street')}
                  placeholder="Mühlenstr. 23"
                />
                {errors.address?.street && (
                  <p className="text-xs text-destructive">{errors.address.street.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">PLZ</Label>
                <Input
                  id="zip"
                  {...register('address.zip')}
                  placeholder="27777"
                />
                {errors.address?.zip && (
                  <p className="text-xs text-destructive">{errors.address.zip.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  {...register('address.city')}
                  placeholder="Ganderkesee"
                />
                {errors.address?.city && (
                  <p className="text-xs text-destructive">{errors.address.city.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Öffnungszeiten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(dayLabels) as Array<keyof OpeningHours>).map(day => {
              const dayState = watchedOpeningHours?.[day];
              const isClosed = dayState?.closed ?? false;
              return (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-border/30 last:border-0">
                <div className="w-28 font-medium">{dayLabels[day]}</div>
                
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`openingHours.${day}.closed` as const}
                    render={({ field }) => (
                      <Switch checked={!field.value} onCheckedChange={(checked) => field.onChange(!checked)} />
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isClosed ? 'Ruhetag' : 'Geöffnet'}
                  </span>
                </div>

                {!isClosed && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      {...register(`openingHours.${day}.open` as const)}
                      className="w-28"
                    />
                    {errors.openingHours?.[day]?.open && (
                      <p className="text-xs text-destructive">{errors.openingHours[day]?.open?.message}</p>
                    )}
                    <span>–</span>
                    <Input
                      type="time"
                      {...register(`openingHours.${day}.close` as const)}
                      className="w-28"
                    />
                    {errors.openingHours?.[day]?.close && (
                      <p className="text-xs text-destructive">{errors.openingHours[day]?.close?.message}</p>
                    )}
                    <span className="text-muted-foreground">&</span>
                    <Input
                      type="time"
                      {...register(`openingHours.${day}.evening_open` as const)}
                      className="w-28"
                    />
                    {errors.openingHours?.[day]?.evening_open && (
                      <p className="text-xs text-destructive">{errors.openingHours[day]?.evening_open?.message}</p>
                    )}
                    <span>–</span>
                    <Input
                      type="time"
                      {...register(`openingHours.${day}.evening_close` as const)}
                      className="w-28"
                    />
                    {errors.openingHours?.[day]?.evening_close && (
                      <p className="text-xs text-destructive">{errors.openingHours[day]?.evening_close?.message}</p>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
