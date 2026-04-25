import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? ''

/** ref из https://<ref>.supabase.co */
export function extractSupabaseProjectRef(url: string): string | null {
  try {
    const host = new URL(url).hostname
    if (!host.endsWith('.supabase.co')) return null
    return host.slice(0, -'.supabase.co'.length)
  } catch {
    return null
  }
}

/**
 * Удаляет из localStorage сессии Supabase от *других* проектов.
 * Иначе после смены VITE_SUPABASE_URL остаётся refresh_token и клиент шлёт запросы
 * на старый хост → ERR_NAME_NOT_RESOLVED, лавина refresh и Navigator Lock timeout.
 */
export function clearStaleSupabaseAuthStorage(currentProjectUrl: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  const ref = extractSupabaseProjectRef(currentProjectUrl)
  if (!ref) return

  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith('sb-')) continue
    const rest = key.slice(3)
    const firstSegment = rest.split('-')[0]
    if (!firstSegment || firstSegment === ref) continue
    if (key.includes('auth')) toRemove.push(key)
  }
  for (const k of toRemove) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  }
  if (toRemove.length && import.meta.env.DEV) {
    console.info(
      '[SuperWizard] Удалены устаревшие ключи Supabase Auth (другой project ref):',
      toRemove.length
    )
  }
}

/** Готово ли подключение к Supabase (без этого запросы к Auth дадут «Failed to fetch»). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl.startsWith('https://') && supabaseAnonKey.length >= 20
  )
}

if (isSupabaseConfigured()) {
  clearStaleSupabaseAuthStorage(supabaseUrl)
}

if (!isSupabaseConfigured()) {
  console.warn(
    '[SuperWizard] Задайте VITE_SUPABASE_URL (https://<ref>.supabase.co) и VITE_SUPABASE_ANON_KEY в .env и перезапустите dev-сервер.'
  )
}

type GlobalWithSupabase = typeof globalThis & {
  __SUPERWIZARD_SUPABASE__?: SupabaseClient
}

const g = globalThis as GlobalWithSupabase

export const supabase: SupabaseClient =
  g.__SUPERWIZARD_SUPABASE__ ??
  (g.__SUPERWIZARD_SUPABASE__ = createClient(
    isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.invalid',
    isSupabaseConfigured() ? supabaseAnonKey : 'placeholder',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
    }
  ))
