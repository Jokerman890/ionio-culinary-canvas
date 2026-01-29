import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useServerAuth } from '@/hooks/useServerAuth';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Shield, User, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'staff';
  created_at: string;
  email?: string;
}

export default function AdminUsers() {
  const { user } = useAuthContext();
  const { isAdmin: serverVerifiedAdmin, isLoading: verifying, isVerified } = useServerAuth();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add user dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff'>('staff');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isVerified && serverVerifiedAdmin) {
      fetchUsers();
    }
  }, [isVerified, serverVerifiedAdmin]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Fehler beim Laden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const createUser = async () => {
    if (!newEmail || !newPassword) {
      toast({ title: 'E-Mail und Passwort erforderlich', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: 'Passwort muss mindestens 6 Zeichen haben', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Benutzer konnte nicht erstellt werden');

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: newRole,
        });

      if (roleError) throw roleError;

      toast({ title: 'Benutzer erstellt' });
      setDialogOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('staff');
      fetchUsers();
    } catch (error: any) {
      const message = error.message === 'User already registered' 
        ? 'Diese E-Mail ist bereits registriert'
        : error.message;
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userRole: UserRole) => {
    if (userRole.user_id === user?.id) {
      toast({ title: 'Sie können sich selbst nicht löschen', variant: 'destructive' });
      return;
    }

    if (!confirm('Benutzer-Berechtigung entfernen?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', userRole.id);

      if (error) throw error;
      toast({ title: 'Berechtigung entfernt' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    }
  };

  // Show loading while verifying server-side
  if (verifying || !isVerified) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="text-muted-foreground">Berechtigungen werden überprüft...</p>
        </div>
      </AdminLayout>
    );
  }

  // Server-side verification failed - not an admin
  if (!serverVerifiedAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <ShieldAlert className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Zugriff verweigert</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Sie haben keine Administrator-Berechtigung für diese Seite. 
            Nur Administratoren können Benutzer verwalten.
          </p>
        </div>
      </AdminLayout>
    );
  }

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
            <h1 className="font-serif text-3xl text-foreground">Mitarbeiter</h1>
            <p className="text-muted-foreground mt-1">Verwalten Sie Zugriffsberechtigungen</p>
          </div>
          <Button 
            className="bg-gold text-navy hover:bg-gold-light"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Mitarbeiter hinzufügen
          </Button>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Berechtigte Benutzer</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Noch keine Mitarbeiter hinzugefügt.
              </p>
            ) : (
              <div className="space-y-3">
                {users.map(userRole => (
                  <div 
                    key={userRole.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {userRole.role === 'admin' ? (
                        <Shield className="w-5 h-5 text-gold" />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">
                          {userRole.user_id === user?.id ? 'Sie' : `Benutzer ${userRole.user_id.slice(0, 8)}...`}
                        </p>
                        <Badge 
                          variant={userRole.role === 'admin' ? 'default' : 'secondary'}
                          className={userRole.role === 'admin' ? 'bg-gold text-navy' : ''}
                        >
                          {userRole.role === 'admin' ? 'Administrator' : 'Mitarbeiter'}
                        </Badge>
                      </div>
                    </div>
                    {userRole.user_id !== user?.id && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteUser(userRole)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-muted/20">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Rollen-Erklärung</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>Administrator:</strong> Vollzugriff inkl. Benutzerverwaltung</li>
              <li><strong>Mitarbeiter:</strong> Kann Speisekarte, Galerie und Einstellungen bearbeiten</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Mitarbeiter hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-email">E-Mail</Label>
              <Input
                id="user-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="mitarbeiter@ionio-ganderkesee.de"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Passwort</Label>
              <Input
                id="user-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Rolle</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as 'admin' | 'staff')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  <SelectItem value="staff">Mitarbeiter</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                className="bg-gold text-navy hover:bg-gold-light"
                onClick={createUser}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Erstellen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
