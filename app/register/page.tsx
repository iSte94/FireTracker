import AuthForm from "@/components/auth/auth-form"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Crea un account</h1>
          <p className="mt-2 text-muted-foreground">
            Registrati per iniziare a tracciare il tuo percorso verso l'indipendenza finanziaria
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
