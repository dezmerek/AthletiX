"use client";
import { useState } from "react";

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Height of the fixed navigation
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              AthletiX
            </div>
            <div className="hidden sm:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("start")}
                className="text-sm text-slate-600 hover:text-emerald-500 transition-colors"
              >
                Start
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm text-slate-600 hover:text-emerald-500 transition-colors">
                  <span>Oferta</span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-40 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg py-2 hidden group-hover:block border border-slate-100">
                  <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                  <button
                    onClick={() => scrollToSection("dla-klientow")}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-500 transition-all"
                  >
                    Dla klientów
                  </button>
                  <button
                    onClick={() => scrollToSection("dla-profesjonalistow")}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-500 transition-all"
                  >
                    Dla profesjonalistów
                  </button>
                  <button
                    onClick={() => scrollToSection("dla-firm")}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-500 transition-all"
                  >
                    Dla firm
                  </button>
                </div>
              </div>
              <button
                onClick={() => scrollToSection("cennik")}
                className="text-sm text-slate-600 hover:text-emerald-500 transition-colors"
              >
                Cennik
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-md text-slate-600 hover:text-emerald-500 hover:bg-slate-50 transition-all"
            >
              {isDarkMode ? (
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>
            <div className="relative group hidden sm:block">
              <button className="flex items-center space-x-1 p-1.5 rounded-md text-slate-600 hover:text-emerald-500 hover:bg-slate-50 transition-all">
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
                <span className="text-sm font-medium">PL</span>
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
              <div className="absolute right-0 mt-2 w-28 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg py-1 hidden group-hover:block border border-slate-100">
                <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                <button className="w-full px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-500 text-left font-medium transition-all">
                  English
                </button>
                <button className="w-full px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-500 text-left font-medium transition-all">
                  Polski
                </button>
              </div>
            </div>
            <button
              type="button"
              className="hidden sm:block text-sm font-medium text-slate-600 hover:text-emerald-500 transition-colors"
            >
              Zaloguj się
            </button>
            <button
              type="button"
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              Rozpocznij
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

            {/* Hamburger menu dla mobilnych */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          className={`sm:hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-100 ${
            isMenuOpen
              ? "max-h-[40rem] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col py-6 px-6 space-y-6">
            <button
              onClick={() => scrollToSection("start")}
              className="flex items-center space-x-3 text-slate-700 hover:text-emerald-500 transition-colors text-left text-base font-medium"
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
              <span>Start</span>
            </button>

            <div className="space-y-4">
              <span className="flex items-center space-x-3 text-slate-400 uppercase tracking-wider text-xs font-medium">
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
                <span>Oferta</span>
              </span>
              <div className="flex flex-col space-y-4 pl-8">
                <button
                  onClick={() => scrollToSection("dla-klientow")}
                  className="flex items-center space-x-3 text-slate-600 hover:text-emerald-500 transition-colors text-left"
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
                  <span>Dla klientów</span>
                </button>
                <button
                  onClick={() => scrollToSection("dla-profesjonalistow")}
                  className="flex items-center space-x-3 text-slate-600 hover:text-emerald-500 transition-colors text-left"
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Dla profesjonalistów</span>
                </button>
                <button
                  onClick={() => scrollToSection("dla-firm")}
                  className="flex items-center space-x-3 text-slate-600 hover:text-emerald-500 transition-colors text-left"
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
                  <span>Dla firm</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => scrollToSection("cennik")}
              className="flex items-center space-x-3 text-slate-700 hover:text-emerald-500 transition-colors text-left text-base font-medium"
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
              <span>Cennik</span>
            </button>

            {/* Language Selector */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="flex items-center space-x-3 text-slate-400 uppercase tracking-wider text-xs font-medium">
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
                <span>Język</span>
              </span>
              <div className="flex flex-col space-y-4 pl-8">
                <button className="flex items-center justify-between text-slate-600 hover:text-emerald-500 transition-all w-full">
                  <div className="flex items-center space-x-3">
                    <span>English</span>
                  </div>
                  <span className="text-xs text-slate-400">EN</span>
                </button>
                <button className="flex items-center justify-between text-slate-600 hover:text-emerald-500 transition-all w-full">
                  <div className="flex items-center space-x-3">
                    <span>Polski</span>
                  </div>
                  <span className="text-xs text-slate-400">PL</span>
                </button>
              </div>
            </div>

            {/* Auth buttons */}
            <div className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
              <button className="flex items-center space-x-3 text-slate-700 hover:text-emerald-500 transition-colors text-left text-base font-medium">
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
                <span>Zaloguj się</span>
              </button>
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-medium hover:from-emerald-600 hover:to-teal-600 transition-all">
                <span>Rozpocznij</span>
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
    </nav>
  );
}
