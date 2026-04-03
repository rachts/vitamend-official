import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // CORS for API routes
  const isApi = req.nextUrl.pathname.startsWith("/api")
  const origin = req.headers.get("origin") || ""
  
  // Parse allowed origins from env or use defaults
  const envOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()) 
    : []
  
  const defaultOrigins = ["https://vitamend.in", "http://localhost:3000"]
  const allOrigins = envOrigins.concat(defaultOrigins)
  const allowedOrigins = allOrigins.filter((val, index) => allOrigins.indexOf(val) === index)
  
  // Allow Vercel preview deployments and exact matches
  const isVercelOrigin = origin.endsWith(".vercel.app") || origin.endsWith(".vercel.com")
  const isAllowed = allowedOrigins.includes(origin) || isVercelOrigin
  
  const allowOrigin = isAllowed ? origin : allowedOrigins[0]

  if (isApi) {
    response.headers.set("Access-Control-Allow-Origin", allowOrigin)
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Vary", "Origin")
  }

  // Preflight for API
  if (isApi && req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers })
  }

  // Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // HSTS for production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|public).*)"],
}
