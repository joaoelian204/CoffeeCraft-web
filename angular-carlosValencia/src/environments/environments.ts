// Environment de desarrollo
// Las variables se tomarán del archivo .env durante el build

export const environment = {
  production: false,
  supabase: {
    // En desarrollo, puedes reemplazar estas líneas con tus credenciales directamente
    // o usar el archivo .env (requiere configuración adicional de build)
    url: (globalThis as any)?.process?.env?.['SUPABASE_URL'] || 'https://aydbyfxeudluyscfjxqp.supabase.co',
    anonKey: (globalThis as any)?.process?.env?.['SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8',
  },
  mateoBlue: {
    apiKey: 'nK8agXvD6P1ioVAKQidskAqgSuYdzOXX',
    baseUrl: 'https://api.tomorrow.io/v4/weather/realtime'
  },
  // Configuración para desarrollo sin Supabase (usar datos mock)
  useMockData: false // Cambia a false cuando configures Supabase
}; 