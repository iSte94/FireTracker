import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-emerald-100 p-3">
              <Mail className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-center">Controlla la tua email</CardTitle>
          <CardDescription className="text-center">
            Abbiamo inviato un link di conferma alla tua email. Clicca sul link per completare la registrazione.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Non hai ricevuto l'email? Controlla la cartella spam o richiedi un nuovo link.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">Torna al login</Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
