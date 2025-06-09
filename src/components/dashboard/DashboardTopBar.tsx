"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import ThemeToggle from "@/theme/ThemeToggle";
import LanguageSelector from "@/components/main/navbar/LanguageSelector";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";

export default function DashboardTopBar() {
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<"pl" | "en" | null>(
    null
  );
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Navbar");

  const changeLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    setIsChangingLanguage(true);
    setTargetLanguage(newLocale as "pl" | "en");
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setTimeout(() => {
      router.refresh();
      setTimeout(() => {
        setIsChangingLanguage(false);
        setTargetLanguage(null);
      }, 500);
    }, 300);
  };

  return (
    <>
      {/* Language change overlay */}
      <div
        className={`fixed inset-0 backdrop-blur-sm z-[60] transition-opacity duration-500 flex items-center justify-center ${
          isChangingLanguage ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {targetLanguage && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
              <svg
                className="w-5 h-5 mr-2 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="font-medium">
                {t("changingTo")}{" "}
                {targetLanguage === "pl" ? t("polish") : t("english")}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 h-[68px]">
        <div className="flex items-center justify-end h-full">
          {" "}
          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />{" "}
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>{" "}
              {/* Notification Dropdown */}
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onUnreadCountChange={setUnreadNotificationsCount}
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <LanguageSelector
              locale={locale}
              changeLanguage={changeLanguage}
              setIsMenuOpen={() => {}}
            />
          </div>
        </div>
      </div>
    </>
  );
}
