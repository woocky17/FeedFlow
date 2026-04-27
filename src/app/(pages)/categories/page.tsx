"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/templates/app-layout";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { IconButton } from "@/components/atoms/icon-button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function CategoriasPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const url = isAdmin ? "/api/admin/categories" : "/api/categories";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setNewName("");
      loadCategories();
    } catch {
      setError("Failed to create category");
    }
  }

  async function handleUpdate(id: string, type: string) {
    setError("");
    try {
      const url = type === "default"
        ? `/api/admin/categories/${id}`
        : `/api/categories/${id}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setEditingId(null);
      loadCategories();
    } catch {
      setError("Failed to update category");
    }
  }

  async function handleDelete(id: string, type: string) {
    setError("");
    try {
      const url = type === "default"
        ? `/api/admin/categories/${id}`
        : `/api/categories/${id}`;
      await fetch(url, { method: "DELETE" });
      loadCategories();
    } catch {
      setError("Failed to delete category");
    }
  }

  function canEdit(cat: Category): boolean {
    if (cat.type === "default") return isAdmin;
    return true;
  }

  return (
    <AppLayout title="Categories">
      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <Input
          type="text"
          placeholder={isAdmin ? "New default category..." : "New category name..."}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <Button type="submit">Add</Button>
      </form>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category above."
        />
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-amber-200"
            >
              {editingId === cat.id ? (
                <div className="flex flex-1 items-center gap-3">
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(cat.id, cat.type)}
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
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                    <Badge variant={cat.type === "default" ? "neutral" : "amber"} size="sm">
                      {cat.type}
                    </Badge>
                  </div>
                  {canEdit(cat) && (
                    <div className="flex items-center gap-2">
                      <IconButton
                        icon={<Icon name="edit" />}
                        appearance="subtle"
                        tone="neutral"
                        label="Edit category"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                        }}
                      />
                      <IconButton
                        icon={<Icon name="trash" />}
                        appearance="subtle"
                        tone="red"
                        label="Delete category"
                        onClick={() => handleDelete(cat.id, cat.type)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
