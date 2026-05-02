import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'staff' | null;

const readFunctionError = async (error: unknown, fallbackMessage: string) => {
  const context = error && typeof error === 'object' && 'context' in error
    ? (error as { context?: unknown }).context
    : null;

  if (context instanceof Response) {
    try {
      const body = await context.clone().json();
      if (body?.error && typeof body.error === 'string') {
        return new Error(body.error);
      }
    } catch {
      // Ignore malformed function error bodies and use the fallback below.
    }
  }

  return new Error(fallbackMessage);
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer role fetch with setTimeout to avoid deadlocks
        if (session?.user) {
          setLoading(true);
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Use the has_role() SECURITY DEFINER function instead of querying
      // user_roles directly. The RLS policy on user_roles only allows admins
      // to SELECT, which blocks staff users from reading their own role.
      // has_role() bypasses RLS because it runs as the function owner.
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' });

      if (adminError) {
        console.error('Error checking admin role:', adminError);
        setRole(null);
        return;
      }

      if (isAdmin) {
        setRole('admin');
        return;
      }

      const { data: isStaff, error: staffError } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'staff' });

      if (staffError) {
        console.error('Error checking staff role:', staffError);
        setRole(null);
        return;
      }

      setRole(isStaff ? 'staff' : null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const fallbackMessage = 'Anmeldung fehlgeschlagen';
    const { data, error } = await supabase.functions.invoke('login-rate-limited', {
      body: { email, password },
    });

    if (error) {
      const functionError = await readFunctionError(error, fallbackMessage);
      if (functionError.message !== fallbackMessage) {
        return { error: functionError };
      }

      const { error: passwordError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: passwordError };
    }

    if (data?.error) {
      return { error: new Error(data.error) };
    }

    const session = data?.data?.session;
    if (!session?.access_token || !session?.refresh_token) {
      return { error: new Error('Anmeldung fehlgeschlagen') };
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    return { error: sessionError };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    role,
    loading,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };
}
