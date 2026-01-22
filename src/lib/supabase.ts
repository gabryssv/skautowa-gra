import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistent session - "nie wylogowuj mnie"
    persistSession: true,
    // Automatyczne odświeżanie tokenów
    autoRefreshToken: true,
    // Przechowuj sesję w localStorage
    storage: localStorage,
    // Wykrywaj zmiany sesji w innych kartach
    detectSessionInUrl: true,
  },
});
