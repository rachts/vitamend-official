"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  displayName?: string
  metadata?: any
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string, role?: string) => Promise<any>
  signOut: () => void
  logout?: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loading = status === "loading"

  // Sync internal user state with NextAuth session
  const user = useMemo(() => {
    if (session?.user) {
      return {
        id: (session.user as any).id || "",
        email: session.user.email || "",
        name: session.user.name || "",
        role: (session.user as any).role || "user",
      } as AuthUser
    }
    return null
  }, [session])

  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      const result = await nextAuthSignIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError(result.error)
        throw new Error(result.error)
      }
      
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signUp = async (email: string, password: string, name: string, role = "user") => {
    setError(null)
    try {
      // First register via the custom API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })
      const data = await res.json()

      if (data.success) {
        // Then automatically sign in via NextAuth
        return await signIn(email, password)
      } else {
        throw new Error(data.message || "Registration failed")
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signOut = () => {
    nextAuthSignOut({ callbackUrl: "/" })
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>
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
