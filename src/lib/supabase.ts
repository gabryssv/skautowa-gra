import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sprawdź czy zmienne są zdefiniowane
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brakuje zmiennych środowiskowych VITE_SUPABASE_URL i/lub VITE_SUPABASE_ANON_KEY. Dodaj je w Vercel Settings → Environment Variables.');
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
