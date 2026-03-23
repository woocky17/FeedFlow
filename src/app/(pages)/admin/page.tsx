"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/templates/app-layout";

interface Source {
  id: string;
  name: string;
  baseUrl: string;
  active: boolean;
}

export default function AdminPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    try {
      const res = await fetch("/api/articles?sources=true");
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, baseUrl: newUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setNewName("");
      setNewUrl("");
      loadSources();
    } catch {
      setError("Failed to add source");
    }
  }

  async function handleUpdate(id: string) {
    setError("");
    try {
      const res = await fetch(`/api/admin/sources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, baseUrl: editUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setEditingId(null);
      loadSources();
    } catch {
      setError("Failed to update source");
    }
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
      loadSources();
    } catch {
      setError("Failed to delete source");
    }
  }

  return (
    <AppLayout title="Admin Panel">
      {/* Add source form */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Add News Source
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Source name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          <input
            type="url"
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            required
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 active:scale-[0.98]"
          >
            Add source
          </button>
        </form>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {/* Sources list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-400">No sources yet</p>
          <p className="mt-1 text-sm text-slate-300">Add your first news source above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-amber-200"
            >
              {editingId === source.id ? (
                <div className="flex flex-1 items-center gap-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    autoFocus
                  />
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                  <button
                    onClick={() => handleUpdate(source.id)}
                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{source.name}</p>
                    <p className="text-xs text-slate-400">{source.baseUrl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        source.active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {source.active ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(source.id);
                        setEditName(source.name);
                        setEditUrl(source.baseUrl);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
