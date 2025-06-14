import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Email, password, and fullName are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const newProfile = await prisma.profile.create({
      data: {
        fullName,
        email, // Assumendo che il modello Profile abbia un campo email
        // Aggiungi altri campi del profilo con valori di default se necessario
        // username: email.split('@')[0], // Esempio
        // avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`, // Esempio
        user: {
          connect: {
            id: newUser.id,
          },
        },
      },
    });

    // Rimuovi la password dalla risposta
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        profile: newProfile,
        message: "User registered successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration API error:", error);
    // Controlla se l'errore è di un tipo noto o ha un messaggio specifico
    const errorMessage = error instanceof Error ? error.message : "Errore interno del server";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
