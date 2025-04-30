"use client";

export default function ProfessionalSection() {
  return (
    <section
      id="dla-profesjonalistow"
      className="py-20 bg-gradient-to-br from-cyan-500 to-blue-600"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Dla profesjonalistów
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">
            Narzędzia dla profesjonalistów
          </h2>
          <p className="text-cyan-100 text-xl max-w-2xl mx-auto">
            Kompleksowe rozwiązania dla trenerów personalnych i dietetyków
          </p>
        </div>

        {/* Main Professional Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Trainer Tools */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-3xl mb-4">👨‍🏫</div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Dla trenerów personalnych
            </h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-cyan-200 font-bold mb-3">
                  Zarządzanie klientami
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">
                      Profile i postępy klientów
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">
                      Tworzenie planów treningowych
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">
                      Monitorowanie postępów
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-200 font-bold mb-3">
                  Narzędzia treningowe
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">Baza ćwiczeń i planów</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">
                      Kalkulatory treningowe
                    </span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">Analiza techniki</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dietitian Tools */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-3xl mb-4">👩‍⚕️</div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Dla dietetyków
            </h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-cyan-200 font-bold mb-3">
                  Zarządzanie dietą
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">
                      Tworzenie planów żywieniowych
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">
                      Kalkulatory dietetyczne
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">
                      Baza produktów i przepisów
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-200 font-bold mb-3">
                  Monitorowanie postępów
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">Analiza składu diety</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">Dzienniki żywieniowe</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-cyan-300 mt-1">✓</span>
                    <span className="text-white/90">Raporty i analizy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Professional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="text-3xl mb-4">📊</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Analityka biznesowa
            </h4>
            <p className="text-cyan-100">
              Zaawansowane raporty i statystyki dla rozwoju Twojej praktyki
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="text-3xl mb-4">💬</div>
            <h4 className="text-lg font-bold text-white mb-2">Komunikacja</h4>
            <p className="text-cyan-100">
              Wbudowany system komunikacji z klientami i współpracownikami
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="text-3xl mb-4">📈</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Rozwój biznesu
            </h4>
            <p className="text-cyan-100">
              Narzędzia do rozwoju Twojej praktyki i zwiększania przychodów
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
