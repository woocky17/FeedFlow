"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/templates/app-layout";

interface Source {
  id: string;
  name: string;
  baseUrl: string;
  active: boolean;
}

export default function FuentesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    try {
      const res = await fetch("/api/noticias?sources=true");
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch {
      // Sources endpoint may not exist yet for listing, use empty
    } finally {
      setLoading(false);
    }
  }

  async function toggleSource(id: string, active: boolean) {
    try {
      await fetch(`/api/admin/fuentes/${id}`, {
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

  return (
    <AppLayout title="Sources">
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-400">No sources available</p>
          <p className="mt-1 text-sm text-slate-300">Sources are managed by administrators.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-amber-200"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">{source.name}</p>
                <p className="text-xs text-slate-400">{source.baseUrl}</p>
              </div>
              <button
                onClick={() => toggleSource(source.id, source.active)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  source.active ? "bg-amber-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    source.active ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
