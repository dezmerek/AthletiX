"use client";

import { useTranslations } from "next-intl";

export default function FAQPage() {
  const t = useTranslations("faq");

  const sections = t.raw("sections") as Record<
    string,
    { question: string; answer: string }
  >;

  return (
    <div className="relative min-h-screen py-20 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t("description")}
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(sections).map(([key, section], index) => {
            const typedSection = section as {
              question: string;
              answer: string;
            };
            return (
              <div
                key={key}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">
                  <span className="text-emerald-500 dark:text-emerald-400 mr-2 font-mono">
                    {String(index + 1).padStart(2, "0")}.
                  </span>
                  {typedSection.question}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {typedSection.answer}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
