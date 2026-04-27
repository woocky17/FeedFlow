"use client";

import { useState } from "react";
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
  placeholder = "New category name...",
  onSuccess,
}: CategoryFormProps) {
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
        setError(data.error || "Failed to create category");
        return;
      }
      setName("");
      onSuccess?.();
    } catch {
      setError("Failed to create category");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          placeholder={placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" isLoading={submitting}>
          Add
        </Button>
      </form>
      <ErrorText message={error} className="mt-2" />
    </div>
  );
}
