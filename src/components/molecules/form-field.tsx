"use client";

import { Label } from "@/components/atoms/label";
import { Input } from "@/components/atoms/input";
import { ErrorText } from "@/components/atoms/error-text";
import { InputHTMLAttributes } from "react";

type FormFieldProps = {
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input hasError={!!error} {...inputProps} />
      <ErrorText message={error} />
    </div>
  );
}
