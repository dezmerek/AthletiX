"use client";

import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

interface Props {
  locale: string;
  changeLanguage: (newLocale: string) => void;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export default function LanguageSelector({
  locale,
  changeLanguage,
  setIsMenuOpen,
}: Props) {
  const t = useTranslations("Navbar");

  return (
    <div className="relative group hidden md:block">
      <button className="flex items-center space-x-1 p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span className="text-sm font-medium">{locale.toUpperCase()}</span>
        <svg
          className="w-3 h-3 opacity-75"
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
      <div className="absolute right-0 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
        <div className="pt-2">
          <div className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => {
                changeLanguage("pl");
                setIsMenuOpen(false);
              }}
              className="w-full px-4 rounded-t-lg py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all whitespace-nowrap cursor-pointer flex items-center justify-between"
            >
              <span className="font-medium">Polski</span>
              {locale === "pl" && (
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                changeLanguage("en");
                setIsMenuOpen(false);
              }}
              className="w-full px-4 rounded-b-lg py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all whitespace-nowrap cursor-pointer flex items-center justify-between"
            >
              <span className="font-medium">English</span>
              {locale === "en" && (
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
