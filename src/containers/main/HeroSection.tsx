"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const t = useTranslations("HeroSection");
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
      id="start"
      className={`relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden ${
        currentTheme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
          : "bg-gradient-to-br from-emerald-50 via-white to-teal-50"
      } transition-colors duration-300`}
    >
      {/* Main background with gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 ${
            currentTheme === "dark"
              ? "bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_70%)] after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_bottom,rgba(20,184,166,0.15),transparent_70%)] before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(to_right,rgba(16,185,129,0.05),rgba(20,184,166,0.05))]"
              : "bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_70%)] after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_bottom,rgba(45,212,191,0.15),transparent_70%)]"
          }`}
        >
          {/* Glowing points */}
          <div
            className={`absolute top-1/4 left-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
              currentTheme === "dark"
                ? "bg-emerald-950/30 mix-blend-screen"
                : "bg-emerald-500/10"
            }`}
          />
          <div
            className={`absolute bottom-1/4 right-1/4 w-96 h-96 translate-x-1/2 translate-y-1/2 rounded-full blur-3xl ${
              currentTheme === "dark"
                ? "bg-teal-950/30 mix-blend-screen"
                : "bg-teal-500/10"
            }`}
          />

          {/* Additional subtle gradient overlay */}
          <div
            className={`absolute inset-0 ${
              currentTheme === "dark"
                ? "bg-gradient-to-br from-emerald-950/20 via-transparent to-teal-950/20 mix-blend-soft-light"
                : ""
            }`}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative">
        <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
          {t("welcome")}
        </span>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          <span
            className={`bg-gradient-to-r ${
              currentTheme === "dark"
                ? "from-emerald-400 to-teal-400"
                : "from-emerald-600 to-teal-600"
            } bg-clip-text text-transparent inline-block transform hover:scale-[1.02] transition-transform duration-300`}
          >
            {t("digitalTransformation")}
          </span>
          <br />
          <span
            className={`${
              currentTheme === "dark" ? "text-white/90" : "text-slate-800"
            } inline-block mt-2`}
          >
            {t("fitnessIndustry")}
          </span>
        </h1>
        <p
          className={`text-xl sm:text-2xl mb-16 max-w-3xl mx-auto ${
            currentTheme === "dark" ? "text-slate-300/90" : "text-slate-600"
          } leading-relaxed`}
        >
          {t("description")}
        </p>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div
            className={`group rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${
              currentTheme === "dark"
                ? "bg-slate-800/50 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700/50"
                : "bg-white hover:bg-white/80 backdrop-blur-sm border border-slate-100"
            }`}
          >
            <div className="text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              👥
            </div>
            <h3
              className={`font-bold mb-2 text-lg ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("forClients.title")}
            </h3>
            <p
              className={`text-sm sm:text-base ${
                currentTheme === "dark" ? "text-slate-300/90" : "text-slate-600"
              }`}
            >
              {t("forClients.description")}
            </p>
          </div>

          <div
            className={`group rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${
              currentTheme === "dark"
                ? "bg-slate-800/50 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700/50"
                : "bg-white hover:bg-white/80 backdrop-blur-sm border border-slate-100"
            }`}
          >
            <div className="text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              👨‍🏫
            </div>
            <h3
              className={`font-bold mb-2 text-lg ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("forProfessionals.title")}
            </h3>
            <p
              className={`text-sm sm:text-base ${
                currentTheme === "dark" ? "text-slate-300/90" : "text-slate-600"
              }`}
            >
              {t("forProfessionals.description")}
            </p>
          </div>

          <div
            className={`group rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${
              currentTheme === "dark"
                ? "bg-slate-800/50 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700/50"
                : "bg-white hover:bg-white/80 backdrop-blur-sm border border-slate-100"
            }`}
          >
            <div className="text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              💼
            </div>
            <h3
              className={`font-bold mb-2 text-lg ${
                currentTheme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {t("forBusiness.title")}
            </h3>
            <p
              className={`text-sm sm:text-base ${
                currentTheme === "dark" ? "text-slate-300/90" : "text-slate-600"
              }`}
            >
              {t("forBusiness.description")}
            </p>
          </div>
        </div>
      </div>
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce ${
          currentTheme === "dark" ? "text-white/80" : "text-slate-600"
        }`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
