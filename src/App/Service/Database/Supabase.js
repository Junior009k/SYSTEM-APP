// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Saca estas variables de tu configuración de Supabase
// (Es mejor usar variables de entorno .env)
const supabaseUrl = 'https://uwafsywazersqpmalmqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YWZzeXdhemVyc3FwbWFsbXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDg4MzMsImV4cCI6MjA3NzQ4NDgzM30.1FzR9yUoLyPrfO9ixX4uIYJhMZM7YbV-45uIz-CF2dw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);