import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ConditionalProviders } from "@/components/providers/conditional-providers"
import { Toaster } from "@/components/ui/toaster"

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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ConditionalProviders>
            <Header />
            {children}
            <Footer />
            <Toaster />
          </ConditionalProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
