"use client";

import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("terms");

  const sections = t.raw("sections") as Record<string, { title: string; content: string }>;

  return (
    <div className="relative min-h-screen py-20 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300">{t("lastUpdated")}</p>
        </div>

        <div className="space-y-8">
          {Object.entries(sections).map(([key, section], index) => {
            const typedSection = section as { title: string; content: string };
            return (
              <div key={key} className="py-4 border-l-2 border-emerald-500/20 dark:border-emerald-400/20 pl-6">
                <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white group">
                  <span className="relative">
                    <span className="text-emerald-500 dark:text-emerald-400 mr-2 font-mono">{String(index + 1).padStart(2, '0')}.</span>
                    {typedSection.title}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {typedSection.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 