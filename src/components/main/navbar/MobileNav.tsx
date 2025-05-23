"use client";

import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import type { IUser } from "@/models/User";

interface Props {
  handleNavigation: (sectionId: string) => void;
  handleAuth: (type: "login" | "register") => void;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  locale: string;
  changeLanguage: (newLocale: string) => void;
  user?: IUser;
  onLogout?: () => void;
}

export default function MobileNav({
  handleNavigation,
  handleAuth,
  setIsMenuOpen,
  locale,
  changeLanguage,
  user,
  onLogout,
}: Props) {
  const t = useTranslations("Navbar");
  return (
    <div className="relative max-h-[calc(100vh-4rem)] flex flex-col">
      {/* User info section */}
      {user && (
        <div className="flex-none sticky top-0 z-10">
          <div className="flex items-center gap-3 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800">
            <div className="shrink-0 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-medium text-lg">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-medium text-slate-900 dark:text-white truncate">
                {user.name}
              </div>
              <div className="text-sm text-slate-500 truncate">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {/* Navigation items */}
        <div className="space-y-2 p-4">
          {/* Start */}
          <button
            onClick={() => {
              handleNavigation("start");
              setIsMenuOpen(false);
            }}
            className="flex items-center w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors text-base cursor-pointer"
          >
            <svg
              className="w-5 h-5 mr-3"
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
            {t("start")}
          </button>
        </div>{" "}
        {/* Offer section */}
        <div className="p-4">
          <div className="mb-2 px-3">
            <span className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <svg
                className="w-4 h-4 mr-2"
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
              {t("offer")}
            </span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                handleNavigation("for-clients");
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5 mr-3"
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
              {t("forClients")}
            </button>

            <button
              onClick={() => {
                handleNavigation("for-professionals");
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {t("forProfessionals")}
            </button>

            <button
              onClick={() => {
                handleNavigation("for-business");
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5 mr-3"
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
              {t("forBusiness")}
            </button>
          </div>
        </div>{" "}
        {/* Additional links */}
        <div className="space-y-2 p-4">
          <button
            onClick={() => {
              handleNavigation("pricing");
              setIsMenuOpen(false);
            }}
            className="flex items-center w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors text-base cursor-pointer"
          >
            <svg
              className="w-5 h-5 mr-3"
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
            {t("pricing")}
          </button>
        </div>{" "}
        {/* Language selector */}
        <div className="p-4">
          <div className="mb-2 px-3">
            <span className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <svg
                className="w-4 h-4 mr-2"
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
              {t("language")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                changeLanguage("en");
                setIsMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                locale === "en"
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span>{t("english")}</span>
              <span
                className={`text-xs ${
                  locale === "en" ? "" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {t("en")}
              </span>
            </button>

            <button
              onClick={() => {
                changeLanguage("pl");
                setIsMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                locale === "pl"
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span>{t("polish")}</span>
              <span
                className={`text-xs ${
                  locale === "pl" ? "" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {t("pl")}
              </span>
            </button>
          </div>
        </div>
      </div>{" "}
      {/* Bottom section with auth/user actions - sticky */}{" "}
      <div className="flex-none sticky bottom-0 z-10">
        <div className="p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-100 dark:border-slate-800">
          {user ? (
            <div className="space-y-2">
              {" "}
              <button
                onClick={() => {
                  handleNavigation("dashboard");
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                {t("dashboard")}
              </button>
              <button
                onClick={() => {
                  // TODO: Add settings navigation
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {t("settings")}
              </button>
              <button
                onClick={() => {
                  if (onLogout) {
                    onLogout();
                    setIsMenuOpen(false);
                  }
                }}
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {t("logout")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleAuth("login");
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center w-full px-4 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t("signIn")}
              </button>

              <button
                onClick={() => {
                  handleAuth("register");
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center w-full px-4 py-2 text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-colors"
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
          )}
        </div>
      </div>
    </div>
  );
}
