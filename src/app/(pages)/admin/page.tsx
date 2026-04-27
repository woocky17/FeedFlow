"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/templates/app-layout";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { IconButton } from "@/components/atoms/icon-button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { Card } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";

type SourceKind = "worldnews" | "rss";

interface Source {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  kind: SourceKind;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

const SELECT_CLASS =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";

export default function AdminPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [newKind, setNewKind] = useState<SourceKind>("worldnews");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editApiKey, setEditApiKey] = useState("");
  const [editKind, setEditKind] = useState<SourceKind>("worldnews");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");

  useEffect(() => {
    loadSources();
    loadCategories();
  }, []);

  async function loadSources() {
    try {
      const res = await fetch("/api/admin/sources");
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
        body: JSON.stringify({
          name: newName,
          baseUrl: newUrl,
          apiKey: newKind === "rss" ? "" : newApiKey,
          kind: newKind,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setNewName("");
      setNewUrl("");
      setNewApiKey("");
      setNewKind("worldnews");
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
        body: JSON.stringify({
          name: editName,
          baseUrl: editUrl,
          apiKey: editKind === "rss" ? "" : editApiKey,
          kind: editKind,
        }),
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

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setCatLoading(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCatError(data.error);
        return;
      }
      setNewCatName("");
      loadCategories();
    } catch {
      setCatError("Failed to create category");
    }
  }

  async function handleUpdateCategory(id: string) {
    setCatError("");
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCatName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCatError(data.error);
        return;
      }
      setEditingCatId(null);
      loadCategories();
    } catch {
      setCatError("Failed to update category");
    }
  }

  async function handleDeleteCategory(id: string) {
    setCatError("");
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      loadCategories();
    } catch {
      setCatError("Failed to delete category");
    }
  }

  return (
    <AppLayout title="Admin Panel">
      <Card padding="md" className="mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Add News Source
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              placeholder="Source name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Input
              type="url"
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as SourceKind)}
              className={SELECT_CLASS}
            >
              <option value="worldnews">WorldNewsAPI</option>
              <option value="rss">RSS</option>
            </select>
            {newKind === "worldnews" && (
              <Input
                type="text"
                placeholder="API Key (WorldNewsAPI)"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                required
              />
            )}
            <Button type="submit">Add source</Button>
          </div>
        </form>
      </Card>

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
              {editingId === source.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name"
                      autoFocus
                    />
                    <Input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="URL"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={editKind}
                      onChange={(e) => setEditKind(e.target.value as SourceKind)}
                      className={SELECT_CLASS}
                    >
                      <option value="worldnews">WorldNewsAPI</option>
                      <option value="rss">RSS</option>
                    </select>
                    {editKind === "worldnews" && (
                      <Input
                        type="text"
                        value={editApiKey}
                        onChange={(e) => setEditApiKey(e.target.value)}
                        placeholder="API Key"
                      />
                    )}
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
                </div>
              ) : (
                <>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      {source.name}
                      <Badge variant="neutral" size="sm" className="uppercase tracking-wider">
                        {source.kind === "rss" ? "RSS" : "WorldNews"}
                      </Badge>
                    </p>
                    <p className="text-xs text-slate-400">{source.baseUrl}</p>
                    <p className="font-mono text-xs text-slate-300">
                      {source.kind === "rss"
                        ? "No API key needed"
                        : source.apiKey
                          ? `${source.apiKey.slice(0, 8)}...`
                          : "No API key"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={source.active ? "positive" : "neutral"} size="sm">
                      {source.active ? "Active" : "Inactive"}
                    </Badge>
                    <IconButton
                      icon={<Icon name="edit" />}
                      appearance="subtle"
                      tone="neutral"
                      label="Edit source"
                      onClick={() => {
                        setEditingId(source.id);
                        setEditName(source.name);
                        setEditUrl(source.baseUrl);
                        setEditApiKey(source.apiKey);
                        setEditKind(source.kind);
                      }}
                    />
                    <IconButton
                      icon={<Icon name="trash" />}
                      appearance="subtle"
                      tone="red"
                      label="Delete source"
                      onClick={() => handleDelete(source.id)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <Card padding="md" className="mt-10 mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Default Categories
        </h2>
        <form onSubmit={handleCreateCategory} className="flex gap-3">
          <Input
            type="text"
            placeholder="New category name..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            required
          />
          <Button type="submit">Add</Button>
        </form>
      </Card>

      {catError && <p className="mb-4 text-sm text-red-500">{catError}</p>}

      {catLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No default categories"
          description="Add your first default category above."
        />
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-amber-200"
            >
              {editingCatId === cat.id ? (
                <div className="flex flex-1 items-center gap-3">
                  <Input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdateCategory(cat.id)}
                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCatId(null)}
                    className="text-sm text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <IconButton
                      icon={<Icon name="edit" />}
                      appearance="subtle"
                      tone="neutral"
                      label="Edit category"
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setEditCatName(cat.name);
                      }}
                    />
                    <IconButton
                      icon={<Icon name="trash" />}
                      appearance="subtle"
                      tone="red"
                      label="Delete category"
                      onClick={() => handleDeleteCategory(cat.id)}
                    />
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
