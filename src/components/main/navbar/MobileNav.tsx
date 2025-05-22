"use client";

import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

interface Props {
  handleNavigation: (sectionId: string) => void;
  handleAuth: (type: "login" | "register") => void;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  locale: string;
  changeLanguage: (newLocale: string) => void;
}

export default function MobileNav({
  handleNavigation,
  handleAuth,
  setIsMenuOpen,
  locale,
  changeLanguage,
}: Props) {
  const t = useTranslations("Navbar");

  return (
    <div className="flex flex-col py-6 px-6 space-y-6">
      <button
        onClick={() => handleNavigation("start")}
        className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-left text-base font-medium cursor-pointer"
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span>{t("start")}</span>
      </button>

      <div className="space-y-4">
        <span className="flex items-center space-x-3 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs font-medium">
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
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
          <span>{t("offer")}</span>
        </span>
        <div className="flex flex-col space-y-4 pl-8">
          <button
            onClick={() => {
              handleNavigation("for-clients");
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{t("forClients")}</span>
          </button>
          <button
            onClick={() => {
              handleNavigation("for-professionals");
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 2 0 002 2z"
              />
            </svg>
            <span>{t("forProfessionals")}</span>
          </button>
          <button
            onClick={() => {
              handleNavigation("for-business");
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>{t("forBusiness")}</span>
          </button>
        </div>
        <div className="flex flex-col">
          <button
            onClick={() => {
              handleNavigation("pricing");
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-left text-base font-medium cursor-pointer"
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{t("pricing")}</span>
          </button>
        </div>

        {/* Language Selector */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center space-x-3 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs font-medium">
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
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            <span>{t("language")}</span>
          </span>
          <div className="flex flex-col space-y-4 pl-8">
            <button
              onClick={() => {
                changeLanguage("en");
                setIsMenuOpen(false);
              }}
              className={`flex items-center justify-between ${
                locale === "en"
                  ? "text-emerald-500"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400"
              } transition-all w-full cursor-pointer`}
            >
              <div className="flex items-center space-x-3">
                <span>{t("english")}</span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {t("en")}
              </span>
            </button>
            <button
              onClick={() => {
                changeLanguage("pl");
                setIsMenuOpen(false);
              }}
              className={`flex items-center justify-between ${
                locale === "pl"
                  ? "text-emerald-500"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400"
              } transition-all w-full cursor-pointer`}
            >
              <div className="flex items-center space-x-3">
                <span>{t("polish")}</span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {t("pl")}
              </span>
            </button>
          </div>
        </div>

        {/* Auth buttons */}
        <div className="flex flex-col space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              handleAuth("login");
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-left text-base font-medium cursor-pointer"
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span>{t("signIn")}</span>
          </button>
          <button
            onClick={() => {
              handleAuth("register");
              setIsMenuOpen(false);
            }}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-medium hover:from-emerald-600 hover:to-teal-600 transition-all whitespace-nowrap cursor-pointer"
          >
            <span>{t("getStarted")}</span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
