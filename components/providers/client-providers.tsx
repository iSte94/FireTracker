'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { ConditionalProviders } from '@/components/providers/conditional-providers'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <ConditionalProviders>
          {children}
        </ConditionalProviders>
      </ThemeProvider>
    </SessionProvider>
  )
}