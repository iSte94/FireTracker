import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Estende l'oggetto Session per includere l'id dell'utente.
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]; // Mantiene le proprietà predefinite di user
  }

  /**
   * Estende l'oggetto User predefinito se necessario (es. per aggiungere ruoli).
   * Per ora, l'id è gestito principalmente tramite il token e la sessione.
   */
  // interface User extends DefaultUser {
  //   // Aggiungi qui altre proprietà personalizzate se necessario
  // }
}

declare module "next-auth/jwt" {
  /**
   * Estende il token JWT per includere l'id dell'utente.
   */
  interface JWT extends DefaultJWT {
    id?: string;
    // Aggiungi qui altre proprietà personalizzate se necessario (es. name, role)
    // name?: string | null;
  }
}