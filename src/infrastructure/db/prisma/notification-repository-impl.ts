import { Notificacion } from "@/domain/notification";
import { NotificacionRepository } from "@/domain/notification";
import { prisma } from "./client";

export class PrismaNotificationRepository implements NotificacionRepository {
  async anadir(notification: Notificacion): Promise<void> {
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

  async obtenerPorUsuario(userId: string): Promise<Notificacion[]> {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) =>
      Notificacion.create({
        id: row.id,
        userId: row.userId,
        message: row.message,
        read: row.read,
        createdAt: row.createdAt,
      }),
    );
  }

  async marcarComoLeida(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async eliminar(id: string): Promise<void> {
    await prisma.notification.delete({ where: { id } });
  }
}
