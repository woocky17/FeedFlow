import { NextRequest, NextResponse } from "next/server";
import { SendNotifications } from "@/application/notification";
import { PrismaUserRepository } from "@/infrastructure/db/prisma/user-repository-impl";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";
import { PrismaNotificationRepository } from "@/infrastructure/db/prisma/notification-repository-impl";
import { ResendEmailAdapter } from "@/infrastructure/mail/resend/resend-email-adapter";
import { prisma } from "@/infrastructure/db/prisma/client";

const userRepository = new PrismaUserRepository();
const categoryRepository = new PrismaCategoryRepository();
const articleRepository = new PrismaArticleRepository();
const notificationRepository = new PrismaNotificationRepository();
const emailSender = new ResendEmailAdapter(process.env.RESEND_API_KEY || "");

const sendNotifications = new SendNotifications(
  userRepository,
  categoryRepository,
  articleRepository,
  notificationRepository,
  emailSender,
);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    const results: { userId: string; status: string }[] = [];

    for (const user of users) {
      try {
        await sendNotifications.execute(user.id);
        results.push({ userId: user.id, status: "ok" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed";
        results.push({ userId: user.id, status: message });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notifications failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
