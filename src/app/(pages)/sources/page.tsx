"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/templates/app-layout";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { IconButton } from "@/components/atoms/icon-button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { ToggleSwitch } from "@/components/atoms/toggle-switch";
import { Card } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";
import { EntityRow } from "@/components/molecules/entity-row";
import { SourceForm } from "@/components/organisms/source-form";

type SourceKind = "worldnews" | "rss";

interface Source {
  id: string;
  name: string;
  baseUrl: string;
  kind: SourceKind;
  active: boolean;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    try {
      const res = await fetch("/api/admin/sources");
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }

  async function toggleSource(id: string, active: boolean) {
    try {
      await fetch(`/api/admin/sources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
      );
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silently fail
    }
  }

  return (
    <AppLayout
      title="Sources"
      actions={
        !showForm ? (
          <Button onClick={() => setShowForm(true)} size="sm">
            + Add source
          </Button>
        ) : undefined
      }
    >
      {showForm && (
        <Card padding="md" className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New source</h2>
          <SourceForm
            onSuccess={() => {
              setShowForm(false);
              loadSources();
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : sources.length === 0 ? (
        <EmptyState
          title="No sources yet"
          description="Add your first news source above."
        />
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <EntityRow key={source.id}>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  {source.name}
                  <Badge variant="neutral" size="sm" className="uppercase tracking-wider">
                    {source.kind === "rss" ? "RSS" : "WorldNews"}
                  </Badge>
                </p>
                <p className="truncate text-xs text-slate-400">{source.baseUrl}</p>
              </div>
              <div className="ml-4 flex items-center gap-3">
                <ToggleSwitch
                  checked={source.active}
                  onChange={() => toggleSource(source.id, source.active)}
                  label={`Toggle ${source.name}`}
                />
                <IconButton
                  icon={<Icon name="trash" />}
                  appearance="subtle"
                  tone="red"
                  label="Delete source"
                  onClick={() => handleDelete(source.id)}
                />
              </div>
            </EntityRow>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
