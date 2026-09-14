import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Kritik Hata: Supabase ortam değişkenleri (.env.local) eksik!');
}

// B2B SaaS Global Bulut İstemcisi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
