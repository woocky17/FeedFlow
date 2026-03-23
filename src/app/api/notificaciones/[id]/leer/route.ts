import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MarkNotificationRead } from "@/application/notification";
import { PrismaNotificationRepository } from "@/infrastructure/db/prisma/notification-repository-impl";

const notificationRepository = new PrismaNotificationRepository();
const markNotificationRead = new MarkNotificationRead(notificationRepository);

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await markNotificationRead.execute({
      notificationId: id,
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark notification";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
