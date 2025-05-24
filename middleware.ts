import { createMiddlewareClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Crea il client Supabase per il middleware
  const supabase = createMiddlewareClient(req, res)

  // DEBUG: Log tutti i cookie per capire i nomi corretti
  console.log('=== MIDDLEWARE DEBUG ===')
  console.log('URL:', req.nextUrl.pathname)
  console.log('Tutti i cookie Supabase:')
  req.cookies.getAll().forEach(cookie => {
    if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
      console.log(`  ${cookie.name}: ${cookie.value ? cookie.value.substring(0, 50) + '...' : 'vuoto'}`)
    }
  })

  // Ottieni l'utente autenticato in modo sicuro usando getUser()
  // Questo metodo verifica il token con il server Supabase
  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log('Utente autenticato trovato:', !!user)
  console.log('Errore autenticazione:', error)
  if (user) {
    console.log('User ID:', user.id)
    console.log('Email:', user.email)
  }

  // Check if the user is authenticated
  const isAuthenticated = !!user

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile", "/budget", "/goals", "/financial-transactions"]

  // Routes that are only available in FIRE & Budget mode
  const budgetOnlyRoutes = ["/budget"]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`),
  )

  // Check if the current path is a budget-only route
  const isBudgetRoute = budgetOnlyRoutes.some(
    (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`),
  )

  // Redirect to login if accessing a protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    console.log('Redirect to login - protected route without auth')
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check view mode for authenticated users accessing budget routes
  if (isAuthenticated && isBudgetRoute) {
    // Ottieni il profilo dell'utente per controllare la modalità di visualizzazione
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("view_mode")
      .eq("id", user.id)
      .single()

    console.log('Profile view_mode:', profile?.view_mode)
    console.log('Profile error:', profileError)

    // Se l'utente è in modalità "Solo FIRE", reindirizza alla dashboard
    if (profile?.view_mode === 'fire_only') {
      console.log('Redirect to dashboard - fire_only mode trying to access budget')
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Redirect to dashboard if accessing login/register while authenticated
  if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && isAuthenticated) {
    console.log('Redirect to dashboard - already authenticated')
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // IMPORTANTE: Restituisci la response con i cookie aggiornati
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (per evitare conflitti)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
