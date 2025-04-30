"use client";

export default function SecuritySection() {
  return (
    <section id="bezpieczenstwo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Bezpieczeństwo i zgodność
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-slate-100 hover:border-cyan-100 transition-colors">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              Ochrona danych
            </h3>
            <p className="text-slate-600">
              Pełna zgodność z RODO i najwyższe standardy bezpieczeństwa danych
              osobowych
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-100 hover:border-cyan-100 transition-colors">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              Analiza danych
            </h3>
            <p className="text-slate-600">
              Zaawansowana analityka i raporty z zachowaniem prywatności
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-100 hover:border-cyan-100 transition-colors">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              Kopie zapasowe
            </h3>
            <p className="text-slate-600">
              Regularne backupy i bezpieczne przechowywanie danych
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
