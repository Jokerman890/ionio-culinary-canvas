import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

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

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({ street: '', zip: '', city: '' });
  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    monday: { ...defaultHours },
    tuesday: { ...defaultHours, closed: true },
    wednesday: { ...defaultHours },
    thursday: { ...defaultHours },
    friday: { ...defaultHours },
    saturday: { ...defaultHours },
    sunday: { ...defaultHours },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*');

      if (error) throw error;

      data?.forEach(setting => {
        if (setting.key === 'phone') {
          setPhone(JSON.parse(JSON.stringify(setting.value)));
        } else if (setting.key === 'address') {
          setAddress(setting.value as any);
        } else if (setting.key === 'opening_hours') {
          setOpeningHours(setting.value as any);
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({ title: 'Fehler beim Laden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const updateDayHours = (day: keyof OpeningHours, field: keyof DayHours, value: string | boolean) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Update all settings using upsert
      const updates = [
        { key: 'phone', value: phone as unknown },
        { key: 'address', value: address as unknown },
        { key: 'opening_hours', value: openingHours as unknown },
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
            .update({ value: update.value as any })
            .eq('key', update.key);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('restaurant_settings')
            .insert({ key: update.key, value: update.value as any });
          if (error) throw error;
        }
      }

      toast({ title: 'Einstellungen gespeichert' });
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="04222 77 411 10"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Straße</Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="Mühlenstr. 23"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">PLZ</Label>
                <Input
                  id="zip"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  placeholder="27777"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Ganderkesee"
                />
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
            {(Object.keys(dayLabels) as Array<keyof OpeningHours>).map(day => (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-border/30 last:border-0">
                <div className="w-28 font-medium">{dayLabels[day]}</div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!openingHours[day].closed}
                    onCheckedChange={(checked) => updateDayHours(day, 'closed', !checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {openingHours[day].closed ? 'Ruhetag' : 'Geöffnet'}
                  </span>
                </div>

                {!openingHours[day].closed && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={openingHours[day].open}
                      onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                      className="w-28"
                    />
                    <span>–</span>
                    <Input
                      type="time"
                      value={openingHours[day].close}
                      onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                      className="w-28"
                    />
                    <span className="text-muted-foreground">&</span>
                    <Input
                      type="time"
                      value={openingHours[day].evening_open}
                      onChange={(e) => updateDayHours(day, 'evening_open', e.target.value)}
                      className="w-28"
                    />
                    <span>–</span>
                    <Input
                      type="time"
                      value={openingHours[day].evening_close}
                      onChange={(e) => updateDayHours(day, 'evening_close', e.target.value)}
                      className="w-28"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
