import { Notification } from "@/domain/notification";
import { NotificationRepository } from "@/domain/notification";
import { prisma } from "./client";

export class PrismaNotificationRepository implements NotificationRepository {
  async add(notification: Notification): Promise<void> {
    await prisma.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      },
    });
  }

  async findByUser(userId: string): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) =>
      Notification.create({
        id: row.id,
        userId: row.userId,
        message: row.message,
        read: row.read,
        createdAt: row.createdAt,
      }),
    );
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({ where: { id } });
  }
}
