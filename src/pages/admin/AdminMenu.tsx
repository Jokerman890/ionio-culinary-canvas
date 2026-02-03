import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Star, UtensilsCrossed, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AdminWeeklyOffers } from '@/components/admin/AdminWeeklyOffers';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { allergenInfo } from '@/data/menuData';

interface Category {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[];
  is_vegetarian: boolean;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
}

const allergenCodes = Object.keys(allergenInfo);
const allergenCodeList = allergenCodes.map(code => code.toUpperCase()).join(', ');

const parseAllergens = (value: string) =>
  value
    .split(',')
    .map(a => a.trim().toLowerCase())
    .filter(Boolean);

const getInvalidAllergens = (value: string) =>
  parseAllergens(value).filter(code => !allergenCodes.includes(code));

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name erforderlich'),
  description: z.string().trim().max(500, 'Maximal 500 Zeichen').optional().or(z.literal('')),
});

  type CategoryFormValues = z.input<typeof categorySchema>;

const itemPriceSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') {
      return value.replace(',', '.');
    }
    return value;
  },
  z.coerce.number().min(0.01, 'Preis muss größer als 0 sein'),
);

const itemSchema = z
  .object({
    categoryId: z.string().min(1, 'Kategorie erforderlich'),
    name: z.string().trim().min(1, 'Name erforderlich'),
    description: z.string().trim().max(1000, 'Maximal 1000 Zeichen').optional().or(z.literal('')),
    price: itemPriceSchema,
    allergens: z.string().optional().or(z.literal('')),
    isVegetarian: z.boolean(),
    isAvailable: z.boolean(),
    isPopular: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const invalid = getInvalidAllergens(values.allergens ?? '');
    if (invalid.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allergens'],
        message: `Unbekannte Codes: ${invalid.map(code => code.toUpperCase()).join(', ')}`,
      });
    }
  });

  type ItemFormValues = z.input<typeof itemSchema>;

