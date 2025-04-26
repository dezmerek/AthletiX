"use client";
import { useState } from "react";

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    <nav className="top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 min-w-max">
          <div className="flex items-center space-x-12">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              AthletiX
            </div>
            <div className="flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("start")}
                className="text-slate-600 hover:text-emerald-500 transition-colors"
              >
                Start
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-slate-600 hover:text-emerald-500 transition-colors">
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
                <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg py-2 hidden group-hover:block border border-slate-100">
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
                className="text-slate-600 hover:text-emerald-500 transition-colors"
              >
                Cennik
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-slate-600 hover:text-emerald-500 hover:bg-slate-50 transition-all"
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
            <div className="relative group">
              <button className="flex items-center space-x-1 px-2 py-1 rounded-md text-slate-600 hover:text-emerald-500 hover:bg-slate-50 transition-all">
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
              className="text-sm font-medium text-slate-600 hover:text-emerald-500 transition-colors"
            >
              Zaloguj się
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
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
          </div>
        </div>
      </div>
    </nav>
  );
}
