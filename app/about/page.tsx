import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Users, Globe, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

const CONTACT = {
  email: "vitamend.org@gmail.com",
  phone: "+91 9929243215",
  whatsapp: "https://wa.me/919929243215",
  emailLink: "mailto:vitamend.org@gmail.com",
  address: "149/1 J.N. Mukherjee Road, Howrah, Ghusri, West Bengal -711106",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="VitaMend logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold mb-4">About VitaMend</h1>
          <p className="text-2xl font-serif text-emerald-600 dark:text-emerald-400 italic mb-2">सर्वे सन्तु निरामयाः</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{'"May all beings be free from illness"'}</p>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            VitaMend is a revolutionary platform that connects unused medicines with those in need, reducing medical
            waste while improving healthcare access for underserved communities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-red-500 mb-2" />
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                To create a sustainable ecosystem where unused medicines find their way to people who need them,
                reducing waste and improving healthcare accessibility worldwide.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A world where no essential medicine goes to waste, and everyone has access to the healthcare they need,
                regardless of their economic situation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>Safety First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We use AI-powered verification and trained volunteers to ensure all donated medicines meet strict safety
                and quality standards before redistribution.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our platform is powered by a community of donors, volunteers, and partner NGOs working together to make
                healthcare more accessible.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">The Problem We're Solving</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">Medical Waste</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                Billions of dollars worth of unused medicines are discarded every year, contributing to environmental
                pollution and representing a massive waste of resources.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Healthcare Access</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                Meanwhile, millions of people worldwide lack access to essential medicines due to cost barriers and
                limited healthcare infrastructure.
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-lg font-medium text-green-600">
              VitaMend bridges this gap by creating a safe, efficient way to redistribute unused medicines.
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Get In Touch</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <a
              href={CONTACT.emailLink}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <Mail className="h-8 w-8 text-emerald-600 mb-2" />
              <span className="font-medium text-slate-900 dark:text-white">Email Us</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{CONTACT.email}</span>
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <Phone className="h-8 w-8 text-emerald-600 mb-2" />
              <span className="font-medium text-slate-900 dark:text-white">WhatsApp</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{CONTACT.phone}</span>
            </a>
            <div className="flex flex-col items-center p-4">
              <MapPin className="h-8 w-8 text-emerald-600 mb-2" />
              <span className="font-medium text-slate-900 dark:text-white">Location</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
