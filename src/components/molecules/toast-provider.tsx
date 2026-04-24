"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Toast, ToastType } from "./toast";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== latest.id));
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [toasts]);

  const value: ToastContextValue = {
    show,
    success: (message) => show("success", message),
    error: (message) => show("error", message),
    info: (message) => show("info", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-20 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} type={t.type}>
            {t.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
