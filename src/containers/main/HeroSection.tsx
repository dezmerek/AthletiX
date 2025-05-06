"use client";

import { useTranslations } from "next-intl";

export default function HeroSection() {
  const t = useTranslations("HeroSection");

  return (
    <section
      id="start"
      className="relative max-lg:mt-8 lg:min-h-screen flex flex-col justify-start md:justify-center px-4 sm:px-6 lg:px-8 pt-24 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300"
    >
      {/* Main background with gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_70%)] after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_bottom,rgba(45,212,191,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_70%)] dark:after:content-[''] dark:after:absolute dark:after:inset-0 dark:after:bg-[radial-gradient(ellipse_at_bottom,rgba(20,184,166,0.15),transparent_70%)] dark:before:content-[''] dark:before:absolute dark:before:inset-0 dark:before:bg-[linear-gradient(to_right,rgba(16,185,129,0.05),rgba(20,184,166,0.05))]">
          {/* Glowing points */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl bg-emerald-500/10 dark:bg-emerald-950/30 dark:mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 translate-x-1/2 translate-y-1/2 rounded-full blur-3xl bg-teal-500/10 dark:bg-teal-950/30 dark:mix-blend-screen" />

          {/* Additional subtle gradient overlay */}
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-emerald-950/20 dark:via-transparent dark:to-teal-950/20 dark:mix-blend-soft-light" />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto text-center relative">
        <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
          {t("welcome")}
        </span>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent inline-block transform hover:scale-[1.02] transition-transform duration-300">
            {t("digitalTransformation")}
          </span>
          <br />
          <span className="text-slate-800 dark:text-white/90 inline-block mt-2">
            {t("fitnessIndustry")}
          </span>
        </h1>
        <p className="text-xl sm:text-2xl mb-16 max-w-3xl mx-auto text-slate-600 dark:text-slate-300/90 leading-relaxed">
          {t("description")}
        </p>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* For Clients Card */}
          <div className="group rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700/50">
            <div className="text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              👥
            </div>
            <h3 className="font-bold mb-2 text-lg text-slate-800 dark:text-white">
              {t("forClients.title")}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300/90">
              {t("forClients.description")}
            </p>
          </div>

          {/* For Professionals Card */}
          <div className="group rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700/50">
            <div className="text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              👨‍🏫
            </div>
            <h3 className="font-bold mb-2 text-lg text-slate-800 dark:text-white">
              {t("forProfessionals.title")}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300/90">
              {t("forProfessionals.description")}
            </p>
          </div>

          {/* For Business Card */}
          <div className="group rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700/50">
            <div className="text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              💼
            </div>
            <h3 className="font-bold mb-2 text-lg text-slate-800 dark:text-white">
              {t("forBusiness.title")}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300/90">
              {t("forBusiness.description")}
            </p>
          </div>
        </div>

        <div className="my-8 text-slate-600 dark:text-white/80 animate-bounce">
          <svg
            className="w-6 h-6 mx-auto"
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
      </div>
    </section>
  );
}
