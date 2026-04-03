"use client"

import { useState, useEffect } from "react"

import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Shield, Award, ArrowRight } from "lucide-react"
import Snowfall from 'react-snowfall'
import { motion } from "framer-motion"

const TiltCard = dynamic(() => import("@/components/tilt-card").then((m) => ({ default: m.TiltCard })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl h-full" />,
})

const RippleButton = dynamic(() => import("@/components/ripple-button").then((m) => ({ default: m.RippleButton })), {
  ssr: false,
  loading: () => (
    <button className="px-8 py-4 text-lg rounded-2xl bg-blue-600 text-white font-semibold">Loading...</button>
  ),
})

const ParallaxSection = dynamic(
  () => import("@/components/parallax-section").then((m) => ({ default: m.ParallaxSection })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-slate-200 h-64 rounded-2xl"></div>,
  },
)

const HeroAnimations = dynamic(() => import("@/components/hero-animations"), {
  ssr: false,
})

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// How it works data
const howItWorks = [
  {
    icon: Heart,
    color: "blue",
    title: "1. Donate",
    desc: "Upload photos of your unused, unexpired medicines through our secure platform",
  },
  {
    icon: Shield,
    color: "purple",
    title: "2. Verify",
    desc: "Our AI system and certified pharmacists verify medicine quality and authenticity",
  },
  {
    icon: Users,
    color: "pink",
    title: "3. Connect",
    desc: "We match verified medicines with verified NGOs and healthcare providers",
  },
  {
    icon: Award,
    color: "blue",
    title: "4. Impact",
    desc: "Track your real-world impact and see how your donations help communities",
  },
]

// Features data
const features = [
  {
    icon: Shield,
    color: "blue",
    title: "AI-Powered Verification",
    desc: "Advanced AI technology combined with expert pharmacist review ensures only safe, quality medicines are redistributed.",
  },
  {
    icon: Heart,
    color: "purple",
    title: "Direct Impact",
    desc: "See exactly how your donations help real people in your community and beyond with detailed impact reports.",
  },
  {
    icon: Users,
    color: "pink",
    title: "Trusted Network",
    desc: "We work with verified NGOs, hospitals, and healthcare providers to ensure medicines reach those in need.",
  },
]

