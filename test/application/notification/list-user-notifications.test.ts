import { describe, expect, it, vi } from "vitest";
import { Notification, type NotificationRepository } from "@/domain/notification";
import { ListUserNotifications } from "@/application/notification";

function makeNotification(id: string, createdAt: string): Notification {
  return Notification.create({
    id,
    userId: "user-1",
    message: `Message ${id}`,
    read: false,
    createdAt: new Date(createdAt),
  });
}

function makeRepository(notifications: Notification[]): NotificationRepository {
  return {
    add: vi.fn(),
    findByUser: vi.fn(),
    findRecentByUser: vi.fn().mockResolvedValue(notifications),
    markAsRead: vi.fn(),
  };
}

describe("ListUserNotifications", () => {
  it("returns the most recent notifications of the user with the default limit", async () => {
    const notifications = [
      makeNotification("n-2", "2026-11-02T10:00:00Z"),
      makeNotification("n-1", "2026-11-01T10:00:00Z"),
    ];
    const repository = makeRepository(notifications);

    const result = await new ListUserNotifications(repository).execute({ userId: "user-1" });

    expect(repository.findRecentByUser).toHaveBeenCalledWith("user-1", 100);
    expect(repository.findByUser).not.toHaveBeenCalled();
    expect(result).toEqual(notifications);
  });

  it("passes a custom limit to the repository", async () => {
    const repository = makeRepository([]);

    await new ListUserNotifications(repository).execute({ userId: "user-1", limit: 20 });

    expect(repository.findRecentByUser).toHaveBeenCalledWith("user-1", 20);
  });

  it("returns an empty list when the user has no notifications", async () => {
    const repository = makeRepository([]);

    const result = await new ListUserNotifications(repository).execute({ userId: "user-2" });

    expect(result).toEqual([]);
  });
});
