import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeClientProvider } from '@/context/theme-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Delivery Panel - Sistema de Gestión de Entregas',
  description: 'Panel de control para gestionar Pickup, Delivery y Delivery Express',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/delivery-favicon-55d8Fdngd2jZOrJrtIDGQxNcGF8QS2.png',
    apple: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/delivery-favicon-55d8Fdngd2jZOrJrtIDGQxNcGF8QS2.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <ThemeClientProvider>
          {children}
        </ThemeClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
