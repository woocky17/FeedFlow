"use client";

import { Card } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";

interface NotificationItemProps {
  message: string;
  createdAt: string;
  read: boolean;
  onMarkRead?: () => void;
}

function formatNotificationDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationItem({ message, createdAt, read, onMarkRead }: NotificationItemProps) {
  if (read) {
    return (
      <Card radius="xl" padding="none" className="px-4 py-3">
        <p className="text-sm text-slate-500">{message}</p>
        <p className="mt-1 text-xs text-slate-300">{formatNotificationDate(createdAt)}</p>
      </Card>
    );
  }

  return (
    <Card
      tone="amber"
      radius="xl"
      padding="none"
      className="flex items-start justify-between px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
        <div>
          <p className="text-sm text-slate-700">{message}</p>
          <p className="mt-1 text-xs text-slate-400">{formatNotificationDate(createdAt)}</p>
        </div>
      </div>
      {onMarkRead && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onMarkRead}
          className="flex-shrink-0 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
        >
          Mark read
        </Button>
      )}
    </Card>
  );
}
