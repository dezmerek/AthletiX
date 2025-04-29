"use client";

export default function HeroSection() {
  return (
    <section
      id="start"
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
    >
      <div className="max-w-7xl mx-auto text-center">
        <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
          Witaj w AthletiX
        </span>
        <h1 className="text-5xl sm:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Cyfrowa transformacja
          </span>
          <br />
          <span className="text-slate-800">branży fitness</span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto">
          Kompleksowa platforma łącząca klientów, trenerów, dietetyków i
          właścicieli firm fitness w jednym miejscu.
        </p>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h3 className="text-slate-800 font-bold mb-1 text-lg">
              Dla klientów
            </h3>
            <p className="text-slate-600">
              Treningi, dieta i monitoring postępów
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              👨‍🏫
            </div>
            <h3 className="text-slate-800 font-bold mb-1 text-lg">
              Dla profesjonalistów
            </h3>
            <p className="text-slate-600">
              Narzędzia dla trenerów i dietetyków
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              💼
            </div>
            <h3 className="text-slate-800 font-bold mb-1 text-lg">Dla firm</h3>
            <p className="text-slate-600">Zarządzanie i analityka biznesowa</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
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
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
