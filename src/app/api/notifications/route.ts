import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ListUserNotifications } from "@/application/notification";
import { PrismaNotificationRepository } from "@/infrastructure/db/prisma/notification-repository-impl";

const notificationRepository = new PrismaNotificationRepository();
const listUserNotifications = new ListUserNotifications(notificationRepository);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await listUserNotifications.execute({ userId: session.user.id });

    return NextResponse.json(
      notifications.map((n) => ({
        id: n.id,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
