// lib/auth-options.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma"; // Percorso corretto per l'importazione locale
import bcrypt from "bcryptjs";
import { perfLogger } from "./performance-logger";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        return await perfLogger.timeOperation(
          'NextAuth User Authentication',
          async () => {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email }
            });

            // Verifica che l'utente esista e abbia una password (potrebbe non averla se si è registrato con OAuth)
            if (!user || !user.password) {
              console.log(`🚫 [AUTH] User not found or no password: ${credentials.email}`);
              return null;
            }

            const isValidPassword = await bcrypt.compare(credentials.password, user.password);

            if (!isValidPassword) {
              console.warn(`🚫 [AUTH] Invalid password for user: ${credentials.email}`);
              return null;
            }

            console.log(`✅ [AUTH] User authenticated: ${credentials.email}`);
            // Restituisci l'utente senza la password
            return {
              id: user.id,
              email: user.email,
              name: user.name, // o user.profile?.fullName se hai quella relazione e vuoi il nome completo
              // ...altri campi che vuoi esporre alla sessione/token
            };
          },
          { email: credentials.email }
        );
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "signIn" && user) {
        token.id = user.id;
        // token.name = user.name; // Se vuoi aggiungere il nome al token
      }
      // Se vuoi aggiornare la sessione (es. dopo un cambio nome profilo)
      if (trigger === "update" && session?.name) { // session?.name è un esempio, adatta al tuo caso
         token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      // if (token?.name && session.user) {
      //   session.user.name = token.name as string;
      // }
      return session;
    }
  },
  pages: {
    signIn: "/login", // Assicurati che questa pagina esista o creala/adattala
    // signOut: '/auth/signout', // Opzionale
    // error: '/auth/error', // Opzionale
    // verifyRequest: '/auth/verify-request', // Opzionale
    // newUser: null // Opzionale: se vuoi reindirizzare i nuovi utenti a una pagina specifica
  },
  secret: process.env.NEXTAUTH_SECRET,
};