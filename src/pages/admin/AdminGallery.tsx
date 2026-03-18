import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Loader2, Upload, Eye, EyeOff, RefreshCw, Plus } from 'lucide-react';
import { getUserFriendlyError } from '@/lib/errorMessages';

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  
  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast({ title: 'Fehler beim Laden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const uploadToStorage = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) throw new Error(`${file.name} ist kein Bild`);
    if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} ist zu groß (max. 5MB)`);

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const publicUrl = await uploadToStorage(file);

        const { error: dbError } = await supabase
          .from('gallery_images')
          .insert({
            image_url: publicUrl,
            title: file.name.replace(/\.[^.]+$/, ''),
            sort_order: images.length,
            is_visible: true,
          });
        if (dbError) throw dbError;
      }
      toast({ title: 'Bilder hochgeladen' });
      fetchImages();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminGallery.handleFileUpload');
      toast({ title: 'Upload fehlgeschlagen', description: message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !replacingId) return;

    const file = files[0];
    setSaving(true);
    try {
      const publicUrl = await uploadToStorage(file);

      // Delete old file from storage
      const image = images.find(i => i.id === replacingId);
      if (image) {
        const urlParts = image.image_url.split('/');
        const oldFileName = urlParts[urlParts.length - 1];
        await supabase.storage.from('gallery').remove([oldFileName]);
      }

      const { error } = await supabase
        .from('gallery_images')
        .update({ image_url: publicUrl })
        .eq('id', replacingId);

      if (error) throw error;
      toast({ title: 'Bild ersetzt' });
      fetchImages();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminGallery.handleReplaceImage');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
      setReplacingId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const openEditDialog = (image: GalleryImage) => {
    setEditingImage(image);
    setEditTitle(image.title || '');
    setEditDescription(image.description || '');
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editingImage) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ title: editTitle || null, description: editDescription || null })
        .eq('id', editingImage.id);

      if (error) throw error;
      toast({ title: 'Bild aktualisiert' });
      setEditDialogOpen(false);
      fetchImages();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminGallery.saveEdit');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (image: GalleryImage) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_visible: !image.is_visible })
        .eq('id', image.id);

      if (error) throw error;
      fetchImages();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminGallery.toggleVisibility');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    }
  };

  const deleteImage = async (image: GalleryImage) => {
    if (!confirm('Bild endgültig löschen?')) return;
    try {
      const urlParts = image.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('gallery').remove([fileName]);

      const { error } = await supabase.from('gallery_images').delete().eq('id', image.id);
      if (error) throw error;
      toast({ title: 'Bild gelöscht' });
      fetchImages();
    } catch (error: unknown) {
      const message = getUserFriendlyError(error, 'AdminGallery.deleteImage');
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    }
  };

  const startReplace = (imageId: string) => {
    setReplacingId(imageId);
    setTimeout(() => replaceInputRef.current?.click(), 50);
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Galerie</h1>
            <p className="text-muted-foreground mt-1">
              Verwalten Sie die Bilder, die auf der Website angezeigt werden.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchImages}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              onChange={handleReplaceImage}
              className="hidden"
            />
            <Button 
              className="bg-gold text-navy hover:bg-gold-light"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Bild hinzufügen
            </Button>
          </div>
        </div>

        {images.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Noch keine Bilder vorhanden. Laden Sie Ihre ersten Fotos hoch.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Solange keine Bilder hochgeladen sind, werden die Standard-Bilder auf der Website angezeigt.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(image => (
              <Card 
                key={image.id} 
                className={`overflow-hidden border-border/50 ${!image.is_visible ? 'opacity-60' : ''}`}
              >
                <div className="aspect-square relative group">
                  <img 
                    src={image.image_url} 
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary"
                        onClick={() => toggleVisibility(image)}
                        title={image.is_visible ? 'Ausblenden' : 'Anzeigen'}
                      >
                        {image.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary"
                        onClick={() => openEditDialog(image)}
                        title="Bearbeiten"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive"
                        onClick={() => deleteImage(image)}
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startReplace(image.id)}
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Bild ersetzen
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm truncate">{image.title || 'Ohne Titel'}</p>
                  {!image.is_visible && (
                    <p className="text-xs text-muted-foreground">Ausgeblendet</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          Die sichtbaren Bilder werden in der Galerie auf der Website angezeigt. Solange keine Bilder hochgeladen sind, werden Standard-Bilder verwendet.
        </p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bild bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingImage && (
              <img 
                src={editingImage.image_url} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="space-y-2">
              <Label htmlFor="img-title">Titel</Label>
              <Input
                id="img-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Bildtitel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="img-desc">Beschreibung</Label>
              <Input
                id="img-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Kurze Beschreibung"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                className="bg-gold text-navy hover:bg-gold-light"
                onClick={saveEdit}
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
