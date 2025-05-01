"use client";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth",
      });
    }
  };

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
                  onClick={() => scrollToSection("dla-klientow")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dla klientów
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("dla-profesjonalistow")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dla profesjonalistów
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("dla-firm")}
                  className="hover:text-white transition-colors cursor-pointer"
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
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dokumentacja
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Centrum pomocy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Wsparcie
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-3">Kontakt</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Napisz do nas
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Demo
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cennik
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                Polityka prywatności
              </button>
              <span className="text-slate-600">•</span>
              <button className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                Regulamin
              </button>
            </div>
            <p className="text-xs text-slate-400">
              © 2025 AthletiX. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
