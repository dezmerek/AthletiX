"use client";

import { useTranslations } from "next-intl";

export default function ProfessionalSection() {
  const t = useTranslations("ProfessionalSection");

  return (
    <section
      id="for-professionals"
      className="py-20 bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-950 dark:to-blue-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-white/10 dark:bg-white/5 backdrop-blur-md text-white dark:text-cyan-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            {t("badge")}
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">{t("title")}</h2>
          <p className="text-cyan-100 dark:text-cyan-300 text-xl max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Main Professional Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Trainer Tools */}
          <div className="backdrop-blur-md rounded-xl p-8 border bg-white/10 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50">
            <div className="text-3xl mb-4">👨‍🏫</div>
            <h3 className="text-2xl font-bold text-white mb-6">
              {t("trainer.title")}
            </h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-cyan-200 dark:text-cyan-400 font-bold mb-3">
                  {t("trainer.clientManagement.title")}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("trainer.clientManagement.profiles")}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("trainer.clientManagement.trainingPlans")}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("trainer.clientManagement.progressMonitoring")}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-200 dark:text-cyan-400 font-bold mb-3">
                  {t("trainer.trainingTools.title")}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("trainer.trainingTools.exerciseLibrary")}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("trainer.trainingTools.calculators")}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("trainer.trainingTools.techniqueAnalysis")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dietitian Tools */}
          <div className="backdrop-blur-md rounded-xl p-8 border bg-white/10 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50">
            <div className="text-3xl mb-4">👩‍⚕️</div>
            <h3 className="text-2xl font-bold text-white mb-6">
              {t("dietitian.title")}
            </h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-cyan-200 dark:text-cyan-400 font-bold mb-3">
                  {t("dietitian.dietManagement.title")}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("dietitian.dietManagement.mealPlans")}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("dietitian.dietManagement.calculators")}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("dietitian.dietManagement.foodDatabase")}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-200 dark:text-cyan-400 font-bold mb-3">
                  {t("dietitian.progressMonitoring.title")}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("dietitian.progressMonitoring.dietAnalysis")}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("dietitian.progressMonitoring.foodDiaries")}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 dark:text-cyan-400 mt-1">
                      ✓
                    </span>
                    <span className="text-white/90 dark:text-slate-200">
                      {t("dietitian.progressMonitoring.reports")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Professional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="backdrop-blur-md rounded-xl p-6 border bg-white/5 dark:bg-slate-800/30 border-white/10 dark:border-slate-700/30 hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors">
            <div className="text-3xl mb-4">📊</div>
            <h4 className="text-lg font-bold text-white mb-2">
              {t("additionalFeatures.analytics.title")}
            </h4>
            <p className="text-cyan-100 dark:text-cyan-300">
              {t("additionalFeatures.analytics.description")}
            </p>
          </div>
          <div className="backdrop-blur-md rounded-xl p-6 border bg-white/5 dark:bg-slate-800/30 border-white/10 dark:border-slate-700/30 hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors">
            <div className="text-3xl mb-4">💬</div>
            <h4 className="text-lg font-bold text-white mb-2">
              {t("additionalFeatures.communication.title")}
            </h4>
            <p className="text-cyan-100 dark:text-cyan-300">
              {t("additionalFeatures.communication.description")}
            </p>
          </div>
          <div className="backdrop-blur-md rounded-xl p-6 border bg-white/5 dark:bg-slate-800/30 border-white/10 dark:border-slate-700/30 hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors">
            <div className="text-3xl mb-4">📈</div>
            <h4 className="text-lg font-bold text-white mb-2">
              {t("additionalFeatures.businessGrowth.title")}
            </h4>
            <p className="text-cyan-100 dark:text-cyan-300">
              {t("additionalFeatures.businessGrowth.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
