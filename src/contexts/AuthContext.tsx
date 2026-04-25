import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

function mapAuthErrorMessage(raw: string | null | undefined): string | null {
  if (!raw) return null
  const m = raw.trim()
  if (m === 'Failed to fetch' || /failed to fetch/i.test(m) || /networkerror/i.test(m)) {
    return [
      'Не удалось связаться с Supabase.',
      'Если в консоли ERR_NAME_NOT_RESOLVED для *.supabase.co — в .env указан неверный URL проекта (сверьте с Dashboard → Settings → API) или старый проект удалён. После смены URL перезапустите dev-сервер и обновите страницу (мы очищаем сессии от других project ref).',
      'В Authentication → URL добавьте http://localhost:5173 и http://127.0.0.1:5173.',
      'Ключ: только anon / publishable из API (не service role / secret — их нельзя вставлять во фронтенд).',
    ].join(' ')
  }
  return m
}

async function clearLocalAuthIfBrokenSession() {
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    /* ignore */
  }
}

/** false — экран входа/регистрации через Supabase Auth */
const BYPASS_AUTH = false

const GUEST_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'guest@local.dev',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false,
} as User

interface AuthContextType {
  user: User | null
  loading: boolean
  /** Ошибка конфигурации или сети при старте (показать на экране входа). */
  authInitError: string | null
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>
  updateEmail: (newEmail: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(BYPASS_AUTH ? GUEST_USER : null)
  const [loading, setLoading] = useState(!BYPASS_AUTH)
  const [authInitError, setAuthInitError] = useState<string | null>(null)

  useEffect(() => {
    if (BYPASS_AUTH) return

    if (!isSupabaseConfigured()) {
      setAuthInitError(
        'Не заданы VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY. Скопируйте .env.example в .env, вставьте URL проекта (https://…supabase.co) и anon/publishable-ключ из Dashboard → Settings → API, затем перезапустите dev-сервер.'
      )
      setLoading(false)
      return
    }

    let cancelled = false

    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error }) => {
        if (cancelled) return
        if (error) {
          await clearLocalAuthIfBrokenSession()
          setAuthInitError(mapAuthErrorMessage(error.message))
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
        setLoading(false)
      })
      .catch(async (err: unknown) => {
        if (cancelled) return
        await clearLocalAuthIfBrokenSession()
        const msg = err instanceof Error ? err.message : String(err)
        setAuthInitError(mapAuthErrorMessage(msg))
        setUser(null)
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: mapAuthErrorMessage(error?.message ?? null) }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: mapAuthErrorMessage(error?.message ?? null) }
  }

  const signOutFn = async () => {
    if (BYPASS_AUTH) {
      setUser(GUEST_USER)
      return
    }
    await supabase.auth.signOut()
  }

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    return { error: mapAuthErrorMessage(error?.message ?? null) }
  }

  const updateEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    return { error: mapAuthErrorMessage(error?.message ?? null) }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: mapAuthErrorMessage(error?.message ?? null) }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authInitError,
        signUp,
        signIn,
        signOut: signOutFn,
        verifyOtp,
        updateEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
