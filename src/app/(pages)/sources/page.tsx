"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/templates/app-layout";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { IconButton } from "@/components/atoms/icon-button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { ToggleSwitch } from "@/components/atoms/toggle-switch";
import { Card } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";

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
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [kind, setKind] = useState<SourceKind>("worldnews");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          baseUrl,
          apiKey: kind === "rss" ? "" : apiKey,
          kind,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setName("");
      setBaseUrl("");
      setApiKey("");
      setKind("worldnews");
      setShowForm(false);
      loadSources();
    } catch {
      setError("Failed to add source");
    } finally {
      setSubmitting(false);
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
          <form onSubmit={handleCreate} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">New source</h2>
            <Input
              type="text"
              placeholder="Name (e.g. World News API)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="url"
              placeholder="Base URL (e.g. https://api.worldnewsapi.com)"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as SourceKind)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            >
              <option value="worldnews">WorldNewsAPI</option>
              <option value="rss">RSS / Atom feed</option>
            </select>
            {kind === "worldnews" && (
              <Input
                type="text"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            )}
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" isLoading={submitting}>
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

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
            <div
              key={source.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-amber-200"
            >
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
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
