"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, CheckCircle, XCircle, Loader2, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"
// Removed direct DB imports to fix Vercel build error
const DB_PROVIDER = "mongodb";
interface InitResult {
  success: boolean;
  alreadyInitialized?: boolean;
  message: string;
}

export default function InitDatabasePage() {
  const { user, loading: authLoading } = useAuth()
  const [initStatus, setInitStatus] = useState<InitResult | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  // Redirect non-authenticated users
  if (!authLoading && !user) {
    redirect("/auth/signin")
  }

  // Check if user is admin (you can customize this based on your auth setup)
  const isAdmin = user?.role === "admin" || user?.email?.endsWith("@vitamend.org")

  if (!authLoading && !isAdmin) {
    redirect("/dashboard")
  }

  const handleInitialize = async () => {
    setIsInitializing(true)
    setInitStatus(null)

    try {
      const res = await fetch("/api/admin/init-db", { method: "POST" })
      const result = await res.json()
      setInitStatus(result)
    } catch (error: any) {
      setInitStatus({
        success: false,
        message: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Admin Dashboard
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Database Initialization</CardTitle>
              <CardDescription>Initialize the database schema for VitaMend</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Provider Info */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Active Database Provider</p>
              <p className="text-xs text-muted-foreground">Set via NEXT_PUBLIC_DB_PROVIDER environment variable</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {DB_PROVIDER.toUpperCase()}
            </Badge>
          </div>

          {/* Provider-specific instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">What this will do:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create collections with proper indexes</li>
              <li>Set up validation schemas</li>
            </ul>
          </div>

          {/* Status Alert */}
          {initStatus && (
            <Alert variant={initStatus.success ? "default" : "destructive"}>
              {initStatus.success ? (
                initStatus.alreadyInitialized ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {initStatus.success ? (initStatus.alreadyInitialized ? "Already Initialized" : "Success") : "Error"}
              </AlertTitle>
              <AlertDescription>{initStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Initialize Button */}
          <Button onClick={handleInitialize} disabled={isInitializing} className="w-full" size="lg">
            {isInitializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Initializing Database...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Initialize Database
              </>
            )}
          </Button>

          {/* Safety Note */}
          <p className="text-xs text-muted-foreground text-center">
            This operation is idempotent and safe to run multiple times. It will not delete existing data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
