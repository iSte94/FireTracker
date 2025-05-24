import AuthForm from "@/components/auth/auth-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Accedi al tuo account</h1>
          <p className="mt-2 text-muted-foreground">
            Inserisci le tue credenziali per accedere al tuo account FIRE Tracker
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
