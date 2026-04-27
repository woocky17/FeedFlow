"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    await fetch("/api/auth/recover-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setIsLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Success icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("successMessage")}
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
        >
          {t("backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-slate-400 -mt-2 mb-1">
        {t("intro")}
      </p>

      {/* Email */}
      <div className="group relative">
        <label
          htmlFor="recover-email"
          className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-400 transition-colors group-focus-within:text-amber-600"
        >
          {t("email")}
        </label>
        <input
          id="recover-email"
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("submitting")}
          </span>
        ) : (
          t("submit")
        )}
      </button>

      {/* Back link */}
      <Link
        href="/login"
        className="text-center text-sm text-slate-400 transition-colors hover:text-amber-600"
      >
        {t("backToSignIn")}
      </Link>
    </form>
  );
}
