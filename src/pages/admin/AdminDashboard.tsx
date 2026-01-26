import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, ImageIcon, FolderOpen, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface Stats {
  menuItems: number;
  categories: number;
  galleryImages: number;
  users: number;
}

export default function AdminDashboard() {
  const { isAdmin } = useAuthContext();
  const [stats, setStats] = useState<Stats>({
    menuItems: 0,
    categories: 0,
    galleryImages: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [menuItemsRes, categoriesRes, galleryRes, usersRes] = await Promise.all([
          supabase.from('menu_items').select('id', { count: 'exact', head: true }),
          supabase.from('menu_categories').select('id', { count: 'exact', head: true }),
          supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
          isAdmin 
            ? supabase.from('user_roles').select('id', { count: 'exact', head: true })
            : Promise.resolve({ count: 0 }),
        ]);

        setStats({
          menuItems: menuItemsRes.count || 0,
          categories: categoriesRes.count || 0,
          galleryImages: galleryRes.count || 0,
          users: usersRes.count || 0,
        });
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

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif">Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href="/admin/menu" 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <UtensilsCrossed className="w-5 h-5 text-gold" />
                <span>Speisekarte bearbeiten</span>
              </a>
              <a 
                href="/admin/gallery" 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-gold" />
                <span>Galerie verwalten</span>
              </a>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif">Tipps</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>• Aktualisieren Sie regelmäßig die Speisekarte</p>
              <p>• Laden Sie neue Fotos für die Galerie hoch</p>
              <p>• Halten Sie die Öffnungszeiten aktuell</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
