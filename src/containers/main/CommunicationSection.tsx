"use client";

import { useTranslations } from "next-intl";

export default function CommunicationSection() {
  const t = useTranslations("CommunicationSection");

  return (
    <section
      id="communication"
      className="py-20 bg-gradient-to-br from-slate-50 to-white"
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
          <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-4">💬</div>
            <h4 className="text-slate-800 font-bold mb-2">
              {t("features.chat.title")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("features.chat.description")}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-4">📅</div>
            <h4 className="text-slate-800 font-bold mb-2">
              {t("features.calendar.title")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("features.calendar.description")}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-4">📝</div>
            <h4 className="text-slate-800 font-bold mb-2">
              {t("features.notes.title")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("features.notes.description")}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-4">📊</div>
            <h4 className="text-slate-800 font-bold mb-2">
              {t("features.reports.title")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("features.reports.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
