// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase - Base de datos centralizada CoffeeCraft
const supabaseUrl = 'https://aydbyfxeudluyscfjxqp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8'

export const supabase = createClient(supabaseUrl, supabaseKey)
