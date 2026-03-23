"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorText } from "@/components/atoms/error-text";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Email */}
      <div className="group relative">
        <label
          htmlFor="reg-email"
          className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-400 transition-colors group-focus-within:text-amber-600"
        >
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Password */}
      <div className="group relative">
        <label
          htmlFor="reg-password"
          className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-400 transition-colors group-focus-within:text-amber-600"
        >
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Confirm password */}
      <div className="group relative">
        <label
          htmlFor="reg-confirm"
          className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-400 transition-colors group-focus-within:text-amber-600"
        >
          Confirm password
        </label>
        <input
          id="reg-confirm"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      <ErrorText message={error} />

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
            Creating account...
          </span>
        ) : (
          "Create account"
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs text-slate-300 uppercase tracking-wider">or</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-600 transition-colors hover:text-amber-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
