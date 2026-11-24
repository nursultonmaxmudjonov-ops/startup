import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    try {
      const localUrl = localStorage.getItem('vantege_supabase_url');
      const localKey = localStorage.getItem('vantege_supabase_anon_key');
      if (localUrl && localKey) {
        url = localUrl;
        anonKey = localKey;
      }
    } catch {}
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function isSupabaseValid(config: SupabaseConfig): boolean {
  return Boolean(
    config.url &&
      config.anonKey &&
      !config.url.includes('your-project') &&
      config.url.startsWith('https://')
  );
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!isSupabaseValid(config)) {
    return null;
  }

  const currentKey = `${config.url}_${config.anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Supabase createClient xatosi:', err);
    return null;
  }
}

export function setCustomSupabaseConfig(url: string, anonKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem('vantege_supabase_url', url.trim());
    localStorage.setItem('vantege_supabase_anon_key', anonKey.trim());
    cachedClient = null;
    cachedConfigKey = '';
    return true;
  } catch {
    return false;
  }
}

export function clearCustomSupabaseConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('vantege_supabase_url');
    localStorage.removeItem('vantege_supabase_anon_key');
    cachedClient = null;
    cachedConfigKey = '';
  } catch {}
}

export const isSupabaseConfigured = isSupabaseValid(getSupabaseConfig());
export const supabase = getSupabaseClient();
