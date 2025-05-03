"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/theme/ThemeToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<"pl" | "en" | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 68; // Height of the fixed navigation
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth",
      });
    }
  };

  const changeLanguage = (newLocale: string) => {
    // Don't change if it's the same language
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
        className={`fixed inset-0  bg-white/80 backdrop-blur-sm z-[60] transition-opacity duration-500 flex items-center justify-center ${
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
                  onClick={() => scrollToSection("start")}
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
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg py-3 hidden group-hover:block border border-slate-100 dark:border-slate-700">
                    <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                    <button
                      onClick={() => scrollToSection("for-clients")}
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{t("forClients")}</span>
                    </button>
                    <button
                      onClick={() => scrollToSection("for-professionals")}
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
                      onClick={() => scrollToSection("for-business")}
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>{t("forBusiness")}</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => scrollToSection("pricing")}
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
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg py-3 hidden group-hover:block border border-slate-100 dark:border-slate-700">
                  <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                  <button
                    onClick={() => {
                      changeLanguage("pl");
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2"
                  >
                    <span className="font-medium">Polski</span>
                    <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                      (PL)
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage("en");
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2"
                  >
                    <span className="font-medium">English</span>
                    <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                      (EN)
                    </span>
                  </button>
                </div>
              </div>
              <div className="space-x-7 hidden md:flex">
                <button
                  type="button"
                  className="hidden md:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {t("signIn")}
                </button>
                <button
                  type="button"
                  className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all whitespace-nowrap cursor-pointer"
                >
                  {t("getStarted")}
                  <svg
                    className="w-4 h-4 ml-2 -mr-1"
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

              {/* Hamburger menu dla mobilnych */}
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                ref={buttonRef}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile/Tablet menu */}
          <div
            ref={menuRef}
            className={`md:hidden transition-all duration-500 ease-in-out bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 ${
              isMenuOpen
                ? "max-h-[40rem] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="flex flex-col py-6 px-6 space-y-6">
              <button
                onClick={() => scrollToSection("start")}
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
                    onClick={() => scrollToSection("for-clients")}
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
                    onClick={() => scrollToSection("for-professionals")}
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
                    onClick={() => scrollToSection("for-business")}
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
                    onClick={() => scrollToSection("pricing")}
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
                  <button className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-left text-base font-medium cursor-pointer">
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
                  <button className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-medium hover:from-emerald-600 hover:to-teal-600 transition-all whitespace-nowrap cursor-pointer">
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
          </div>
        </div>
      </nav>
    </>
  );
}
