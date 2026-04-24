"use client";

import { ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  type: ToastType;
  children: ReactNode;
}

const styles: Record<ToastType, string> = {
  success: "bg-emerald-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-slate-700 text-white",
};

export function Toast({ type, children }: ToastProps) {
  return (
    <div
      role="status"
      className={`rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${styles[type]}`}
    >
      {children}
    </div>
  );
}
