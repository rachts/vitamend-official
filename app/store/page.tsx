"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Package, Search, Filter, CheckCircle, Clock, AlertCircle, Loader2, Database } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Footer from "@/components/footer"
// Removed direct getDb import to fix Vercel build error
import type { Medicine } from "@/lib/db/types"

export default function StorePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [dbSetupNeeded, setDbSetupNeeded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending">("all")

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await fetch("/api/medicines")
        const result = await res.json()
        if (result.success) {
          setMedicines(result.data)
          setDbSetupNeeded(false)
        } else {
          throw new Error(result.message)
        }
      } catch (error: any) {
        const errorMsg = error?.message || ""
        if (errorMsg.includes("schema cache") || errorMsg.includes("relation") || errorMsg.includes("does not exist")) {
          setDbSetupNeeded(true)
        }
        console.error("Error fetching medicines:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [])

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.brand.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && medicine.verified) ||
      (filterStatus === "pending" && !medicine.verified)

    return matchesSearch && matchesFilter
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isExpiringSoon = (expiry: string) => {
    const expiryDate = new Date(expiry)
    const today = new Date()
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isExpired = (expiry: string) => {
    return new Date(expiry) < new Date()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
          <div className="relative max-w-6xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <Package className="w-4 h-4" />
              Medicine Store
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
              Available <span className="text-emerald-600 dark:text-emerald-400">Medicines</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-pretty">
              Browse donated medicines available for distribution. All verified medicines are quality-checked and safe
              for use.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-16 z-40">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-500" />
                <Select
                  value={filterStatus}
                  onValueChange={(value: "all" | "verified" | "pending") => setFilterStatus(value)}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Medicines</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="hidden sm:flex">
                  {filteredMedicines.length} items
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Medicine Grid */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Loading medicines...</p>
              </div>
            ) : dbSetupNeeded ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
                  <Database className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Database Setup Required</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                  The database tables have not been created yet. Please run the setup scripts to initialize the
                  database.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline">
                    <Link href="/donate">Donate Medicine</Link>
                  </Button>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/">Go Home</Link>
                  </Button>
                </div>
              </div>
            ) : filteredMedicines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No medicines found</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No medicines have been donated yet. Be the first to contribute!"}
                </p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/donate">Donate Medicine</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedicines.map((medicine, index) => (
                  <div
                    key={medicine.id}
                    className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      {medicine.image_urls && medicine.image_urls.length > 0 ? (
                        <Image
                          src={medicine.image_urls[0] || "/placeholder.svg"}
                          alt={medicine.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {medicine.verified ? (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      {/* Expiry Warning */}
                      {isExpired(medicine.expiry_date) && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Expired
                          </Badge>
                        </div>
                      )}
                      {isExpiringSoon(medicine.expiry_date) && !isExpired(medicine.expiry_date) && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Expiring Soon
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">
                          {medicine.name}
                        </h3>
                        <Badge variant="outline" className="shrink-0">
                          Qty: {medicine.quantity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{medicine.brand}</p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span>Exp: {formatDate(medicine.expiry_date)}</span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {formatDate(medicine.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
