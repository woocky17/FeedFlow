"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ErrorText } from "@/components/atoms/error-text";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError(t("invalidCredentials"));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Email field */}
      <div className="group relative">
        <label
          htmlFor="email"
          className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-400 transition-colors group-focus-within:text-amber-600"
        >
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Password field */}
      <div className="group relative">
        <label
          htmlFor="password"
          className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-400 transition-colors group-focus-within:text-amber-600"
        >
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Forgot password - right aligned above button */}
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-slate-400 transition-colors hover:text-amber-600"
        >
          {t("forgotPassword")}
        </Link>
      </div>

      <ErrorText message={error} />

      {/* Submit button */}
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

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs text-slate-300 uppercase tracking-wider">{t("or")}</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-slate-500">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold text-amber-600 transition-colors hover:text-amber-700"
        >
          {t("createOne")}
        </Link>
      </p>
    </form>
  );
}
