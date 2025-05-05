"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "@/theme/ThemeToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<"pl" | "en" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = (sectionId: string) => {
    if (pathname === "/") {
      // Na stronie głównej - płynne przewijanie
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = 68; // Height of the fixed navigation
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navHeight,
          behavior: "smooth",
        });
      }
    } else {
      // Na podstronie - przekierowanie do strony głównej z hash
      router.push(`/?section=${sectionId}`);
    }
  };

  // Obsługa przewijania po przekierowaniu z podstrony
  useEffect(() => {
    if (pathname === "/") {
      const urlParams = new URLSearchParams(window.location.search);
      const sectionId = urlParams.get("section");
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          const navHeight = 68;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navHeight,
            behavior: "smooth",
          });
          // Usuń parametr z URL po przewinięciu
          window.history.replaceState({}, "", "/");
        }
      }
    }
  }, [pathname]);

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
      <div
        className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-[60] transition-opacity duration-500 flex items-center justify-center ${
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent whitespace-nowrap">
                AthletiX
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => handleNavigation("start")}
                  className="text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Start
                </button>
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 2 0 002 2z"
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>{t("forBusiness")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleNavigation("pricing")}
                  className="text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {t("pricing")}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
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
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {locale.toUpperCase()}
                  </span>
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
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div
        ref={menuRef}
        className={`fixed top-16 left-0 right-0 z-40 bg-white dark:bg-slate-900 shadow-lg transition-all duration-300 md:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 space-y-4">
            <button
              onClick={() => {
                handleNavigation("start");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            >
              Start
            </button>
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleNavigation("for-clients");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center space-x-2"
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
                className="w-full text-left px-4 py-2 text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center space-x-2"
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
                className="w-full text-left px-4 py-2 text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center space-x-2"
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
            <button
              onClick={() => {
                handleNavigation("pricing");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            >
              {t("pricing")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
