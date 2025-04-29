"use client";

export default function ClientSection() {
  return (
    <section
      id="dla-klientow"
      className="py-20 bg-gradient-to-br from-teal-50 via-white to-cyan-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
          Dla klientów
        </span>
        <h2 className="text-4xl font-bold mb-16">
          <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Osiągnij swoje cele{" "}
          </span>
          <span className="text-slate-800">z AthletiX</span>
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              Plan treningowy
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Spersonalizowane plany
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Biblioteka ćwiczeń
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Instrukcje wideo
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              Monitoring postępów
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Śledzenie wyników
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Statystyki treningowe
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Analiza postępów
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="text-3xl mb-4">🥗</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              Plan dietetyczny
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Plany żywieniowe
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Liczenie kalorii
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-teal-500">✓</span>
                Przepisy i porady
              </li>
            </ul>
          </div>
        </div>

        {/* App Preview */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Wszystko w jednej aplikacji
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <span className="text-teal-300">✓</span>
                  <span>Kalendarz treningów</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-teal-300">✓</span>
                  <span>Dziennik żywieniowy</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-teal-300">✓</span>
                  <span>Pomiary i statystyki</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-teal-300">✓</span>
                  <span>Społeczność i wsparcie</span>
                </li>
              </ul>
              <button
                type="button"
                className="mt-8 bg-white text-teal-600 px-6 py-3 rounded-full hover:shadow-lg transition-all transform hover:scale-105"
              >
                Rozpocznij za darmo
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl transform rotate-6"></div>
              <div className="relative bg-slate-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
