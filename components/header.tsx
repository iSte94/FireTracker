"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  User,
  Home,
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Calculator,
  Receipt,
  Target,
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsFireBudget, useIsFireOnly } from "@/components/providers/view-mode-provider"
import { FireQuickStats } from "@/components/fire/fire-quick-stats"
import { useAuthSync } from "@/hooks/use-auth-sync"

export default function Header() {
  const pathname = usePathname()
  const { user, loading, initialized, refreshSession } = useAuthSync()
  const supabase = createClientComponentClient()
  const isFireBudget = useIsFireBudget()
  const isFireOnly = useIsFireOnly()

  // Aggiungi un effetto per forzare il refresh se necessario
  useEffect(() => {
    // Se l'hook è inizializzato ma non c'è utente, e ci sono cookie di autenticazione,
    // prova a fare un refresh manuale
    if (initialized && !user && !loading && typeof window !== 'undefined') {
      const hasAuthCookie = document.cookie.includes('sb-') && document.cookie.includes('auth-token')
      
      if (hasAuthCookie) {
        console.log('Header: Cookie presenti ma nessun utente, tentativo di refresh...')
        refreshSession().then((success) => {
          if (!success) {
            console.log('Header: Refresh fallito, potrebbe essere necessario un reload')
            // Opzionalmente, forza un reload dopo un timeout
            setTimeout(() => {
              if (!user && document.cookie.includes('sb-') && document.cookie.includes('auth-token')) {
                console.log('Header: Forzando reload della pagina...')
                window.location.reload()
              }
            }, 3000)
          }
        })
      }
    }
  }, [initialized, user, loading, refreshSession])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // Routes per modalità normale e FIRE & Budget
  const defaultRoutes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
      visible: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      visible: true,
    },
    {
      href: "/calculators",
      label: "Calcolatori",
      icon: Calculator,
      active: pathname === "/calculators",
      visible: true,
    },
    {
      href: "/budget",
      label: "Budget",
      icon: DollarSign,
      active: pathname === "/budget",
      visible: isFireBudget, // Visibile solo in modalità FIRE & Budget
    },
    {
      href: "/goals",
      label: "Obiettivi",
      icon: Target,
      active: pathname === "/goals",
      visible: true,
    },
    {
      href: "/financial-transactions",
      label: "Transazioni Finanziarie",
      icon: Receipt,
      active: pathname === "/financial-transactions",
      visible: true,
    },
  ]

  // Routes ottimizzate per modalità Solo FIRE
  const fireOnlyRoutes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      visible: true,
    },
    {
      href: "/fire-progress",
      label: "Progresso FIRE",
      icon: TrendingUp,
      active: pathname === "/fire-progress",
      visible: true,
    },
    {
      href: "/portfolio",
      label: "Portafoglio",
      icon: Briefcase,
      active: pathname === "/portfolio",
      visible: true,
    },
    {
      href: "/calculators",
      label: "Calcolatori",
      icon: Calculator,
      active: pathname === "/calculators",
      visible: true,
    },
    {
      href: "/financial-transactions",
      label: "Transazioni Finanziarie",
      icon: Receipt,
      active: pathname === "/financial-transactions",
      visible: true,
    },
  ]

  const routes = (isFireOnly ? fireOnlyRoutes : defaultRoutes).filter(route => route.visible)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl inline-block">🔥</span>
            <span className="font-bold hidden md:inline-block">FIRE Tracker</span>
          </Link>
          <nav className="hidden md:flex gap-4">
            {routes.map((route) => {
              const Icon = route.icon
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all",
                    route.active
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  aria-label={route.label}
                  aria-current={route.active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{route.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        {/* FIRE Quick Stats - visibile solo in modalità Solo FIRE e quando l'utente è autenticato */}
        {isFireOnly && user && <FireQuickStats className="mr-4" />}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.email} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.user_metadata?.full_name || "Utente"}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profilo</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Disconnetti</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Accedi
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Registrati
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => {
                  const Icon = route.icon
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all",
                        route.active
                          ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                      aria-label={route.label}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{route.label}</span>
                    </Link>
                  )
                })}
                {!loading && !user && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Accedi
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Registrati</Button>
                    </Link>
                  </div>
                )}
                {!loading && user && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/profile">
                      <Button variant="outline" className="w-full">
                        Profilo
                      </Button>
                    </Link>
                    <Button className="w-full" variant="destructive" onClick={handleSignOut}>
                      Disconnetti
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
