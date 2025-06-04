// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
    * Abbina tutte le route eccetto quelle che iniziano con:
    * - api (Route API)
    * - _next/static (file statici)
    * - _next/image (ottimizzazione immagini)
    * - favicon.ico (file favicon)
    * - / (homepage, se vuoi che sia pubblica)
    * - /login (pagina di login)
    * - /register (pagina di registrazione)
    * - /auth (route di next-auth, anche se di solito sono gestite internamente)
    * - /images (se hai una cartella public/images)
    * - /placeholder-logo.svg (o altri asset pubblici)
    */
    "/dashboard/:path*",
    "/profile/:path*",
    "/budget/:path*",
    "/financial-transactions/:path*",
    "/goals/:path*",
    "/portfolio/:path*",
    "/fire-progress/:path*",
    // Aggiungi altre route che vuoi proteggere
  ],
};
