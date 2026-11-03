"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/templates/app-layout";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { IconButton } from "@/components/atoms/icon-button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { Card } from "@/components/atoms/card";
import { ErrorText } from "@/components/atoms/error-text";
import { EmptyState } from "@/components/molecules/empty-state";
import { EntityRow } from "@/components/molecules/entity-row";
import { CategoryForm } from "@/components/organisms/category-form";
import { SourceForm } from "@/components/organisms/source-form";

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

export default function AdminPage() {
  const t = useTranslations("admin");
  const ts = useTranslations("sources");
  const tcat = useTranslations("categories");
  const tc = useTranslations("common");
  const [sources, setSources] = useState<Source[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editApiKey, setEditApiKey] = useState("");
  const [editKind, setEditKind] = useState<SourceKind>("worldnews");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
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
      setError(t("updateSourceFailed"));
    }
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
      loadSources();
    } catch {
      setError(t("deleteSourceFailed"));
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
      setCatError(tcat("updateFailed"));
    }
  }

  async function handleDeleteCategory(id: string) {
    setCatError("");
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      loadCategories();
    } catch {
      setCatError(tcat("deleteFailed"));
    }
  }

  return (
    <AppLayout title={t("title")}>
      <Card padding="md" className="mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t("addSourceTitle")}
        </h2>
        <SourceForm submitLabel={t("addSourceSubmit")} onSuccess={loadSources} />
      </Card>

      <ErrorText message={error} className="mb-4" />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : sources.length === 0 ? (
        <EmptyState
          title={ts("noSourcesTitle")}
          description={ts("noSourcesDescription")}
        />
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <EntityRow key={source.id}>
              {editingId === source.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={t("namePlaceholder")}
                      autoFocus
                    />
                    <Input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder={t("urlPlaceholder")}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={editKind}
                      onChange={(e) => setEditKind(e.target.value as SourceKind)}
                    >
                      <option value="worldnews">WorldNewsAPI</option>
                      <option value="rss">RSS</option>
                    </Select>
                    {editKind === "worldnews" && (
                      <Input
                        type="text"
                        value={editApiKey}
                        onChange={(e) => setEditApiKey(e.target.value)}
                        placeholder={ts("form.apiKeyPlaceholder")}
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost-amber"
                      onClick={() => handleUpdate(source.id)}
                    >
                      {tc("save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      {tc("cancel")}
                    </Button>
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
                        ? t("noApiKeyNeeded")
                        : source.apiKey
                          ? `${source.apiKey.slice(0, 8)}...`
                          : t("noApiKey")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={source.active ? "positive" : "neutral"} size="sm">
                      {source.active ? t("active") : t("inactive")}
                    </Badge>
                    <IconButton
                      icon={<Icon name="edit" />}
                      appearance="subtle"
                      tone="neutral"
                      label={ts("editLabel")}
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
                      label={ts("deleteLabel")}
                      onClick={() => handleDelete(source.id)}
                    />
                  </div>
                </>
              )}
            </EntityRow>
          ))}
        </div>
      )}

      <Card padding="md" className="mt-10 mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t("defaultCategoriesTitle")}
        </h2>
        <CategoryForm
          endpoint="/api/admin/categories"
          onSuccess={loadCategories}
        />
      </Card>

      <ErrorText message={catError} className="mb-4" />

      {catLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title={t("noDefaultCategoriesTitle")}
          description={t("noDefaultCategoriesDescription")}
        />
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <EntityRow key={cat.id}>
              {editingCatId === cat.id ? (
                <div className="flex flex-1 items-center gap-3">
                  <Input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost-amber"
                    onClick={() => handleUpdateCategory(cat.id)}
                  >
                    {tc("save")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingCatId(null)}
                  >
                    {tc("cancel")}
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <IconButton
                      icon={<Icon name="edit" />}
                      appearance="subtle"
                      tone="neutral"
                      label={tcat("editLabel")}
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setEditCatName(cat.name);
                      }}
                    />
                    <IconButton
                      icon={<Icon name="trash" />}
                      appearance="subtle"
                      tone="red"
                      label={tcat("deleteLabel")}
                      onClick={() => handleDeleteCategory(cat.id)}
                    />
                  </div>
                </>
              )}
            </EntityRow>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
