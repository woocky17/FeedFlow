"use client";

import { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/atoms/icon";

interface EventSourcesPillProps {
  eventId: string;
  count: number;
}

export function EventSourcesPill({ eventId, count }: EventSourcesPillProps) {
  const router = useRouter();
  const t = useTranslations("events");

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/events/${eventId}`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={t("compareSources")}
      className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
    >
      <Icon name="compare" size={12} />
      {t("sourcesCount", { count })}
    </button>
  );
}
