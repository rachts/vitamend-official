"use client"

import Link from "next/link"
import Image from "next/image"
import ThemeToggle from "@/components/theme-toggle"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navItems = ["Donate", "Volunteer", "Store", "Transparency", "Founders"]

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (item: string) => {
    const itemPath = `/${item.toLowerCase()}`
    return pathname === itemPath
  }

  const logoVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  const navLinkVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.2 + i * 0.06, ease: "easeOut" },
    }),
  }

  const actionsVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.4, ease: "easeOut" } },
  }

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-white/30 dark:bg-slate-900/40 border-b border-gray-200/50 dark:border-slate-800/50 transition-all duration-500 shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <motion.div initial={mounted ? "hidden" : false} animate="visible" variants={logoVariants}>
          <Link href="/" className="flex items-center gap-2 group" aria-label="VitaMend Home">
            <Image
              src="/logo.png"
              alt="VitaMend logo"
              width={32}
              height={32}
              className="rounded transition-transform duration-300 ease-out group-hover:scale-110"
              priority
            />
            <span className="text-base font-semibold text-slate-900 dark:text-white transition-colors duration-300">
              VitaMend
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
          {navItems.map((item, i) => (
            <motion.div
              key={item}
              initial={mounted ? "hidden" : false}
              animate="visible"
              custom={i}
              variants={navLinkVariants}
            >
              <Link
                href={`/${item.toLowerCase()}`}
                className={`relative text-sm font-medium transition-all duration-300 ease-out link-underline ${
                  isActive(item)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item}
                {isActive(item) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Actions */}
        <motion.div
          className="flex items-center gap-4"
          initial={mounted ? "hidden" : false}
          animate="visible"
          variants={actionsVariants}
        >
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`hidden sm:block rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 shadow-md ${
                  pathname === "/dashboard"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="hidden sm:block rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="hidden sm:block rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700"
            >
              Login
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 ease-out"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </motion.div>
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden overflow-hidden"
        initial={false}
        animate={{ height: mobileMenuOpen ? "auto" : 0, opacity: mobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <nav
          className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-4 px-4 space-y-1"
          aria-label="Mobile navigation"
        >
          {navItems.map((item, idx) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className={`block py-3 px-4 rounded-xl font-bold transition-all duration-200 ease-out ${
                isActive(item)
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {item}
            </Link>
          ))}

          {user ? (
            <>
              <Link href="/dashboard" className="block py-3 px-4 rounded-xl font-bold transition-all text-blue-600 bg-blue-50 dark:bg-slate-800 mt-4" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="block w-full text-left py-3 px-4 mt-2 rounded-xl font-bold transition-all text-red-600 hover:bg-red-50 dark:hover:bg-slate-800">Logout</button>
            </>
          ) : (
             <Link href="/auth/signin" className="block w-full py-4 text-center mt-4 rounded-xl font-bold transition-all text-white bg-blue-600 shadow-lg" onClick={() => setMobileMenuOpen(false)}>Login</Link>
          )}
        </nav>
      </motion.div>
    </header>
  )
}
