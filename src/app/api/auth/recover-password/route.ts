import { NextRequest, NextResponse } from "next/server";
import { PrismaUserRepository } from "@/infrastructure/db/prisma/user-repository-impl";
import { ResendEmailAdapter } from "@/infrastructure/mail/resend/resend-email-adapter";
import { RecoverPassword } from "@/application/user";
import { passwordRecoveryEmailTemplate } from "@/infrastructure/mail/resend/templates";
import { randomUUID } from "crypto";

const userRepository = new PrismaUserRepository();
const emailSender = new ResendEmailAdapter(process.env.RESEND_API_KEY || "");

const recoverPassword = new RecoverPassword(userRepository, emailSender, {
  generate: () => randomUUID().slice(0, 8).toUpperCase(),
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await recoverPassword.execute({ email });

    return NextResponse.json({ message: "If the email exists, a recovery link was sent" });
  } catch {
    return NextResponse.json({ message: "If the email exists, a recovery link was sent" });
  }
}
