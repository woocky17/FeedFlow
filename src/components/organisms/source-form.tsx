"use client";

import { useState } from "react";
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

export function SourceForm({ onSuccess, onCancel, submitLabel = "Add" }: SourceFormProps) {
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
        setError(data.error || "Failed to add source");
        return;
      }
      setName("");
      setBaseUrl("");
      setApiKey("");
      setKind("worldnews");
      onSuccess?.();
    } catch {
      setError("Failed to add source");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
      <Select value={kind} onChange={(e) => setKind(e.target.value as SourceKind)}>
        <option value="worldnews">WorldNewsAPI</option>
        <option value="rss">RSS / Atom feed</option>
      </Select>
      {kind === "worldnews" && (
        <Input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
        />
      )}
      <ErrorText message={error} />
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" isLoading={submitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
