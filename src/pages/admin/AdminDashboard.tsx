import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, ImageIcon, FolderOpen, Users, Star, Clock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface Stats {
  menuItems: number;
  categories: number;
  galleryImages: number;
  users: number;
  activeOffers: number;
  totalOffers: number;
  unavailableItems: number;
  hiddenImages: number;
}

interface WeeklyOfferSummary {
  name: string;
  price: number;
  is_active: boolean;
  position: number;
}

export default function AdminDashboard() {
  const { isAdmin } = useAuthContext();
  const [stats, setStats] = useState<Stats>({
    menuItems: 0,
    categories: 0,
    galleryImages: 0,
    users: 0,
    activeOffers: 0,
    totalOffers: 0,
    unavailableItems: 0,
    hiddenImages: 0,
  });
  const [weeklyOffers, setWeeklyOffers] = useState<WeeklyOfferSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [menuItemsRes, categoriesRes, galleryRes, usersRes, offersRes, unavailableRes, hiddenRes] = await Promise.all([
          supabase.from('menu_items').select('id', { count: 'exact', head: true }),
          supabase.from('menu_categories').select('id', { count: 'exact', head: true }),
          supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
          isAdmin 
            ? supabase.from('user_roles').select('id', { count: 'exact', head: true })
            : Promise.resolve({ count: 0 }),
          supabase.from('weekly_offers').select('name, price, is_active, position').order('position'),
          supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('is_available', false),
          supabase.from('gallery_images').select('id', { count: 'exact', head: true }).eq('is_visible', false),
        ]);

        const offers = (offersRes as { data: WeeklyOfferSummary[] | null }).data || [];

        setStats({
          menuItems: menuItemsRes.count || 0,
          categories: categoriesRes.count || 0,
          galleryImages: galleryRes.count || 0,
          users: usersRes.count || 0,
          activeOffers: offers.filter(o => o.is_active).length,
          totalOffers: offers.length,
          unavailableItems: unavailableRes.count || 0,
          hiddenImages: hiddenRes.count || 0,
        });
        setWeeklyOffers(offers);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [isAdmin]);

  const statCards = [
    { title: 'Gerichte', value: stats.menuItems, icon: UtensilsCrossed, color: 'text-gold' },
    { title: 'Kategorien', value: stats.categories, icon: FolderOpen, color: 'text-blue-500' },
    { title: 'Galerie-Fotos', value: stats.galleryImages, icon: ImageIcon, color: 'text-green-500' },
  ];

  if (isAdmin) {
    statCards.push({ title: 'Mitarbeiter', value: stats.users, icon: Users, color: 'text-purple-500' });
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Willkommen im Admin-Bereich</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Warnings */}
        {!loading && (stats.unavailableItems > 0 || stats.hiddenImages > 0) && (
          <div className="flex flex-wrap gap-3">
            {stats.unavailableItems > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4" />
                {stats.unavailableItems} Gericht{stats.unavailableItems > 1 ? 'e' : ''} nicht verfügbar
              </div>
            )}
            {stats.hiddenImages > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
                <EyeOff className="w-4 h-4" />
                {stats.hiddenImages} Bild{stats.hiddenImages > 1 ? 'er' : ''} ausgeblendet
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Offers Status */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Star className="w-5 h-5 text-gold" />
                Wochenangebote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-muted-foreground">Laden...</p>
              ) : weeklyOffers.length === 0 ? (
                <p className="text-muted-foreground">Keine Wochenangebote angelegt.</p>
              ) : (
                weeklyOffers.map((offer) => (
                  <div key={offer.position} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge className={offer.is_active ? 'bg-gold text-navy' : 'bg-muted text-muted-foreground'}>
                        {offer.position}
                      </Badge>
                      <span className={`text-sm ${!offer.is_active ? 'text-muted-foreground line-through' : ''}`}>
                        {offer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{offer.price.toFixed(2)} €</span>
                      {offer.is_active ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))
              )}
              <Link 
                to="/admin/menu"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
              >
                <Star className="w-4 h-4 text-gold" />
                <span>Wochenangebote bearbeiten</span>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif">Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                to="/admin/menu" 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <UtensilsCrossed className="w-5 h-5 text-gold" />
                <span>Speisekarte bearbeiten</span>
              </Link>
              <Link 
                to="/admin/gallery" 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-gold" />
                <span>Galerie verwalten</span>
              </Link>
              <Link 
                to="/admin/settings" 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Clock className="w-5 h-5 text-gold" />
                <span>Öffnungszeiten & Kontakt</span>
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin/users" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Users className="w-5 h-5 text-gold" />
                  <span>Mitarbeiter verwalten</span>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Tipps</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>• Aktualisieren Sie regelmäßig die Speisekarte und Wochenangebote</p>
            <p>• Laden Sie neue Fotos für die Galerie hoch</p>
            <p>• Halten Sie die Öffnungszeiten aktuell</p>
            <p>• Deaktivieren Sie nicht verfügbare Gerichte statt sie zu löschen</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
