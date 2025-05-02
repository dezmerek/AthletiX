"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function CommunicationSection() {
  const t = useTranslations("CommunicationSection");
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show theme UI after hydration to prevent flash
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
      id="communication"
      className={`py-20 ${
        currentTheme === "dark"
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 to-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            {t("badge")}
          </span>
          <h2 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={`p-6 rounded-xl ${
              currentTheme === "dark"
                ? "bg-slate-800/50 shadow-lg hover:shadow-indigo-500/10"
                : "bg-white shadow-sm hover:shadow-md"
            } transition-all`}
          >
            <div className="text-3xl mb-4">💬</div>
            <h4
              className={`font-bold mb-2 ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("features.chat.title")}
            </h4>
            <p
              className={`text-sm ${
                currentTheme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {t("features.chat.description")}
            </p>
          </div>
          <div
            className={`p-6 rounded-xl ${
              currentTheme === "dark"
                ? "bg-slate-800/50 shadow-lg hover:shadow-indigo-500/10"
                : "bg-white shadow-sm hover:shadow-md"
            } transition-all`}
          >
            <div className="text-3xl mb-4">📅</div>
            <h4
              className={`font-bold mb-2 ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("features.calendar.title")}
            </h4>
            <p
              className={`text-sm ${
                currentTheme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {t("features.calendar.description")}
            </p>
          </div>
          <div
            className={`p-6 rounded-xl ${
              currentTheme === "dark"
                ? "bg-slate-800/50 shadow-lg hover:shadow-indigo-500/10"
                : "bg-white shadow-sm hover:shadow-md"
            } transition-all`}
          >
            <div className="text-3xl mb-4">📝</div>
            <h4
              className={`font-bold mb-2 ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("features.notes.title")}
            </h4>
            <p
              className={`text-sm ${
                currentTheme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {t("features.notes.description")}
            </p>
          </div>
          <div
            className={`p-6 rounded-xl ${
              currentTheme === "dark"
                ? "bg-slate-800/50 shadow-lg hover:shadow-indigo-500/10"
                : "bg-white shadow-sm hover:shadow-md"
            } transition-all`}
          >
            <div className="text-3xl mb-4">📊</div>
            <h4
              className={`font-bold mb-2 ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("features.reports.title")}
            </h4>
            <p
              className={`text-sm ${
                currentTheme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {t("features.reports.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
