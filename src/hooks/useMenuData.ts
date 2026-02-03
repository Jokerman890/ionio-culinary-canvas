import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[] | null;
  is_vegetarian: boolean | null;
  is_available: boolean | null;
  is_popular: boolean | null;
  sort_order: number;
}

export interface WeeklyOffer {
  id: string;
  position: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  is_active: boolean | null;
  valid_from: string | null;
  valid_until: string | null;
}

export function useMenuData() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [weeklyOffers, setWeeklyOffers] = useState<WeeklyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuData();
  }, []);

  async function fetchMenuData() {
    try {
      setLoading(true);
      setError(null);

      const [categoriesRes, itemsRes, offersRes] = await Promise.all([
        supabase
          .from('menu_categories')
          .select('*')
          .order('sort_order'),
        supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('sort_order'),
        supabase
          .from('weekly_offers')
          .select('*')
          .eq('is_active', true)
          .order('position'),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (offersRes.error) throw offersRes.error;

      setCategories(categoriesRes.data || []);
      setMenuItems(itemsRes.data || []);
      setWeeklyOffers(offersRes.data || []);
    } catch (err: unknown) {
      console.error('Error fetching menu data:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unbekannter Fehler');
      }
    } finally {
      setLoading(false);
    }
  }

  // Group items by category
  const itemsByCategory = categories.map(category => ({
    ...category,
    items: menuItems.filter(item => item.category_id === category.id),
  }));

  return {
    categories,
    menuItems,
    weeklyOffers,
    itemsByCategory,
    loading,
    error,
    refetch: fetchMenuData,
  };
}
