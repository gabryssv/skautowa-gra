import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = 'https://lxbyypqblldhphjhzewr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4Ynl5cHFibGxkaHBoamh6ZXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTE1ODgsImV4cCI6MjA4NDY2NzU4OH0.gmhQzivG1QiEYIl5Z25k8S_NhmNp-IyC-dC0WAJRp6g';

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