export default function AdminMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  
  // Item dialog state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemAllergens, setItemAllergens] = useState('');
  const [itemVegetarian, setItemVegetarian] = useState(false);
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemPopular, setItemPopular] = useState(false);
  const [itemCategoryId, setItemCategoryId] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const itemForm = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      price: 0,
      allergens: '',
      isVegetarian: false,
      isAvailable: true,
      isPopular: false,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order'),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setCategories(categoriesRes.data || []);
      setMenuItems(itemsRes.data || []);
      
      if (categoriesRes.data?.length && !selectedCategory) {
        setSelectedCategory(categoriesRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast({ title: 'Fehler beim Laden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  // Category handlers
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description || '');
      categoryForm.reset({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDescription('');
      categoryForm.reset({ name: '', description: '' });
    }
    categoryForm.clearErrors();
    setCategoryDialogOpen(true);
  };

  const saveCategory = async () => {
    const valid = await categoryForm.trigger();
    if (!valid) {
      const message = categoryForm.formState.errors.name?.message
        ?? categoryForm.formState.errors.description?.message
        ?? 'Bitte prüfen Sie Ihre Eingaben.';
      toast({ title: 'Ungültige Eingaben', description: message, variant: 'destructive' });
      return;
    }

    const values = categoryForm.getValues();

    setSaving(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('menu_categories')
          .update({ name: values.name, description: values.description || null })
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast({ title: 'Kategorie aktualisiert' });
      } else {
        const { error } = await supabase
          .from('menu_categories')
          .insert({
            name: values.name,
            description: values.description || null,
            sort_order: categories.length,
          });
        if (error) throw error;
        toast({ title: 'Kategorie erstellt' });
      }
      setCategoryDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminMenu.saveCategory');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Kategorie und alle zugehörigen Gerichte löschen?')) return;
    
    try {
      const { error } = await supabase.from('menu_categories').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Kategorie gelöscht' });
      fetchData();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminMenu.deleteCategory');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    }
  };

  // Item handlers
  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemDescription(item.description || '');
      setItemPrice(item.price.toString());
      setItemAllergens(item.allergens?.join(', ') || '');
      setItemVegetarian(item.is_vegetarian);
      setItemAvailable(item.is_available);
      setItemPopular(item.is_popular || false);
      setItemCategoryId(item.category_id);
      itemForm.reset({
        categoryId: item.category_id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        allergens: item.allergens?.join(', ') || '',
        isVegetarian: item.is_vegetarian,
        isAvailable: item.is_available,
        isPopular: item.is_popular || false,
      });
    } else {
      const fallbackCategory = selectedCategory || categories[0]?.id || '';
      setEditingItem(null);
      setItemName('');
      setItemDescription('');
      setItemPrice('');
      setItemAllergens('');
      setItemVegetarian(false);
      setItemAvailable(true);
      setItemPopular(false);
      setItemCategoryId(fallbackCategory);
      itemForm.reset({
        categoryId: fallbackCategory,
        name: '',
        description: '',
        price: 0,
        allergens: '',
        isVegetarian: false,
        isAvailable: true,
        isPopular: false,
      });
    }
    itemForm.clearErrors();
    setItemDialogOpen(true);
  };

  const saveItem = async () => {
    const valid = await itemForm.trigger();
    if (!valid) {
      const message = itemForm.formState.errors.name?.message
        ?? itemForm.formState.errors.price?.message
        ?? itemForm.formState.errors.categoryId?.message
        ?? itemForm.formState.errors.allergens?.message
        ?? 'Bitte prüfen Sie Ihre Eingaben.';
      toast({ title: 'Ungültige Eingaben', description: message, variant: 'destructive' });
      return;
    }

    const parsed = itemSchema.parse(itemForm.getValues());
    const allergensArray = parseAllergens(parsed.allergens ?? '');

    setSaving(true);
    try {
      const itemData = {
        category_id: parsed.categoryId,
        name: parsed.name,
        description: parsed.description || null,
        price: parsed.price,
        allergens: allergensArray,
        is_vegetarian: parsed.isVegetarian,
        is_available: parsed.isAvailable,
        is_popular: parsed.isPopular,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: 'Gericht aktualisiert' });
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            ...itemData,
            sort_order: menuItems.filter(i => i.category_id === parsed.categoryId).length,
          });
        if (error) throw error;
        toast({ title: 'Gericht erstellt' });
      }
      setItemDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminMenu.saveItem');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Gericht löschen?')) return;
    
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Gericht gelöscht' });
      fetchData();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminMenu.deleteItem');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);
      if (error) throw error;
      fetchData();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminMenu.toggleAvailability');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    }
  };

  const moveItem = async (item: MenuItem, direction: 'up' | 'down') => {
    if (!selectedCategory) return;

    const categoryItems = menuItems
      .filter(current => current.category_id === selectedCategory)
      .sort((a, b) => a.sort_order - b.sort_order);

    const currentIndex = categoryItems.findIndex(current => current.id === item.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= categoryItems.length) {
      return;
    }

    const targetItem = categoryItems[targetIndex];
    setReorderingId(item.id);

    try {
      const { error: updateCurrentError } = await supabase
        .from('menu_items')
        .update({ sort_order: targetItem.sort_order })
        .eq('id', item.id);

      if (updateCurrentError) throw updateCurrentError;

      const { error: updateTargetError } = await supabase
        .from('menu_items')
        .update({ sort_order: item.sort_order })
        .eq('id', targetItem.id);

      if (updateTargetError) throw updateTargetError;

      fetchData();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminMenu.moveItem');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setReorderingId(null);
    }
  };

  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  const invalidAllergens = getInvalidAllergens(itemAllergens);
  const categoryErrors = categoryForm.formState.errors;
  const itemErrors = itemForm.formState.errors;

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
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Speisekarte</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie Kategorien, Gerichte und Wochenangebote</p>
        </div>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary">
            <TabsTrigger value="menu" className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy">
              <UtensilsCrossed className="w-4 h-4" />
              Speisekarte
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy">
              <Star className="w-4 h-4" />
              Wochenangebote
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-6">
            <div className="space-y-6">
              {/* Add buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openCategoryDialog()} className="btn-animate">
                    <Plus className="w-4 h-4 mr-2" />
                    Kategorie
                  </Button>
                  <Button className="bg-gold text-navy hover:bg-gold-light btn-animate" onClick={() => openItemDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Gericht
                  </Button>
                </div>
              </div>

              {/* Categories tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-1">
                    <Button
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`btn-animate ${selectedCategory === cat.id ? "bg-gold text-navy" : ""}`}
                    >
                      {cat.name}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openCategoryDialog(cat)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Menu items */}
              <div className="grid gap-3">
                {filteredItems.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {categories.length === 0 
                        ? 'Erstellen Sie zuerst eine Kategorie'
                        : 'Keine Gerichte in dieser Kategorie'}
                    </CardContent>
                  </Card>
                ) : (
                  filteredItems.map((item, index) => (
                    <Card key={item.id} className={`border-border/50 transition-all duration-short hover:border-gold/30 ${!item.is_available ? 'opacity-60' : ''}`}>
                      <CardContent className="py-4 flex items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveItem(item, 'up')}
                            disabled={!selectedCategory || index === 0 || reorderingId === item.id}
                            aria-label="Gericht nach oben verschieben"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveItem(item, 'down')}
                            disabled={!selectedCategory || index === filteredItems.length - 1 || reorderingId === item.id}
                            aria-label="Gericht nach unten verschieben"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">{item.name}</h3>
                            {item.is_vegetarian && (
                              <Badge variant="secondary" className="text-xs">Vegetarisch</Badge>
                            )}
                            {item.is_popular && (
                              <Badge className="bg-gold/20 text-gold-dark text-xs">Beliebt</Badge>
                            )}
                            {!item.is_available && (
                              <Badge variant="destructive" className="text-xs">Nicht verfügbar</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                          )}
                          {item.allergens?.length > 0 && (
                            <p className="text-xs text-muted-foreground">Allergene: {item.allergens.join(', ')}</p>
                          )}
                        </div>

                        <div className="text-lg font-semibold text-gold whitespace-nowrap">
                          {item.price.toFixed(2)} €
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={item.is_available}
                            onCheckedChange={() => toggleAvailability(item)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => openItemDialog(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="offers" className="mt-6">
            <AdminWeeklyOffers />
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={categoryName}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryName(value);
                  categoryForm.setValue('name', value, { shouldValidate: true });
                }}
                placeholder="z.B. Vorspeisen"
              />
              {categoryErrors.name && (
                <p className="text-xs text-destructive">{categoryErrors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Beschreibung (optional)</Label>
              <Textarea
                id="cat-desc"
                value={categoryDescription}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryDescription(value);
                  categoryForm.setValue('description', value, { shouldValidate: true });
                }}
                placeholder="Kurze Beschreibung..."
              />
              {categoryErrors.description && (
                <p className="text-xs text-destructive">{categoryErrors.description.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                className="bg-gold text-navy hover:bg-gold-light btn-animate"
                onClick={saveCategory}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Speichern'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Gericht bearbeiten' : 'Neues Gericht'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="item-cat">Kategorie</Label>
              <Select
                value={itemCategoryId}
                onValueChange={(value) => {
                  setItemCategoryId(value);
                  itemForm.setValue('categoryId', value, { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {itemErrors.categoryId && (
                <p className="text-xs text-destructive">{itemErrors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => {
                  const value = e.target.value;
                  setItemName(value);
                  itemForm.setValue('name', value, { shouldValidate: true });
                }}
                placeholder="z.B. Gyros Teller"
              />
              {itemErrors.name && (
                <p className="text-xs text-destructive">{itemErrors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-desc">Beschreibung (optional)</Label>
              <Textarea
                id="item-desc"
                value={itemDescription}
                onChange={(e) => {
                  const value = e.target.value;
                  setItemDescription(value);
                  itemForm.setValue('description', value, { shouldValidate: true });
                }}
                placeholder="Beschreibung des Gerichts..."
              />
              {itemErrors.description && (
                <p className="text-xs text-destructive">{itemErrors.description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Preis (€)</Label>
              <Input
                id="item-price"
                type="text"
                value={itemPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  setItemPrice(value);
                  itemForm.setValue('price', value, { shouldValidate: true });
                }}
                placeholder="z.B. 12,90"
              />
              {itemErrors.price && (
                <p className="text-xs text-destructive">{itemErrors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-allergens">Allergene (kommagetrennt)</Label>
              <Input
                id="item-allergens"
                value={itemAllergens}
                onChange={(e) => {
                  const value = e.target.value;
                  setItemAllergens(value);
                  itemForm.setValue('allergens', value, { shouldValidate: true });
                }}
                placeholder="z.B. A, G, L"
              />
              {itemErrors.allergens && (
                <p className="text-xs text-destructive">{itemErrors.allergens.message}</p>
              )}
              {invalidAllergens.length > 0 && (
                <p className="text-xs text-destructive">
                  Unbekannte Codes: {invalidAllergens.map(code => code.toUpperCase()).join(', ')}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Erlaubte Codes: {allergenCodeList}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="item-veg">Vegetarisch</Label>
              <Switch 
                id="item-veg"
                checked={itemVegetarian} 
                onCheckedChange={(checked) => {
                  setItemVegetarian(checked);
                  itemForm.setValue('isVegetarian', checked, { shouldValidate: true });
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="item-popular">Besonders beliebt</Label>
              <Switch 
                id="item-popular"
                checked={itemPopular} 
                onCheckedChange={(checked) => {
                  setItemPopular(checked);
                  itemForm.setValue('isPopular', checked, { shouldValidate: true });
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="item-avail">Verfügbar</Label>
              <Switch 
                id="item-avail"
                checked={itemAvailable} 
                onCheckedChange={(checked) => {
                  setItemAvailable(checked);
                  itemForm.setValue('isAvailable', checked, { shouldValidate: true });
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                className="bg-gold text-navy hover:bg-gold-light btn-animate"
                onClick={saveItem}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Speichern'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
