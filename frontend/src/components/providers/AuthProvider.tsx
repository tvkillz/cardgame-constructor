'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { Session, User } from '@supabase/supabase-js'
import { appConfig } from '@/config'
import { resolvePlayerName } from '@/lib/auth/player'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'
import AuthModal from '@/components/auth/AuthModal'

export type AuthModalMode = 'signIn' | 'register'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  isPlayProtected: boolean
  modalOpen: boolean
  modalMode: AuthModalMode
  openAuthModal: (mode?: AuthModalMode, redirectPath?: string) => void
  closeAuthModal: () => void
  signOut: () => Promise<void>
  /** Navigate when signed in; otherwise open sign-in and redirect after login. */
  requestAuthNavigation: (path: string) => boolean
  /** @deprecated Use requestAuthNavigation(play path). */
  ensurePlayAccess: () => boolean
  playerName: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<AuthModalMode>('signIn')
  const pendingPathRef = useRef<string | null>(null)

  const isPlayProtected =
    appConfig.auth.requireSignInForPlay && isSupabaseConfigured()

  const user = session?.user ?? null
  const playerName = resolvePlayerName(user)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
      if (nextSession) {
        setModalOpen(false)
        const target = pendingPathRef.current
        if (target) {
          pendingPathRef.current = null
          router.push(target)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const openAuthModal = useCallback((mode: AuthModalMode = 'signIn', redirectPath?: string) => {
    if (redirectPath) {
      pendingPathRef.current = redirectPath
    }
    setModalMode(mode)
    setModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    pendingPathRef.current = null
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  const requestAuthNavigation = useCallback(
    (path: string): boolean => {
      if (!isSupabaseConfigured()) {
        router.push(path)
        return true
      }
      if (loading) return false
      if (session) {
        router.push(path)
        return true
      }
      pendingPathRef.current = path
      openAuthModal('signIn')
      return false
    },
    [loading, session, openAuthModal, router],
  )

  const ensurePlayAccess = useCallback(() => {
    if (!isPlayProtected) return true
    return requestAuthNavigation(appConfig.domain.routes.play)
  }, [isPlayProtected, requestAuthNavigation])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      isPlayProtected,
      modalOpen,
      modalMode,
      openAuthModal,
      closeAuthModal,
      signOut,
      requestAuthNavigation,
      ensurePlayAccess,
      playerName,
    }),
    [
      session,
      user,
      loading,
      isPlayProtected,
      modalOpen,
      modalMode,
      openAuthModal,
      closeAuthModal,
      signOut,
      requestAuthNavigation,
      ensurePlayAccess,
      playerName,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
