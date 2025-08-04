// Environment de producción

export const environment = {
  production: true,
  supabase: {
    // En producción, estas deberían venir de variables de entorno del servidor
    url: (globalThis as any)?.process?.env?.['SUPABASE_URL'] || 'https://aydbyfxeudluyscfjxqp.supabase.co',
    anonKey: (globalThis as any)?.process?.env?.['SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8',
  },
  mateoBlue: {
    apiKey: 'nK8agXvD6P1ioVAKQidskAqgSuYdzOXX',
    baseUrl: 'https://api.tomorrow.io/v4/weather/realtime'
  },
  // En producción, usar datos reales de Supabase
  useMockData: false
};