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
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } else {
        setRole(data?.role as UserRole ?? null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.functions.invoke('login-rate-limited', {
      body: { email, password },
    });

    if (error) {
      return {
        error: await readFunctionError(error, 'Anmeldung fehlgeschlagen'),
      };
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
