"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("auth.login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("error"));
        return;
      }

      // Handle successful login
      startTransition(() => {
        router.replace("/dashboard");
        router.refresh();
      });
    } catch (error) {
      console.error("Login error:", error);
      setError(t("error"));
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
            {t("noAccount")}{" "}
            <Link
              href="/auth/register"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              {t("createAccountLink")}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
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

            <div>
              <label htmlFor="password" className="sr-only">
                {t("passwordLabel")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 sm:text-sm dark:bg-slate-800/50 backdrop-blur-sm mt-4"
                placeholder={t("passwordLabel")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              >
                {t("forgotPassword")}
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? t("signingIn") : t("signIn")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
