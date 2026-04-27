"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/templates/app-layout";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { NotificationItem } from "@/components/molecules/notification-item";
import { SectionHeader } from "@/components/molecules/section-header";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificacionesPage() {
  const t = useTranslations("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  }

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <AppLayout title={t("title")}>
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="md" color="amber" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title={t("noNotificationsTitle")}
          description={t("noNotificationsDescription")}
        />
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <div>
              <SectionHeader className="mb-3 text-amber-600">
                {t("newSection", { count: unread.length })}
              </SectionHeader>
              <div className="space-y-2">
                {unread.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    message={notif.message}
                    createdAt={notif.createdAt}
                    read={false}
                    onMarkRead={() => markAsRead(notif.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div>
              <SectionHeader className="mb-3">{t("previousSection")}</SectionHeader>
              <div className="space-y-2">
                {read.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    message={notif.message}
                    createdAt={notif.createdAt}
                    read
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
