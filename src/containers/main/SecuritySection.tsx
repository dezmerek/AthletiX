"use client";

import { useTranslations } from "next-intl";

export default function SecuritySection() {
  const t = useTranslations("SecuritySection");

  return (
    <section id="security" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            {t("title")}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-slate-100 hover:border-cyan-100 transition-colors">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              {t("dataProtection.title")}
            </h3>
            <p className="text-slate-600">{t("dataProtection.description")}</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-100 hover:border-cyan-100 transition-colors">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              {t("dataAnalysis.title")}
            </h3>
            <p className="text-slate-600">{t("dataAnalysis.description")}</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-100 hover:border-cyan-100 transition-colors">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              {t("backup.title")}
            </h3>
            <p className="text-slate-600">{t("backup.description")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
