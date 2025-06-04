import type React from "react"
import "@/app/globals.css"
// Importa PRIMA di tutto per prevenire conflitti ethereum (versione ultra-precoce)
import "@/lib/ethereum-conflict-prevention-early"
// Backup per prevenzione avanzata
import "@/lib/ethereum-conflict-prevention-advanced"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { ClientProviders } from "@/components/providers/client-providers"
import EthereumConflictMonitor from "@/components/ethereum-conflict-monitor"
import { PerformanceMonitor } from "@/components/debug/performance-monitor"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FIRE Progress Tracker",
  description:
    "Traccia e pianifica il tuo percorso verso l'indipendenza finanziaria con strumenti avanzati per FIRE, COAST FIRE e Barista FIRE.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          <Header />
          {children}
          <Footer />
          <Toaster />
          <EthereumConflictMonitor />
          {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        </ClientProviders>
      </body>
    </html>
  )
}
