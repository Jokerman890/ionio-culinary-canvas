import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ServerAuthState {
  isAdmin: boolean;
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useServerAuth() {
  const [state, setState] = useState<ServerAuthState>({
    isAdmin: false,
    isVerified: false,
    isLoading: true,
    error: null,
  });

  const verifyAdmin = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setState({
          isAdmin: false,
          isVerified: true,
          isLoading: false,
          error: null,
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('verify-admin');

      if (error) {
        console.error('Server auth verification failed:', error);
        setState({
          isAdmin: false,
          isVerified: true,
          isLoading: false,
          error: error.message,
        });
        return false;
      }

      const isAdmin = data?.isAdmin === true;
      
      setState({
        isAdmin,
        isVerified: true,
        isLoading: false,
        error: null,
      });

      return isAdmin;
    } catch (err) {
      console.error('Unexpected error during server auth:', err);
      setState({
        isAdmin: false,
        isVerified: true,
        isLoading: false,
        error: 'Verification failed',
      });
      return false;
    }
  }, []);

  useEffect(() => {
    verifyAdmin();
  }, [verifyAdmin]);

  return {
    ...state,
    refetch: verifyAdmin,
  };
}