export default function HomePage() {
  const [stats, setStats] = useState({
    medicines: 0,
    users: 0,
    volunteers: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const [medicinesRes, usersRes, volunteersRes] = await Promise.all([
          fetch(`${API_URL}/api/medicines`).catch(() => null),
          fetch(`${API_URL}/api/auth/users`).catch(() => null),
          fetch(`${API_URL}/api/volunteers`).catch(() => null),
        ]);

        const medicinesData = medicinesRes?.ok ? await medicinesRes.json() : [];
        const usersData = usersRes?.ok ? await usersRes.json() : [];
        const volunteersData = volunteersRes?.ok ? await volunteersRes.json() : [];

        setStats({
          medicines: Array.isArray(medicinesData) ? medicinesData.length : 0,
          users: Array.isArray(usersData) ? usersData.length : 0,
          volunteers: Array.isArray(volunteersData) ? volunteersData.length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <HeroAnimations />
      <Snowfall color="82C3D9" />
      
      {/* Hero Section */}
      <section className="relative container mx-auto flex flex-col items-center gap-6 px-4 pt-32 pb-20 text-center overflow-hidden">
        {/* Ambient glows - CSS only */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="animate-float">
          <Image
            src="/logo.png"
            alt="VitaMend logo"
            width={96}
            height={96}
            priority
            className="drop-shadow-2xl"
            fetchPriority="high"
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl text-balance text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl"
        >
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Donate Medicines.
          </span>
          <br />
          Save Lives.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-serif text-blue-700 dark:text-blue-400 italic">
          सर्वे सन्तु निरामयाः
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }} 
          className="text-sm text-gray-500 dark:text-slate-400 -mt-4">
          {"\"May all beings be free from illness\""}
        </motion.p>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl text-pretty text-lg text-gray-600 dark:text-slate-400 md:text-xl mt-4"
        >
          A platform where unused medicines reach people who need them. Verify safety securely through AI and redistribute seamlessly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8"
        >
          <Link href="/donate">
            <RippleButton variant="primary" className="px-10 py-5 text-xl rounded-2xl">
              Donate Medicines
              <ArrowRight className="ml-2 h-5 w-5 inline" aria-hidden="true" />
            </RippleButton>
          </Link>
          <Link href="/volunteer">
            <RippleButton variant="outline" className="px-10 py-5 text-xl rounded-2xl">
              Become a Volunteer
            </RippleButton>
          </Link>
        </motion.div>
      </section>

      {/* Real Product Statistics Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            variants={container} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, margin: "-100px" }} 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-12 rounded-[2.5rem] shadow-xl shadow-blue-900/5 dark:shadow-blue-900/20 border border-white/50 dark:border-slate-700/50"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">{stats.medicines}</h2>
              <p className="text-xl text-gray-600 dark:text-slate-300 font-medium">Medicines Donated</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-3">{stats.users}</h2>
              <p className="text-xl text-gray-600 dark:text-slate-300 font-medium">People Helped</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-3">{stats.volunteers}</h2>
              <p className="text-xl text-gray-600 dark:text-slate-300 font-medium">Volunteers</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <ParallaxSection speed={0.2}>
        <section className="py-24 transition-colors duration-500">
          <div className="container mx-auto px-4">
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
              <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">How Vitamend Works</motion.h2>
              <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
                Donate → Verify → Deliver. Our secure process ensures your medicines reach those who need them most.
              </motion.p>
            </motion.div>

            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {howItWorks.map((item) => (
                <TiltCard key={item.title} tiltAmount={5}>
                  <motion.div variants={itemVariants} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 200 }} className="h-full">
                    <Card className="text-center border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm h-full group min-h-[300px] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                      <CardHeader className="pb-4">
                        <div
                          className={`w-16 h-16 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300`}
                        >
                          <item.icon
                            className={`h-8 w-8 text-${item.color}-600 dark:text-${item.color}-400`}
                            aria-hidden="true"
                          />
                        </div>
                        <CardTitle className="text-2xl dark:text-white mb-2">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-lg text-gray-600 dark:text-slate-400">{item.desc}</CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TiltCard>
              ))}
            </motion.div>
          </div>
        </section>
      </ParallaxSection>

      {/* Features Section */}
      <section className="py-24 transition-colors duration-500">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="text-center mb-20">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Why Choose VitaMend?</motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              We&apos;ve built the most trusted and efficient digital platform for medicine donation and redistribution.
            </motion.p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((item) => (
              <TiltCard key={item.title} tiltAmount={4}>
                <motion.div variants={itemVariants} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 200 }} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-transparent dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 group h-full min-h-[320px] flex flex-col items-center text-center">
                  <div
                    className={`w-20 h-20 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                  >
                    <item.icon
                      className={`h-10 w-10 text-${item.color}-600 dark:text-${item.color}-400`}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten" aria-hidden="true" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten" aria-hidden="true" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="max-w-4xl mx-auto bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-16 rounded-[3rem] border border-white/50 dark:border-slate-700/50 shadow-2xl">
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
              Ready to Make a Real Difference?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-2xl text-gray-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              Join thousands of donors and volunteers who are eliminating medical waste and saving lives every day.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup">
                <RippleButton variant="primary" className="px-12 py-5 text-xl rounded-2xl">
                  Get Started Today
                  <ArrowRight className="ml-3 h-6 w-6 inline" aria-hidden="true" />
                </RippleButton>
              </Link>
              <Link href="/about">
                <RippleButton variant="outline" className="px-12 py-5 text-xl rounded-2xl bg-white/50 dark:bg-slate-800/50">
                  Learn More
                </RippleButton>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
