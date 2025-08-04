import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - Base de datos centralizada CoffeeCraft
const supabaseUrl = 'https://aydbyfxeudluyscfjxqp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8';

// Verificar que las credenciales estén configuradas
if (!supabaseAnonKey) {
  console.error('❌ Error: Credenciales de Supabase no configuradas');
}

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Configuración del cliente para compartir con otros módulos
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};

// Tipos de respuesta de Supabase
export type SupabaseResponse<T> = {
  data: T | null;
  error: any;
}; 