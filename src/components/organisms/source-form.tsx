"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { ErrorText } from "@/components/atoms/error-text";

type SourceKind = "worldnews" | "rss";

interface SourceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function SourceForm({ onSuccess, onCancel, submitLabel }: SourceFormProps) {
  const t = useTranslations("sources.form");
  const tc = useTranslations("common");
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [kind, setKind] = useState<SourceKind>("worldnews");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
        setError(data.error || t("addFailed"));
        return;
      }
      setName("");
      setBaseUrl("");
      setApiKey("");
      setKind("worldnews");
      onSuccess?.();
    } catch {
      setError(t("addFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="text"
        placeholder={t("namePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        type="url"
        placeholder={t("baseUrlPlaceholder")}
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        required
      />
      <Select value={kind} onChange={(e) => setKind(e.target.value as SourceKind)}>
        <option value="worldnews">WorldNewsAPI</option>
        <option value="rss">{t("kindRss")}</option>
      </Select>
      {kind === "worldnews" && (
        <Input
          type="text"
          placeholder={t("apiKeyPlaceholder")}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
        />
      )}
      <ErrorText message={error} />
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" isLoading={submitting}>
          {submitLabel ?? tc("add")}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tc("cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
