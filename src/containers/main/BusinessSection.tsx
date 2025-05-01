"use client";

export default function BusinessSection() {
  return (
    <section
      id="for-business"
      className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
            Dla firm fitness
          </span>
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Cyfrowa transformacja
            </span>
            <span className="text-slate-800"> Twojego biznesu</span>
          </h2>
          <p className="text-slate-600 text-xl max-w-2xl mx-auto">
            Kompleksowe rozwiązanie do zarządzania firmą fitness
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-3xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-4 text-slate-800">
              Zarządzanie biznesem
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Harmonogramy zajęć
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Zarządzanie członkostwami
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                System płatności
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Zarządzanie personelem
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-4 text-slate-800">
              Analityka biznesowa
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Raporty finansowe
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Statystyki członkostwa
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Analiza trendów
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Prognozy biznesowe
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-4 text-slate-800">
              Integracja zespołu
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Portal pracowniczy
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Komunikacja wewnętrzna
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Zarządzanie zadaniami
              </li>
              <li className="flex items-center text-slate-600">
                <span className="mr-2 text-blue-500">✓</span>
                Harmonogramy pracy
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
