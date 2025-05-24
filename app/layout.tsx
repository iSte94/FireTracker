import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import BudgetAlertsProvider from "@/components/budget-alerts-provider"
import { GoalAlertsProvider } from "@/components/providers/goal-alerts-provider"
import { ViewModeProvider } from "@/components/providers/view-mode-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FIRE Progress Tracker",
  description:
    "Traccia e pianifica il tuo percorso verso l'indipendenza finanziaria con strumenti avanzati per FIRE, COAST FIRE e Barista FIRE.",
    generator: 'v0.dev'
}

// Wrapper condizionale per i provider
function ConditionalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ViewModeProvider>
      <BudgetAlertsProvider>
        <GoalAlertsProvider>
          {children}
        </GoalAlertsProvider>
      </BudgetAlertsProvider>
    </ViewModeProvider>
  );
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
