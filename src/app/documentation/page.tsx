"use client";

import { useTranslations } from "next-intl";

export default function DocumentationPage() {
  const t = useTranslations("documentation");

  return (
    <div className="relative min-h-screen py-20 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">{t("description")}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t("lastUpdated")}</p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
            Spis treści
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(t.raw("sections")).map(([key, section]) => {
              const typedSection = section as { title: string };
              return (
                <a
                  key={key}
                  href={`#${key}`}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span>{typedSection.title}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {Object.entries(t.raw("sections")).map(([key, section], index) => {
            const typedSection = section as {
              title: string;
              content: string;
              subsections?: Record<string, any>;
            };
            return (
              <div key={key} id={key} className="scroll-mt-20">
                <div className="py-4 border-l-2 border-emerald-500/20 dark:border-emerald-400/20 pl-6">
                  <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-white group">
                    <span className="relative">
                      <span className="text-emerald-500 dark:text-emerald-400 mr-2 font-mono">
                        {String(index + 1).padStart(2, "0")}.
                      </span>
                      {typedSection.title}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {typedSection.content}
                  </p>

                  {/* Subsections */}
                  {typedSection.subsections && (
                    <div className="space-y-8 mt-8">
                      {Object.entries(typedSection.subsections).map(([subKey, subsection]) => {
                        const typedSubsection = subsection as {
                          title: string;
                          content: string;
                          code?: string;
                          steps?: string[];
                          features?: string[];
                          tools?: string[];
                          measures?: string[];
                          options?: string[];
                          metrics?: string[];
                          example?: {
                            title: string;
                            code: string;
                          };
                        };

                        return (
                          <div key={subKey} className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">
                              {typedSubsection.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                              {typedSubsection.content}
                            </p>

                            {/* Code Block */}
                            {typedSubsection.code && (
                              <div className="mb-4">
                                <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg overflow-x-auto">
                                  <code>{typedSubsection.code}</code>
                                </pre>
                              </div>
                            )}

                            {/* Example with Code */}
                            {typedSubsection.example && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                  {typedSubsection.example.title}
                                </h4>
                                <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg overflow-x-auto">
                                  <code>{typedSubsection.example.code}</code>
                                </pre>
                              </div>
                            )}

                            {/* Lists */}
                            {(typedSubsection.steps || typedSubsection.features || typedSubsection.tools || typedSubsection.measures || typedSubsection.options || typedSubsection.metrics) && (
                              <ul className="space-y-2">
                                {(typedSubsection.steps || typedSubsection.features || typedSubsection.tools || typedSubsection.measures || typedSubsection.options || typedSubsection.metrics)?.map((item, idx) => (
                                  <li key={idx} className="flex items-start space-x-2 text-slate-600 dark:text-slate-300">
                                    <span className="text-emerald-500 dark:text-emerald-400 mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 