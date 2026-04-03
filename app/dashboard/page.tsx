"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xl text-gray-500 mt-2">Here is a summary of your Vitamend impact.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          
          <motion.div 
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-transparent hover:border-blue-100 transition-colors cursor-pointer"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Donations</h2>
            <p className="text-gray-500">Track all your donated medicines and their current verification status.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-transparent hover:border-purple-100 transition-colors cursor-pointer"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Requests</h2>
            <p className="text-gray-500">Check medicine requests and pending fulfillment deliveries.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-transparent hover:border-pink-100 transition-colors cursor-pointer"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Volunteer Status</h2>
            <p className="text-gray-500">See approval updates and nearby active medical delivery zones.</p>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
