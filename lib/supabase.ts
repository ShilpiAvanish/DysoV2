
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqdpyulsjupdxtmysyvg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZHB5dWxzanVwZHh0bXlzeXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTY0ODksImV4cCI6MjA2OTEzMjQ4OX0.PctpWMbce2ir2-swOvVFkFp-92lL1mfiyryeWWS785w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
