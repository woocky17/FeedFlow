"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ErrorText } from "@/components/atoms/error-text";

interface CategoryFormProps {
  endpoint: string;
  placeholder?: string;
  onSuccess?: () => void;
}

export function CategoryForm({
  endpoint,
  placeholder,
  onSuccess,
}: CategoryFormProps) {
  const t = useTranslations("categories");
  const tc = useTranslations("common");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("createFailed"));
        return;
      }
      setName("");
      onSuccess?.();
    } catch {
      setError(t("createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          placeholder={placeholder ?? t("newCustomPlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" isLoading={submitting}>
          {tc("add")}
        </Button>
      </form>
      <ErrorText message={error} className="mt-2" />
    </div>
  );
}
