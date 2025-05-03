"use client";

import { useTranslations } from "next-intl";

export default function SecuritySection() {
  const t = useTranslations("SecuritySection");

  return (
    <section
      id="security"
      className="relative py-20 bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300"
    >
      {/* Background gradient overlay that stays in both modes */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-blue-500/[0.03] opacity-70"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            {t("title")}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl transition-all border border-slate-100 hover:border-cyan-100 dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:hover:border-cyan-900/50">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">
              {t("dataProtection.title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              {t("dataProtection.description")}
            </p>
          </div>

          <div className="p-6 rounded-xl transition-all border border-slate-100 hover:border-cyan-100 dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:hover:border-cyan-900/50">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">
              {t("dataAnalysis.title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              {t("dataAnalysis.description")}
            </p>
          </div>

          <div className="p-6 rounded-xl transition-all border border-slate-100 hover:border-cyan-100 dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:hover:border-cyan-900/50">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">
              {t("backup.title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              {t("backup.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
