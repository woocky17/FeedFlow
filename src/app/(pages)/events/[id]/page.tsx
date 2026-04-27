"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/templates/app-layout";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";

interface EventArticle {
  id: string;
  title: string;
  url: string;
  description: string | null;
  image: string | null;
  sourceId: string;
  sourceName: string;
  publishedAt: string;
  sentiment: "positive" | "neutral" | "negative" | null;
  framingSummary: string | null;
}

interface EventDetails {
  event: {
    id: string;
    title: string;
    firstSeenAt: string;
    lastSeenAt: string;
  };
  articles: EventArticle[];
}

const sentimentVariant: Record<string, "positive" | "neutral" | "negative"> = {
  positive: "positive",
  neutral: "neutral",
  negative: "negative",
};

const sentimentLabels: Record<string, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export default function EventPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to load event");
        }
        return res.json();
      })
      .then((body: EventDetails) => {
        setData(body);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout title="Loading...">
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout title="Event">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-red-700">
          {error ?? "Not found"}
        </div>
      </AppLayout>
    );
  }

  const count = data.articles.length;

  return (
    <AppLayout title="Coverage comparison">
      <Card padding="md" className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">{data.event.title}</h2>
        <p className="mt-2 text-sm text-slate-500">
          {count} {count === 1 ? "source covering" : "sources covering"} this event
        </p>
      </Card>

      <div className={`grid gap-4 ${count === 1 ? "grid-cols-1" : count === 2 ? "md:grid-cols-2" : "lg:grid-cols-3 md:grid-cols-2"}`}>
        {data.articles.map((article) => {
          const sentimentKey = article.sentiment ?? "neutral";
          return (
            <Card
              key={article.id}
              padding="none"
              className="flex flex-col overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {article.sourceName}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(article.publishedAt).toLocaleString("es-ES", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {article.image && (
                <div className="aspect-video overflow-hidden bg-slate-100">
                  <img src={article.image} alt="" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-slate-900 leading-snug">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="mt-2 text-sm text-slate-500">{article.description}</p>
                )}

                {article.sentiment && (
                  <div className="mt-3">
                    <Badge variant={sentimentVariant[sentimentKey] ?? "neutral"} size="sm">
                      {sentimentLabels[sentimentKey] ?? "Neutral"}
                    </Badge>
                    {article.framingSummary && (
                      <p className="mt-2 text-xs italic text-slate-500">
                        {article.framingSummary}
                      </p>
                    )}
                  </div>
                )}

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                >
                  Read original
                  <Icon name="external" size={12} />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
