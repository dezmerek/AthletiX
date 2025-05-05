"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const t = useTranslations("NotFoundSection");
  const router = useRouter();

  return (
    <div className="relative min-h-[calc(100vh-68px)] flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_70%)] after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_bottom,rgba(45,212,191,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_70%)] dark:after:content-[''] dark:after:absolute dark:after:inset-0 dark:after:bg-[radial-gradient(ellipse_at_bottom,rgba(20,184,166,0.15),transparent_70%)]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl bg-emerald-500/10 dark:bg-emerald-950/30 dark:mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 translate-x-1/2 translate-y-1/2 rounded-full blur-3xl bg-teal-500/10 dark:bg-teal-950/30 dark:mix-blend-screen" />
        </div>
      </div>

      <div className="text-center relative z-10">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6">
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            404
          </span>
        </h1>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white/90 mb-4">
          {t("title")}
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300/90 mb-8 max-w-md mx-auto">
          {t("description")}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 cursor-pointer"
        >
          {t("button")}
        </button>
      </div>
    </div>
  );
} 