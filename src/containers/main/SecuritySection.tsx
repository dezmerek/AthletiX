"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SecuritySection() {
  const t = useTranslations("SecuritySection");
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current theme, considering system preference
  const currentTheme = !mounted
    ? "light"
    : theme === "system"
    ? systemTheme
    : theme;

  return (
    <section
      id="security"
      className={`relative py-20 ${
        currentTheme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
          : "bg-white"
      } transition-colors duration-300`}
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
          <div
            className={`p-6 rounded-xl transition-all ${
              currentTheme === "dark"
                ? "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-900/50"
                : "border border-slate-100 hover:border-cyan-100"
            }`}
          >
            <div className="text-3xl mb-4">🔒</div>
            <h3
              className={`text-xl font-bold mb-3 ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("dataProtection.title")}
            </h3>
            <p
              className={
                currentTheme === "dark" ? "text-slate-300" : "text-slate-600"
              }
            >
              {t("dataProtection.description")}
            </p>
          </div>

          <div
            className={`p-6 rounded-xl transition-all ${
              currentTheme === "dark"
                ? "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-900/50"
                : "border border-slate-100 hover:border-cyan-100"
            }`}
          >
            <div className="text-3xl mb-4">📊</div>
            <h3
              className={`text-xl font-bold mb-3 ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("dataAnalysis.title")}
            </h3>
            <p
              className={
                currentTheme === "dark" ? "text-slate-300" : "text-slate-600"
              }
            >
              {t("dataAnalysis.description")}
            </p>
          </div>

          <div
            className={`p-6 rounded-xl transition-all ${
              currentTheme === "dark"
                ? "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-900/50"
                : "border border-slate-100 hover:border-cyan-100"
            }`}
          >
            <div className="text-3xl mb-4">💾</div>
            <h3
              className={`text-xl font-bold mb-3 ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("backup.title")}
            </h3>
            <p
              className={
                currentTheme === "dark" ? "text-slate-300" : "text-slate-600"
              }
            >
              {t("backup.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
