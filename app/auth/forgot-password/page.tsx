"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005"
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        toast({
          title: "Success",
          description: data.message || "If an account with that email exists, a password reset link has been sent.",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 pt-24">
      <Card className="w-full max-w-md transition-all duration-300 hover:shadow-lg rounded-3xl border border-white dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex flex-col items-center justify-center gap-4">
            <Image
              src="/logo.png"
              alt="VitaMend Logo"
              width={120}
              height={120}
              className="drop-shadow-md"
            />
            <span className="font-bold text-slate-800 dark:text-white text-3xl">Forgot Password</span>
          </CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400 mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-8">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-sm font-medium">
                If an account with that email exists, a password reset link has been sent. Please check your inbox.
              </div>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl py-6">
                <Link href="/auth/signin">Return to Sign In</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600 dark:text-gray-300 font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="transition-all py-6 duration-200 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 rounded-2xl py-7 text-lg font-bold shadow-lg shadow-blue-500/30"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-8">
            Remember your password?{" "}
            <Link href="/auth/signin" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
