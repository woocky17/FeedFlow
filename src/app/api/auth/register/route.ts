import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaUserRepository } from "@/infrastructure/db/prisma/user-repository-impl";
import { RegisterUser } from "@/application/user";
import { randomUUID } from "crypto";

const userRepository = new PrismaUserRepository();
const registerUser = new RegisterUser(userRepository, {
  hash: (password: string) => bcrypt.hash(password, 12),
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await registerUser.execute({ id: randomUUID(), email, password });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
