"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import { dbConfig } from "@/lib/db/config"

interface AuthUser {
  uid: string
  email: string | null
  name: string | null
  image: string | null
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Singleton Supabase client (only used for Supabase provider)
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClient
}

const useNextAuth = dbConfig.isNextAuth

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // NextAuth session (for MongoDB/MySQL)
  const { data: session, status } = useSession()

  useEffect(() => {
    setMounted(true)
    console.log(
      "[v0] Auth Provider mounted, using:",
      useNextAuth ? "NextAuth" : "Supabase",
      "| DB Provider:",
      dbConfig.provider,
    )
  }, [])

  // Handle NextAuth session
  useEffect(() => {
    if (!mounted || !useNextAuth) return

    console.log("[v0] NextAuth status:", status, "| Session:", session ? "exists" : "null")

    if (status === "loading") {
      setLoading(true)
      return
    }

    if (session?.user) {
      setUser({
        uid: (session.user as any).id || session.user.email || "",
        email: session.user.email || null,
        name: session.user.name || null,
        image: session.user.image || null,
        role: (session.user as any).role || "donor",
      })
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [session, status, mounted])

  // Handle Supabase session (for Supabase/Firebase)
  useEffect(() => {
    if (!mounted || useNextAuth) return

    const supabase = getSupabaseClient()
    let cancelled = false

    const setupAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          if (!cancelled) {
            setError(sessionError.message)
            setLoading(false)
          }
          return
        }

        if (session?.user && !cancelled) {
          await fetchUserProfile(session.user)
        } else if (!cancelled) {
          setUser(null)
          setLoading(false)
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (cancelled) return

          if (session?.user) {
            await fetchUserProfile(session.user)
          } else {
            setUser(null)
          }
          setLoading(false)
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (err: any) {
        console.error("Error setting up auth:", err)
        if (!cancelled) {
          setError(err.message || "Failed to initialize authentication")
          setLoading(false)
        }
      }
    }

    const fetchUserProfile = async (supabaseUser: User) => {
      try {
        const supabase = getSupabaseClient()
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", supabaseUser.id).single()

        setUser({
          uid: supabaseUser.id,
          email: supabaseUser.email || null,
          name: profile?.name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
          image: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
          role: profile?.role || "donor",
        })
        setError(null)
      } catch (err) {
        setUser({
          uid: supabaseUser.id,
          email: supabaseUser.email || null,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
          image: supabaseUser.user_metadata?.avatar_url || null,
          role: "donor",
        })
      }
      setLoading(false)
    }

    setupAuth()

    return () => {
      cancelled = true
    }
  }, [mounted])

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    console.log("[v0] Sign in with email, using:", useNextAuth ? "NextAuth" : "Supabase")
    if (useNextAuth) {
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        throw new Error(result.error)
      }
    } else {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    }
  }, [])

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string, name: string, role = "donor") => {
    console.log("[v0] Sign up, using:", useNextAuth ? "NextAuth" : "Supabase")
    if (useNextAuth) {
      // Register user via API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Registration failed")
      }

      // Auto sign in after registration
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }
    } else {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            full_name: name,
            name: name,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          email,
          role,
        })
      }
    }
  }, [])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    console.log("[v0] Google Sign In, using:", useNextAuth ? "NextAuth" : "Supabase", "| Provider:", dbConfig.provider)

    if (useNextAuth) {
      console.log("[v0] Calling nextAuthSignIn('google')")
      await nextAuthSignIn("google", {
        callbackUrl: "/dashboard",
      })
    } else {
      console.log("[v0] Calling Supabase OAuth")
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    if (useNextAuth) {
      await nextAuthSignOut({ callbackUrl: "/" })
    } else {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
