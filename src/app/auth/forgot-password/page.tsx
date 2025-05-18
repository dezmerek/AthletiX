"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const t = useTranslations("auth.forgotPassword");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      // TODO: Implement actual password reset logic here
      console.log("Password reset attempt for:", { email });
      // Symulacja sukcesu - usuń to przy implementacji prawdziwej logiki
      setSuccess(true);
    } catch {
      setError(t("error.emailNotFound"));
    }
  };

  return (
    <main className="flex flex-col min-h-[calc(100vh-68px)] items-center bg-white dark:bg-slate-900 justify-center px-4">
      <div className="max-w-md w-full space-y-8 -mt-50">
        <div>
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {t("description")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">
              {t("emailLabel")}
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 sm:text-sm dark:bg-slate-800/50 backdrop-blur-sm"
              placeholder={t("emailLabel")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {success && (
            <div className="text-emerald-500 text-sm text-center">
              {t("success.linkSent")}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer"
            >
              {t("resetButton")}
            </button>

            <Link
              href="/auth/login"
              className="block text-center text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
            >
              {t("backToLogin")}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
