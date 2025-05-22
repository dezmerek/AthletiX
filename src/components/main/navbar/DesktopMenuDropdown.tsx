"use client";

import { useTranslations } from "next-intl";

interface Props {
  handleNavigation: (sectionId: string) => void;
}

export default function DesktopMenuDropdown({ handleNavigation }: Props) {
  const t = useTranslations("Navbar");

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer">
        <span>{t("offer")}</span>
        <svg
          className="w-4 h-4 transition-transform group-hover:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div className="absolute left-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
        <div className="pt-2">
          <div className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => handleNavigation("for-clients")}
              className="w-full px-4 py-2.5 text-left rounded-t-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2"
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
                  d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
                />
              </svg>
              <span>{t("forClients")}</span>
            </button>
            <button
              onClick={() => handleNavigation("for-professionals")}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2"
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
                  d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
                />
              </svg>
              <span>{t("forProfessionals")}</span>
            </button>
            <button
              onClick={() => handleNavigation("for-business")}
              className="w-full px-4 py-2.5 rounded-b-lg text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2"
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
                  d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"
                />
              </svg>
              <span>{t("forBusiness")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
