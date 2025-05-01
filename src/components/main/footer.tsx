"use client";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              AthletiX
            </span>
            <p className="mt-4 text-slate-400 text-sm">
              Kompleksowa platforma fitness łącząca klientów, trenerów i kluby
              sportowe. Trenuj, zarządzaj i rozwijaj się z nami.
            </p>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-3">Platforma</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  type="button"
                  className="hover:text-white transition-colors"
                >
                  Dla klientów
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:text-white transition-colors"
                >
                  Dla profesjonalistów
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:text-white transition-colors"
                >
                  Dla firm
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-3">Zasoby</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Dokumentacja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Centrum pomocy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Wsparcie
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-3">Kontakt</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Napisz do nas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Demo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cennik
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-slate-400">
            {" "}
            2025 AthletiX. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a
              href="#"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Polityka prywatności
            </a>
            <a
              href="#"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Regulamin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
