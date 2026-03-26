"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

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
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: string) => Promise<void>
  signOut: () => void
  logout?: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch("http://localhost:5005/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      
      if (data.success) {
        setUser({
          id: data.data._id,
          email: data.data.email,
          name: data.data.name,
          role: data.data.role,
        })
      } else {
        localStorage.removeItem("token")
        setUser(null)
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err)
      setUser(null)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUserProfile(token)
    } else {
      setLoading(false)
    }
  }, [fetchUserProfile])

  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      const res = await fetch("http://localhost:5005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem("token", data.data.token)
        await fetchUserProfile(data.data.token)
        router.push("/dashboard")
      } else {
        throw new Error(data.message || "Invalid credentials")
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signUp = async (email: string, password: string, name: string, role = "user") => {
    setError(null)
    try {
      const res = await fetch("http://localhost:5005/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem("token", data.data.token)
        await fetchUserProfile(data.data.token)
        router.push("/dashboard")
      } else {
        throw new Error(data.message || "Registration failed")
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signOut = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/")
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
