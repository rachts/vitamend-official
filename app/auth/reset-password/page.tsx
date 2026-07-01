"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"
import PasswordStrength from "@/components/auth/PasswordStrength"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Invalid or missing token",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        toast({
          title: "Success",
          description: "Your password has been successfully reset.",
        })
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
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

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-sm font-medium">
          Your password has been successfully reset! Redirecting to login...
        </div>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl py-6">
          <Link href="/auth/signin">Sign In Now</Link>
        </Button>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
          Invalid or missing password reset token. Please request a new link.
        </div>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl py-6">
          <Link href="/auth/forgot-password">Forgot Password</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-600 dark:text-gray-300 font-semibold">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="transition-all py-6 duration-200 focus:ring-2 focus:ring-blue-500/20 rounded-xl pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-600 dark:text-gray-300 font-semibold">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="transition-all py-6 duration-200 focus:ring-2 focus:ring-blue-500/20 rounded-xl pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 rounded-2xl py-7 text-lg font-bold shadow-lg shadow-blue-500/30"
        disabled={isLoading || password !== confirmPassword || password.length < 8}
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  )
}

export default function ResetPassword() {
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
            <span className="font-bold text-slate-800 dark:text-white text-3xl">Reset Password</span>
          </CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400 mt-2">
            Enter your new password below to reset your account access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-8">
          <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

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
