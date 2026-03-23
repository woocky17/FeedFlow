"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/templates/app-layout";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificacionesPage() {
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
    <AppLayout title="Notifications">
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-400">No notifications</p>
          <p className="mt-1 text-sm text-slate-300">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-600">
                New ({unread.length})
              </h2>
              <div className="space-y-2">
                {unread.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start justify-between rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                      <div>
                        <p className="text-sm text-slate-700">{notif.message}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(notif.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="flex-shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-100"
                    >
                      Mark read
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Previous
              </h2>
              <div className="space-y-2">
                {read.map((notif) => (
                  <div
                    key={notif.id}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <p className="text-sm text-slate-500">{notif.message}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      {new Date(notif.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
