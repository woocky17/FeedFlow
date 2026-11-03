import { Notification } from "@/domain/notification";
import { NotificationRepository } from "@/domain/notification";
import { prisma } from "./client";

interface NotificationRow {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

function toDomain(row: NotificationRow): Notification {
  return Notification.create({
    id: row.id,
    userId: row.userId,
    message: row.message,
    read: row.read,
    createdAt: row.createdAt,
  });
}

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

    return rows.map(toDomain);
  }

  async findRecentByUser(userId: string, limit: number): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map(toDomain);
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
