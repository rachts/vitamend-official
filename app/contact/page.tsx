import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"
import Image from "next/image"

const CONTACT = {
  email: "vitamend.org@gmail.com",
  phone: "+91 9929243215",
  whatsapp: "https://wa.me/919929243215",
  emailLink: "mailto:vitamend.org@gmail.com",
  address: "149/1 J.N. Mukherjee Road, Howrah, Ghusri, West Bengal -711106",
}

export const metadata = {
  title: "Contact Us | VitaMend",
  description: "Get in touch with VitaMend. We're here to help with any questions about medicine donations.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Image
              src="/logo.png"
              alt="VitaMend logo"
              width={64}
              height={64}
              className="mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h1>
            <p className="text-lg font-serif text-emerald-600 dark:text-emerald-400 italic mb-2">सर्वे सन्तु निरामयाः</p>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Have questions about donating medicines or volunteering? We'd love to hear from you. Reach out through any
              of the channels below.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-emerald-700 dark:text-emerald-400">Quick Contact</CardTitle>
                  <CardDescription>Reach out to us directly through these channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a
                    href={CONTACT.emailLink}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group"
                  >
                    <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                      <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Email</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">{CONTACT.email}</p>
                    </div>
                  </a>

                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                  >
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                      <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">WhatsApp</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{CONTACT.phone}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                  >
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Phone</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{CONTACT.phone}</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-slate-800">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50">
                      <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Address</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{CONTACT.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Office Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Monday - Friday</span>
                      <span className="font-medium text-slate-900 dark:text-white">9:00 AM - 6:00 PM IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Saturday</span>
                      <span className="font-medium text-slate-900 dark:text-white">10:00 AM - 4:00 PM IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Sunday</span>
                      <span className="font-medium text-slate-900 dark:text-white">Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
