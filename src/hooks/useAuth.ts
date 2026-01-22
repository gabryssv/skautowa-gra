import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLeaderOf: string | null; // patrol_id jeśli user jest zastępowym
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isLeader: (patrolId: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isLeaderOf: null,
  });

  // Sprawdź której drużyny jest zastępowym
  const checkLeaderStatus = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('patrols')
      .select('id')
      .eq('leader_id', userId)
      .single() as any;
    
    return data?.id || null;
  }, []);

  useEffect(() => {
    // Pobierz aktualną sesję przy starcie
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      let isLeaderOf = null;
      if (session?.user) {
        isLeaderOf = await checkLeaderStatus(session.user.id);
      }

      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isLeaderOf,
      });
    };

    getInitialSession();

    // Nasłuchuj zmian autoryzacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        let isLeaderOf = null;
        if (session?.user) {
          isLeaderOf = await checkLeaderStatus(session.user.id);
        }

        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          isLeaderOf,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkLeaderStatus]);

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      // Ustaw persistence przed logowaniem
      // rememberMe = true → sesja zostaje po zamknięciu przeglądarki
      // rememberMe = false → sesja wygasa po zamknięciu
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Jeśli rememberMe jest false, sesja i tak będzie w localStorage,
      // ale możemy wyczyścić ją przy zamknięciu przeglądarki
      if (!rememberMe) {
        // Zapisz flagę że sesja ma być tymczasowa
        sessionStorage.setItem('temp_session', 'true');
      } else {
        sessionStorage.removeItem('temp_session');
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('temp_session');
  };

  const isLeader = (patrolId: string): boolean => {
    return state.isLeaderOf === patrolId;
  };

  // Wyloguj przy zamknięciu przeglądarki jeśli nie zaznaczono "zapamiętaj mnie"
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionStorage.getItem('temp_session') === 'true') {
        supabase.auth.signOut();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    ...state,
    signIn,
    signOut,
    isLeader,
  };
}
