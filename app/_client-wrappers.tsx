"use client"

import { ReactNode, useEffect } from "react"
import { ThemeProvider } from "@/context/ThemeContext"
import Lenis from 'lenis'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function ClientWrappers({ children }: { children: ReactNode }) {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    
    // Smooth scrolling using modern Lenis
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
    });

    return () => {
      lenis.destroy();
    }
  }, []);

  return <ThemeProvider>{children}</ThemeProvider>
}
